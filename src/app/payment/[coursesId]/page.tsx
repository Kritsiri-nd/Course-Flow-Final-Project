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
        if (!userId || !courseId || !course) {
            alert("กรุณารอให้ระบบโหลดเสร็จ");
            return;
        }

        setLoading(true);

        try {
            // Generate reference number and timestamp
            const refNo = `CF${Date.now()}`;
            const createdAt = Date.now();

            // Create PromptPay charge using our API (same as QR display page)
            const response = await fetch('/api/payment/create-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: course.price * 100, // Convert to satang
                    currency: 'thb',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert("สร้าง QR Code ไม่สำเร็จ: " + (data.error || "Unknown error"));
                setLoading(false);
                return;
            }

            // Extract QR image URL from different possible response structures
            let qrImageUrl = '';
            if (data && data.source && data.source.scannable_code && data.source.scannable_code.image) {
                qrImageUrl = data.source.scannable_code.image.download_uri || data.source.scannable_code.image;
            } else if (data && data.scannable_code && data.scannable_code.image) {
                qrImageUrl = data.scannable_code.image.download_uri || data.scannable_code.image;
            } else if (data && data.source && data.source.image) {
                qrImageUrl = data.source.image.download_uri || data.source.image;
            } else if (data && data.image) {
                qrImageUrl = data.image.download_uri || data.image;
            }

            if (data && data.id && qrImageUrl) {
                // Save payment record to database
                try {
                    await fetch('/api/payment/checkout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            course_id: parseInt(courseId as string),
                            user_id: userId,
                            method: 'promptpay',
                            charge_id: data.id
                        })
                    });
                } catch (error) {
                    console.error('Error saving payment record:', error);
                }

                // Redirect to QR display page with all necessary parameters
                const qrDisplayUrl = new URL(`/payment/${courseId}/qr-display`, window.location.origin);
                qrDisplayUrl.searchParams.set('chargeId', data.id);
                qrDisplayUrl.searchParams.set('referenceNo', refNo);
                qrDisplayUrl.searchParams.set('qrUrl', qrImageUrl);
                qrDisplayUrl.searchParams.set('createdAt', createdAt.toString());

                window.location.href = qrDisplayUrl.toString();
            } else {
                // Redirect to fail page instead of showing alert
                window.location.href = `/payment/${courseId}/fail?error=${encodeURIComponent("QR Code response ไม่ถูกต้อง")}&method=qr`;
            }
        } catch (error) {
            console.error('Error:', error);
            // Redirect to fail page instead of showing alert
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            window.location.href = `/payment/${courseId}/fail?error=${encodeURIComponent("เกิดข้อผิดพลาด: " + errorMessage)}&method=qr`;
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
                        // ตรวจสอบ error response structure ที่เป็นไปได้
                        let errorMessage = "Unknown error";
                        
                        if (response && typeof response === 'object') {
                            const errorResponse = response as any;
                            errorMessage = errorResponse.failure_message ||
                                         errorResponse.message || 
                                         errorResponse.error || 
                                         errorResponse.description || 
                                         errorResponse.code ||
                                         errorResponse.failure_code ||
                                         JSON.stringify(errorResponse);
                        }
                        
                        let userFriendlyMessage = "";
                        
                        // แปลง error message ให้เป็นภาษาไทยที่เข้าใจง่าย
                        const errorLower = errorMessage.toLowerCase();
                        
                        // ตรวจสอบ Omise failure codes ตาม test cards
                        if (errorLower.includes("insufficient_fund")) {
                            userFriendlyMessage = "ยอดเงินในบัตรไม่เพียงพอ";
                        } else if (errorLower.includes("stolen_or_lost_card")) {
                            userFriendlyMessage = "บัตรถูกระบุว่าเป็นบัตรที่สูญหายหรือถูกขโมย";
                        } else if (errorLower.includes("failed_processing")) {
                            userFriendlyMessage = "เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง";
                        } else if (errorLower.includes("payment_rejected")) {
                            userFriendlyMessage = "การชำระเงินถูกปฏิเสธ";
                        } else if (errorLower.includes("failed_fraud_check")) {
                            userFriendlyMessage = "การตรวจสอบความปลอดภัยล้มเหลว กรุณาติดต่อธนาคาร";
                        } else if (errorLower.includes("invalid_account_number")) {
                            userFriendlyMessage = "หมายเลขบัญชีไม่ถูกต้อง";
                        } else if (errorLower.includes("invalid_card_number") || 
                                   errorLower.includes("invalid card") ||
                                   errorLower.includes("card_number_invalid")) {
                            userFriendlyMessage = "หมายเลขบัตรเครดิตไม่ถูกต้อง";
                        } else if (errorLower.includes("invalid_expiry") || 
                                   errorLower.includes("invalid expiration") ||
                                   errorLower.includes("expiry_invalid")) {
                            userFriendlyMessage = "วันหมดอายุบัตรไม่ถูกต้อง";
                        } else if (errorLower.includes("invalid_security_code") || 
                                   errorLower.includes("invalid cvv") || 
                                   errorLower.includes("invalid cvc") ||
                                   errorLower.includes("security_code_invalid")) {
                            userFriendlyMessage = "รหัส CVV/CVC ไม่ถูกต้อง";
                        } else if (errorLower.includes("card_declined") || 
                                   errorLower.includes("declined") ||
                                   errorLower.includes("card_declined_by_bank")) {
                            userFriendlyMessage = "บัตรถูกปฏิเสธโดยธนาคาร";
                        } else if (errorLower.includes("expired_card") || 
                                   errorLower.includes("expired") ||
                                   errorLower.includes("card_expired")) {
                            userFriendlyMessage = "บัตรหมดอายุแล้ว";
                        } else if (errorLower.includes("network") || 
                                   errorLower.includes("connection") ||
                                   errorLower.includes("timeout")) {
                            userFriendlyMessage = "เกิดปัญหาการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง";
                        } else if (errorLower.includes("unknown error") || 
                                   errorLower.includes("unknown") ||
                                   errorMessage === "Unknown error") {
                            // ถ้าเป็น unknown error ให้แสดงข้อความทั่วไป
                            userFriendlyMessage = "ข้อมูลบัตรเครดิตไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง";
                        } else {
                            // แสดง error message เดิมพร้อมข้อความอธิบาย
                            userFriendlyMessage = `ข้อมูลบัตรเครดิตไม่ถูกต้อง: ${errorMessage}`;
                        }
                        
                        window.location.href = `/payment/${courseId}/fail?error=${encodeURIComponent(userFriendlyMessage)}&method=card`;
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
                        // redirect ไปหน้า success
                        window.location.href = `/payment/${courseId}/success`;
                    } else {
                        // redirect ไปหน้า fail
                        let errorMessage = data.failure_message || 
                                         data.error || 
                                         data.message || 
                                         data.failure_code ||
                                         "Unknown error";
                        
                        // แปลง error message ให้เป็นภาษาไทยที่เข้าใจง่าย
                        const errorLower = errorMessage.toLowerCase();
                        
                        // ตรวจสอบ Omise failure codes ตาม test cards
                        if (errorLower.includes("insufficient_fund")) {
                            errorMessage = "ยอดเงินในบัตรไม่เพียงพอ";
                        } else if (errorLower.includes("stolen_or_lost_card")) {
                            errorMessage = "บัตรถูกระบุว่าเป็นบัตรที่สูญหายหรือถูกขโมย";
                        } else if (errorLower.includes("failed_processing")) {
                            errorMessage = "เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง";
                        } else if (errorLower.includes("payment_rejected")) {
                            errorMessage = "การชำระเงินถูกปฏิเสธ";
                        } else if (errorLower.includes("failed_fraud_check")) {
                            errorMessage = "การตรวจสอบความปลอดภัยล้มเหลว กรุณาติดต่อธนาคาร";
                        } else if (errorLower.includes("invalid_account_number")) {
                            errorMessage = "หมายเลขบัญชีไม่ถูกต้อง";
                        } else if (errorLower.includes("card_declined") || errorLower.includes("declined")) {
                            errorMessage = "บัตรถูกปฏิเสธโดยธนาคาร กรุณาติดต่อธนาคาร";
                        } else if (errorLower.includes("expired_card") || errorLower.includes("expired")) {
                            errorMessage = "บัตรหมดอายุแล้ว กรุณาใช้บัตรอื่น";
                        } else if (errorLower.includes("processing_error") || errorLower.includes("processing")) {
                            errorMessage = "เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง";
                        } else if (errorLower.includes("network") || errorLower.includes("connection")) {
                            errorMessage = "เกิดปัญหาการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง";
                        } else if (errorLower.includes("timeout")) {
                            errorMessage = "การประมวลผลใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง";
                        }
                        
                        window.location.href = `/payment/${courseId}/fail?error=${encodeURIComponent(errorMessage)}&method=card`;
                    }
                    setLoading(false);
                }
            );
        } catch (error) {
            console.error('Error:', error);
            // redirect ไปหน้า fail
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            window.location.href = `/payment/${courseId}/qr-display?status=failed&error=${encodeURIComponent(errorMessage)}`;
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
            <Footer />
        </div>
    );
}