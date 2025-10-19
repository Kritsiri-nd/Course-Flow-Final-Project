"use client";
import Link from "next/link"
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from '@/lib/supabaseClient';
import OrderSummary from "@/components/payment/OrderSummary";
import PaymentForm from "@/components/payment/PaymentForm";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { LuArrowLeft } from "react-icons/lu";
import { validateCardData } from "@/lib/validators";

type PaymentMethod = 'card' | 'qr';

declare global {
    interface Window {
        Omise: {
            setPublicKey: (key: string) => void;
            createSource: (type: string, params: Record<string, unknown>, callback: (status: number, response: unknown) => void) => void;
            createToken: (type: string, params: Record<string, unknown>, callback: (status: number, response: unknown) => void) => void;
        };
    }
}

export default function PaymentPage() {
    const params = useParams();
    const courseId = params?.coursesId;
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [omiseKey, setOmiseKey] = useState<string | null>(null);
    const [course, setCourse] = useState<{ id: number; title: string; price: number; currency: string } | null>(null);
    const supabase = createClient();

    // Form states
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });
    const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
    // const [qrData, setQrData] = useState<{ scannable_code?: { image?: string } } | null>(null);

    // Get user from Supabase
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();
    }, [supabase.auth]);

    // Get Omise key from API
    useEffect(() => {
        const getOmiseKey = async () => {
            try {
                const res = await fetch('/api/payment/omise-key');
                if (res.ok) {
                    const data = await res.json();
                    setOmiseKey(data.publicKey);
                }
            } catch (error) {
                console.error('Error fetching Omise key:', error);
            }
        };
        getOmiseKey();
    }, []);

    // Get course data
    useEffect(() => {
        const getCourse = async () => {
            if (courseId) {
                try {
                    const res = await fetch(`/api/courses/${courseId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setCourse(data);
                    }
                } catch (error) {
                    console.error('Error fetching course:', error);
                }
            }
        };
        getCourse();
    }, [courseId]);


    // Load Omise script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.omise.co/omise.js';
        script.async = true;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const handleCardInputChange = (field: string, value: string) => {
        setCardData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for this field when user starts typing
        if (cardErrors[field]) {
            setCardErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const formatCardNumber = (value: string) => {
        return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (value: string) => {
        return value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
    };

    const handlePromptPay = async (promoCodeData?: any) => {
        if (!userId || !courseId || !course) {
            alert("Please wait for the system to load completely.");
            return;
        }
    
        setLoading(true);
    
        try {
            // Call the single, secure checkout endpoint
            const response = await fetch('/api/payment/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    course_id: parseInt(courseId as string),
                    user_id: userId,
                    method: 'promptpay',
                    promo_code_id: promoCodeData?.id || null, // Send promo code ID if available
                }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                // Redirect to fail page with error from backend
                const errorMessage = data.error || "Failed to initiate QR payment";
                window.location.href = `/payment/${courseId}/fail?error=${encodeURIComponent(errorMessage)}&method=qr`;
                return;
            }
    
            const qrImageUrl = data.source?.scannable_code?.image?.download_uri;
    
            if (data.id && qrImageUrl) {
                // Redirect to QR display page, passing all necessary data via URL params
                const refNo = `CF${Date.now()}`;
                const createdAt = Date.now();
                const qrDisplayUrl = new URL(`/payment/${courseId}/qr-display`, window.location.origin);
                
                qrDisplayUrl.searchParams.set('chargeId', data.id);
                qrDisplayUrl.searchParams.set('referenceNo', refNo);
                qrDisplayUrl.searchParams.set('qrUrl', qrImageUrl);
                qrDisplayUrl.searchParams.set('createdAt', createdAt.toString());
                if (promoCodeData?.id) {
                    qrDisplayUrl.searchParams.set('promoCodeId', promoCodeData.id.toString());
                }
    
                window.location.href = qrDisplayUrl.toString();
            } else {
                // Handle cases where the response is missing QR data
                window.location.href = `/payment/${courseId}/fail?error=${encodeURIComponent("Invalid response from server when creating QR code.")}&method=qr`;
            }
    
        } catch (error) {
            console.error('Error handling PromptPay:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            window.location.href = `/payment/${courseId}/fail?error=${encodeURIComponent(errorMessage)}&method=qr`;
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (promoCodeData?: any) => {
        if (paymentMethod === 'qr') {
            await handlePromptPay(promoCodeData);
            return;
        }

        // Validate card data before creating token
        const validation = validateCardData(cardData);
        
        if (!validation.isValid) {
            setCardErrors(validation.errors);
            setLoading(false);
            return;
        }

        // Clear errors if validation passes
        setCardErrors({});

        if (!userId || !courseId || !omiseKey || !window.Omise) {
            alert("กรุณารอให้ระบบโหลดเสร็จ");
            return;
        }

        setLoading(true);

        try {
            const Omise = window.Omise;
            Omise.setPublicKey(omiseKey);

            // Create token from card data
            Omise.createToken(
                "card",
                {
                    name: cardData.name,
                    number: cardData.number.replace(/\s/g, ''),
                    expiration_month: cardData.expiry.split('/')[0],
                    expiration_year: '20' + cardData.expiry.split('/')[1],
                    security_code: cardData.cvv,
                },
                async (status: number, response: unknown) => {
                    if (status !== 200) {
                        window.location.href = `/payment/${courseId}/fail?method=card`;
                        return;
                    }

                    const token = (response as { id: string }).id;
                    const res = await fetch("/api/payment/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            course_id: parseInt(courseId as string),
                            user_id: userId,
                            method: "card",
                            token,
                            promo_code_id: promoCodeData?.id || null, // ส่งเฉพาะ ID
                            // ❌ ไม่ส่ง discount_amount, original_amount, final_amount จาก Frontend
                        }),
                    });

                    const data = await res.json();
                    if (data.paid) {
                        // redirect ไปหน้า success
                        window.location.href = `/payment/${courseId}/success`;
                    } else {
                        // redirect ไปหน้า fail
                        window.location.href = `/payment/${courseId}/fail?method=card`;
                    }
                    setLoading(false);
                }
            );
        } catch (error) {
            console.error('Error:', error);
            // redirect ไปหน้า fail
            window.location.href = `/payment/${courseId}/fail?method=card`;
        }
    };

    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-center">

                        {/* Main Content */}
                        <div className="w-full">
                            {/* Back Button */}
                            <div className="border-none mb-3">
                                <div className="max-w-[1240px] mx-auto">
                                    <Link href={`/non-user/courses/${courseId}`}>
                                        <Button variant="ghost" className="gap-2 text-b2 text-blue-500">
                                            <LuArrowLeft className="w-4 h-4" />
                                            Back
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <h1 className="sm:text-h2 text-h3 text-black mb-10">
                                Enter payment info to start<br></br>your subscription
                            </h1>

                            <PaymentForm
                                paymentMethod={paymentMethod}
                                onPaymentMethodChange={setPaymentMethod}
                                cardData={cardData}
                                onCardDataChange={handleCardInputChange}
                                formatCardNumber={formatCardNumber}
                                formatExpiry={formatExpiry}
                                cardErrors={cardErrors}
                            />
                        </div>

                        {/* Order Summary */}
                        <div className="w-full">
                            <OrderSummary
                                course={course}
                                paymentMethod={paymentMethod}
                                loading={loading}
                                omiseKey={omiseKey}
                                userId={userId || ''}
                                onSubmit={handleSubmit}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}