"use client";
import PaymentMethodSelection from "./PaymentMethodSelection";
import CreditCardForm from "./CreditCardForm";
import QRPaymentRedirect from "./QRPaymentRedirect";

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
}

export default function PaymentForm({
    paymentMethod,
    onPaymentMethodChange,
    cardData,
    onCardDataChange,
    formatCardNumber,
    formatExpiry
}: PaymentFormProps) {
    return (
        <form id="payment-form" className="space-y-8">
            {/* Payment Method Selection */}
            <PaymentMethodSelection
                paymentMethod={paymentMethod}
                onPaymentMethodChange={onPaymentMethodChange}
            />

            {/* Credit Card Form */}
            {paymentMethod === 'card' && (
                <CreditCardForm
                    cardData={cardData}
                    onCardDataChange={onCardDataChange}
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={onPaymentMethodChange}
                    formatCardNumber={formatCardNumber}
                    formatExpiry={formatExpiry}
                />
            )}
            {/* QR Payment Option */}
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
            {/* QR Payment Redirect Message */}
            {paymentMethod === 'qr' && <QRPaymentRedirect />}
        </form>
        
    );
}
