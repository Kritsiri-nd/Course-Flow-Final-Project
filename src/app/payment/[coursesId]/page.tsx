"use client";
import Link from "next/link"
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from '@/lib/supabaseClient';
import Image from "next/image";

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
    const [promoCode, setPromoCode] = useState('');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 max-w-[739px] ">
                        <Link href="/non-user/courses" className="text-blue-500 hover:text-blue-600 mb-6 inline-block text-[16px] font-bold">
                            ← Back
                        </Link>

                        <h1 className="text-h2 text-black mb-8">
                            Enter payment info to start<br></br>your subscription
                        </h1>

                        <form id="payment-form" onSubmit={handleSubmit} className="space-y-8 ">
                            {/* Payment Method Selection */}
                            <div>
                                <h2 className="text-b2 font-regular text-gray-700 mb-4">Select payment method</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={(paymentMethod as PaymentMethod) === 'card'}
                                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                            className="w-4 h-4 text-blue-500"
                                        />
                                        <span className="text-gray-800 text-[16px] font-medium">Credit card / Debit card</span>
                                    </label>

                                </div>
                            </div>

                            {/* Credit Card Form */}
                            {paymentMethod === 'card' && (
                                <div className="bg-gray-200 p-6 rounded-lg space-y-6">
                                    {/* Card Number */}
                                    <div className="flex flex-row ">
                                        <div>
                                            <label className="block text-b2 font-regular text-black mb-2">
                                                Card number
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Card number"
                                                value={cardData.number}
                                                onChange={(e) => handleCardInputChange('number', formatCardNumber(e.target.value))}
                                                className="text-b2 font-regular text-gray-600 w-full max-w-[453px] px-3 py-2 border-1 border-gray-400 rounded-sm bg-white"
                                                maxLength={19}
                                            />
                                        </div>
                                        <div className="flex  mt-2">
                                            <Image src="/assets/visa-logo.png" alt="VISA" width={50} height={20} />
                                            <Image src="/assets/mastercard-logo.png" alt="Mastercard" width={46} height={50} />

                                        </div>
                                    </div>

                                    {/* Name on Card */}
                                    <div>
                                        <label className="block text-b2 font-regular text-black mb-2">
                                            Name on card
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Name on card"
                                            value={cardData.name}
                                            onChange={(e) => handleCardInputChange('name', e.target.value)}
                                            className="text-b2 font-regular text-gray-600 w-full px-3 py-2 border-1 border-gray-400 rounded-sm bg-white"
                                        />
                                    </div>

                                    {/* Expiry and CVV */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-b2 font-regular text-black mb-2">
                                                Expiry date
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                value={cardData.expiry}
                                                onChange={(e) => handleCardInputChange('expiry', formatExpiry(e.target.value))}
                                                className="text-b2 font-regular text-gray-600 w-full px-3 py-2 border-1 border-gray-400 rounded-sm bg-white"
                                                maxLength={5}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-b2 font-regular text-black mb-2">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="CVV"
                                                value={cardData.cvv}
                                                onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                                                className="text-b2 font-regular text-gray-600 w-full px-3 py-2 border-1 border-gray-400 rounded-sm bg-white"
                                                maxLength={4}
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="qr"
                                            checked={(paymentMethod as PaymentMethod) === 'qr'}
                                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                            className="w-4 h-4 text-blue-500"
                                        />
                                        <span className="text-gray-800 text-[16px] font-medium">QR Payment</span>
                                    </label>
                                </div>
                            )}

                            {/* QR Payment Redirect Message */}
                            {paymentMethod === 'qr' && (
                                <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">กำลังนำไปยังหน้า QR Code...</p>
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1 max-w-[357px]">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
                            <h2 className="text-[14px] font-regular text-orange-500 mb-6">Summary</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-b2 font-regular text-gray-700">Subscription</label>
                                    <p className="text-black text-h3 font-medium">{course.title}</p>
                                </div>

                                <div className="flex items-center justify-between space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Promo code"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className="w-full max-w-[205px] px-3 py-2 border-1 border-gray-400 rounded-md"
                                    />
                                    <button
                                        type="button"
                                        className="box-shadow1 mt-2 px-4 py-2 bg-gray-200 text-[16px] font-bold text-gray-600 rounded-md hover:blue-500 hover:text-white"
                                    >
                                        Apply
                                    </button>
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-black text-b2 font-regular">Subtotal</span>
                                        <span className="text-gray-700 text-b2 font-regular">{course.price.toLocaleString()}.00</span>
                                    </div>
                                    <div className="flex flex-row  justify-between">
                                        <span className="text-black text-b2 font-regular">Payment method</span>
                                        <div className="text-right">
                                            {paymentMethod === 'card' ? (
                                                <>
                                                    <div className="text-gray-700 text-b2 font-regular">Credit card / Debit </div>
                                                    <div className="text-gray-700 text-b2 font-regular">card</div>
                                                </>
                                            ) : (
                                                <span className="text-gray-700 text-b2 font-regular">QR Payment</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-black text-b2 font-regular">Total</span>
                                        <span className="text-gray-700 text-h3 font-medium">THB {course.price.toLocaleString()}.00</span>
                                    </div>
                                </div>

                                {/* Place Order Button */}
                                {paymentMethod === 'card' && (
                                    <button
                                        type="submit"
                                        form="payment-form"
                                        disabled={loading || !omiseKey}
                                        className="w-full bg-blue-500 text-white py-4 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                    >
                                        {loading ? "Processing..." : "Place order"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}