"use client";
import { useState } from "react";

interface PromoCodeValidation {
  valid: boolean;
  promoCode?: {
    id: number;
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    originalAmount: number;
    finalAmount: number;
    minPurchaseAmount: number;
  };
  course?: {
    id: number;
    title: string;
    price: number;
    currency: string;
  };
  error?: string;
}

interface OrderSummaryProps {
    course: {
        id: number;
        title: string;
        price: number;
        currency: string;
    };
    paymentMethod: 'card' | 'qr';
    loading: boolean;
    omiseKey: string | null;
    onSubmit: (promoCodeData?: PromoCodeValidation['promoCode']) => void;
    userId: string;
}

export default function OrderSummary({
    course,
    paymentMethod,
    loading,
    omiseKey,
    onSubmit,
    userId
}: OrderSummaryProps) {
    const [promoCode, setPromoCode] = useState('');
    const [promoValidation, setPromoValidation] = useState<PromoCodeValidation | null>(null);
    const [validating, setValidating] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState<PromoCodeValidation['promoCode'] | null>(null);

    const validatePromoCode = async () => {
        if (!promoCode.trim()) {
            setPromoValidation(null);
            setAppliedPromo(null);
            return;
        }

        setValidating(true);
        try {
            const response = await fetch('/api/promo/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    promoCode: promoCode.trim(),
                    courseId: course.id,
                    userId: userId
                }),
            });

            const data = await response.json();
            setPromoValidation(data);

            if (data.valid) {
                setAppliedPromo(data.promoCode);
            } else {
                setAppliedPromo(null);
            }
        } catch (error) {
            console.error('Error validating promo code:', error);
            setPromoValidation({
                valid: false,
                error: 'Failed to validate promo code'
            });
            setAppliedPromo(null);
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = () => {
        onSubmit(appliedPromo || undefined);
    };

    const removePromoCode = () => {
        setPromoCode('');
        setPromoValidation(null);
        setAppliedPromo(null);
    };

    const displayPrice = appliedPromo ? appliedPromo.finalAmount : course.price;
    const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;

    return (
        <div className="lg:col-span-1 lg:max-w-[380px] max-w-[500px]">
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 sticky top-8">

                <h2 className="text-[14px] font-regular text-orange-500 mb-6">Summary</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-b2 font-regular text-gray-700 mb-4">Subscription</label>
                        <p className="text-black text-h3 font-medium">{course.title}</p>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <input
                            type="text"
                            placeholder="Promo code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="w-full max-w-[205px] px-3 py-2 border-1 border-gray-400 rounded-md"
                            disabled={validating}
                        />
                        <button
                            type="button"
                            onClick={validatePromoCode}
                            disabled={validating || !promoCode.trim()}
                            className="px-4 py-2 bg-gray-200 text-[16px] font-bold text-gray-600 rounded-md hover:bg-blue-500 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed "
                        >
                            {validating ? "..." : "Apply"}
                        </button>
                    </div>

                    {/* แสดงผลการตรวจสอบโปรโมโค้ด - เฉพาะเมื่อ fail */}
                    {promoValidation && !promoValidation.valid && (
                        <div className="text-sm text-red-600 mt-1">
                            {promoValidation.error}
                        </div>
                    )}

                    <div className="pt-4 space-y-4">
                        <div className="flex justify-between">
                            <span className="text-black text-b2 font-regular">Subtotal</span>
                            <span className="text-gray-700 text-b2 font-regular">
                                {course.price.toLocaleString()}.00
                            </span>
                        </div>

                        {/* แสดงส่วนลดถ้ามี */}
                        {appliedPromo && discountAmount > 0 && (
                            <div className="flex justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-b2 font-regular">
                                        Discount
                                    </span>
                                    <button
                                        type="button"
                                        onClick={removePromoCode}
                                        className="text-red-600 hover:text-red-800 underline text-xs"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <span className="text-b2 font-regular text-[#9B2FAC]">
                                    -{discountAmount.toLocaleString()}.00
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span className="text-black text-b2 font-regular">Payment method</span>
                            <span className="text-gray-700 text-b2 font-regular">
                                {paymentMethod === 'card' ? 'Credit card / Debit card' : 'QR Payment'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-black text-b2 font-regular">Total</span>
                            <span className="text-gray-700 text-h3 font-medium">
                                THB {displayPrice.toLocaleString()}.00
                            </span>
                        </div>
                    </div>

                    {/* Place Order Button */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !omiseKey}
                        className="w-full bg-blue-500 text-white py-4 px-4 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-6"
                    >
                        {loading ? "Processing..." : "Place order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
