"use client";
import Link from "next/link"
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from '@/lib/supabaseClient';
import OrderSummary from "@/components/payment/OrderSummary";
import PaymentForm from "@/components/payment/PaymentForm";

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

    // Redirect to QR display when QR payment is selected
    useEffect(() => {
        if (paymentMethod === 'qr' && course && omiseKey && window.Omise) {
            // Redirect to QR display page
            window.location.href = `/payment/${courseId}/qr-display`;
        }
    }, [paymentMethod, course, omiseKey, courseId]);

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
    };

    const formatCardNumber = (value: string) => {
        return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (value: string) => {
        return value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
    };

    const handlePromptPay = async () => {
        if (!userId || !courseId || !omiseKey || !window.Omise) {
            alert("กรุณารอให้ระบบโหลดเสร็จ");
            return;
        }

        setLoading(true);

        try {
            const Omise = window.Omise;
            Omise.setPublicKey(omiseKey);

            // Create PromptPay source
            Omise.createSource(
                "promptpay",
                {
                    amount: course!.price * 100, // Convert to satang
                    currency: "thb",
                },
                async (status: number, response: unknown) => {
                    console.log('QR Response:', response); // Debug log
                    if (status !== 200) {
                        const errorMessage = (response as { message?: string })?.message || "Unknown error";
                        alert("สร้าง QR Code ไม่สำเร็จ: " + errorMessage);
                        setLoading(false);
                        return;
                    }

                    const qrResponse = response as { scannable_code?: { image?: string } };
                    if (qrResponse && qrResponse.scannable_code && qrResponse.scannable_code.image) {
                        // QR Code created successfully, redirect to QR display page
                        window.location.href = `/payment/${courseId}/qr-display`;
                    } else {
                        alert("QR Code response ไม่ถูกต้อง");
                        console.error('Invalid QR response:', response);
                    }
                    setLoading(false);
                }
            );
        } catch (error) {
            console.error('Error:', error);
            alert("เกิดข้อผิดพลาด: " + error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (paymentMethod === 'qr') {
            await handlePromptPay();
            return;
        }

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
                        const errorMessage = (response as { message?: string })?.message || "Unknown error";
                        alert("ข้อมูลบัตรเครดิตไม่ถูกต้อง: " + errorMessage);
                        setLoading(false);
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
                        }),
                    });

                    const data = await res.json();
                    if (data.paid) {
                        if (data.enrollment_created) {
                            alert("ชำระเงินสำเร็จ! คุณสามารถเข้าเรียนได้แล้ว");
                        } else {
                            alert("ชำระเงินสำเร็จ!");
                        }
                        // Redirect to success page
                        window.location.href = `/payment/${courseId}/success`;
                    } else {
                        alert("ชำระเงินไม่สำเร็จ: " + (data.error || "Unknown error"));
                    }
                    setLoading(false);
                }
            );
        } catch (error) {
            console.error('Error:', error);
            alert("เกิดข้อผิดพลาด: " + error);
            setLoading(false);
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
        <div className="min-h-screen bg-[#FFFFFF]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-end">

                    {/* Main Content */}
                    <div className="w-full">
                        <Link href="/non-user/courses" className="text-blue-500 hover:text-blue-600 mb-6 inline-block text-[16px] font-bold">
                            ← Back
                        </Link>

                        <h1 className="text-h2 text-black mb-10">
                            Enter payment info to start<br></br>your subscription
                        </h1>

                        <PaymentForm
                            paymentMethod={paymentMethod}
                            onPaymentMethodChange={setPaymentMethod}
                            cardData={cardData}
                            onCardDataChange={handleCardInputChange}
                            formatCardNumber={formatCardNumber}
                            formatExpiry={formatExpiry}
                        />
                    </div>

                    {/* Order Summary */}
                    <div className="w-full">
                    <OrderSummary
                        course={course}
                        paymentMethod={paymentMethod}
                        loading={loading}
                        omiseKey={omiseKey}
                        onSubmit={handleSubmit}
                    />
                    </div>
                </div>
            </div>
        </div>
    );
}