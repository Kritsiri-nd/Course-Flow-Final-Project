"use client";
import CreditCardForm from "./CreditCardForm";

type PaymentMethod = 'card' | 'qr';

interface CardData {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
}

interface PaymentFormProps {
    paymentMethod: PaymentMethod;
    onPaymentMethodChange: (method: PaymentMethod) => void;
    cardData: CardData;
    onCardDataChange: (field: string, value: string) => void;
    formatCardNumber: (value: string) => string;
    formatExpiry: (value: string) => string;
    cardErrors?: Record<string, string>;
}

export default function PaymentForm({
    paymentMethod,
    onPaymentMethodChange,
    cardData,
    onCardDataChange,
    formatCardNumber,
    formatExpiry,
    cardErrors = {}
}: PaymentFormProps) {
    return (
        <form id="payment-form" className="space-y-8">
            {/* Select payment method heading */}
            <h2 className="text-b2 font-regular text-gray-700 mb-4">Select payment method</h2>

            {/* Credit Card / Debit Card Section */}
            <div className={`rounded-lg p-6 ${paymentMethod === 'card' ? 'bg-gray-200' : ''}`}>
                <label className="flex items-center space-x-3 cursor-pointer">
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

                {/* Credit Card Form (always rendered, but visually part of the card section) */}
                <div className="mt-6">
                    <CreditCardForm
                        cardData={cardData}
                        onCardDataChange={onCardDataChange}
                        formatCardNumber={formatCardNumber}
                        formatExpiry={formatExpiry}
                        errors={cardErrors}
                    />
                </div>
            </div>

            {/* QR Payment Section */}
            <div className={`rounded-lg p-6 ${paymentMethod === 'qr' ? 'bg-gray-200' : ''}`}>
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="qr"
                        checked={paymentMethod === 'qr'}
                        onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
                        className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-800 text-[16px] font-medium">QR Payment</span>
                </label>
            </div>

        </form>
    );
}
