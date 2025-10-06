"use client";
import Image from "next/image";

type PaymentMethod = 'card' | 'qr';

interface CardData {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
}

interface CreditCardFormProps {
    cardData: CardData;
    onCardDataChange: (field: string, value: string) => void;
    paymentMethod: PaymentMethod;
    onPaymentMethodChange: (method: PaymentMethod) => void;
    formatCardNumber: (value: string) => string;
    formatExpiry: (value: string) => string;
}

export default function CreditCardForm({
    cardData,
    onCardDataChange,
    paymentMethod,
    onPaymentMethodChange,
    formatCardNumber,
    formatExpiry
}: CreditCardFormProps) {
    return (
        <div className="bg-gray-200 border border-gray-200 shadow-sm rounded-lg p-6 space-y-6">

            {/* Card Number */}
            <div className="flex flex-row">
                <div>
                    <label className="block text-b2 font-regular text-black mb-2">
                        Card number
                    </label>
                    <input
                        type="text"
                        placeholder="Card number"
                        value={cardData.number}
                        onChange={(e) => onCardDataChange('number', formatCardNumber(e.target.value))}
                        className="text-b2 font-regular text-gray-600 w-full max-w-[453px] px-3 py-2 border-1 border-gray-400 rounded-sm bg-white"
                        maxLength={19}
                    />
                </div>
                <div className="flex items-center gap-2 mt-8 px-3">
                    <Image src="/assets/visa-logo.png" alt="VISA" width={44} height={14} />
                    <Image src="/assets/mastercard-logo.png" alt="Mastercard" width={36} height={28} />
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
                    onChange={(e) => onCardDataChange('name', e.target.value)}
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
                        onChange={(e) => onCardDataChange('expiry', formatExpiry(e.target.value))}
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
                        onChange={(e) => onCardDataChange('cvv', e.target.value.replace(/\D/g, ''))}
                        className="text-b2 font-regular text-gray-600 w-full px-3 py-2 border-1 border-gray-400 rounded-sm bg-white"
                        maxLength={4}
                    />
                </div>
            </div>


        </div>
    );
}
