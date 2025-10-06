"use client";

type PaymentMethod = 'card' | 'qr';

interface PaymentMethodSelectionProps {
    paymentMethod: PaymentMethod;
    onPaymentMethodChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelection({ 
    paymentMethod, 
    onPaymentMethodChange 
}: PaymentMethodSelectionProps) {
    return (
        <div>
            <h2 className="text-b2 font-regular text-gray-700 mb-4">Select payment method</h2>
            <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer ">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
                        className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-800 text-[16px] font-medium">Credit card / Debit card</span>
                </label>
            
            </div>
        </div>
    );
}
