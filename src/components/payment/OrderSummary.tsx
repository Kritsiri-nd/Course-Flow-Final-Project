"use client";
import { useState } from "react";

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
    onSubmit: () => void;
}

export default function OrderSummary({
    course,
    paymentMethod,
    loading,
    omiseKey,
    onSubmit
}: OrderSummaryProps) {
    const [promoCode, setPromoCode] = useState('');

    return (
        <div className="lg:col-span-1 max-w-[380px]">
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
                        />
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-200 text-[16px] font-bold text-gray-600 rounded-md hover:bg-blue-500 hover:text-white"
                        >
                            Apply
                        </button>
                    </div>

                    <div className=" pt-4 space-y-4">
                        <div className="flex justify-between">
                            <span className="text-black text-b2 font-regular">Subtotal</span>
                            <span className="text-gray-700 text-b2 font-regular">{course.price.toLocaleString()}.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-black text-b2 font-regular">Payment method</span>
                            <span className="text-gray-700 text-b2 font-regular">
                                {paymentMethod === 'card' ? 'Credit card / Debit card' : 'QR Payment'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-black text-b2 font-regular">Total</span>
                            <span className="text-gray-700 text-h3 font-medium">THB {course.price.toLocaleString()}.00</span>
                        </div>
                    </div>

                    {/* Place Order Button */}
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={loading || !omiseKey}
                        className="w-full bg-blue-500 text-white py-4 px-4 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? "Processing..." : "Place order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
