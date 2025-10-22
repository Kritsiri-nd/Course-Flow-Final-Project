"use client";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import InputError from "./InputError";

interface CardData {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
}

interface CreditCardFormProps {
    cardData: CardData;
    onCardDataChange: (field: string, value: string) => void;
    formatCardNumber: (value: string) => string;
    formatExpiry: (value: string) => string;
    errors?: Record<string, string>;
}

export default function CreditCardForm({
    cardData,
    onCardDataChange,
    formatCardNumber,
    formatExpiry,
    errors = {}
}: CreditCardFormProps) {
    return (
        <div className="space-y-8">

            {/* Card Number */}
            <div>
                <label className="block text-b2 font-regular text-black mb-2">
                    Card number
                </label>
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 ">
                    <div className="w-full max-w-[453px]">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Card number"
                                value={cardData.number}
                                onChange={(e) => onCardDataChange('number', formatCardNumber(e.target.value))}
                                className={`text-b2 font-regular text-gray-600 w-full px-3 py-2 pr-10 border-1 rounded-sm bg-white ${
                                    errors.number ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' : 'border-gray-400'
                                }`}
                                maxLength={19}
                            />
                            {errors.number && (
                                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9B2FAC]" />
                            )}
                        </div>
                        <InputError error={errors.number} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Image src="/assets/visa-logo.png" alt="VISA" width={44} height={14} />
                        <Image src="/assets/mastercard-logo.png" alt="Mastercard" width={36} height={28} />
                    </div>
                </div>
            </div>

            {/* Name on Card */}
            <div>
                <label className="block text-b2 font-regular text-black mb-2">
                    Name on card
                </label>
                <div className="w-full max-w-[453px]">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Name on card"
                            value={cardData.name}
                            onChange={(e) => onCardDataChange('name', e.target.value)}
                            className={`text-b2 font-regular text-gray-600 w-full px-3 py-2 pr-10 border-1 rounded-sm bg-white ${
                                errors.name ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' : 'border-gray-400'
                            }`}
                        />
                        {errors.name && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9B2FAC]" />
                        )}
                    </div>
                    <InputError error={errors.name} />
                </div>
            </div>

            {/* Expiry and CVV */}
            <div className="flex gap-4">
                <div>
                    <label className="block text-b2 font-regular text-black mb-2">
                        Expiry date
                    </label>
                    <div className="w-full max-w-[218px]">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="MM/YY"
                                value={cardData.expiry}
                                onChange={(e) => onCardDataChange('expiry', formatExpiry(e.target.value))}
                                className={`text-b2 font-regular text-gray-600 w-full px-3 py-2 pr-10 border-1 rounded-sm bg-white ${
                                    errors.expiry ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' : 'border-gray-400'
                                }`}
                                maxLength={5}
                            />
                            {errors.expiry && (
                                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9B2FAC]" />
                            )}
                        </div>
                        <InputError error={errors.expiry} />
                    </div>
                </div>
                <div>
                    <label className="block text-b2 font-regular text-black mb-2">
                        CVV
                    </label>
                    <div className="w-full max-w-[218px]">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="CVV"
                                value={cardData.cvv}
                                onChange={(e) => onCardDataChange('cvv', e.target.value.replace(/\D/g, ''))}
                                className={`text-b2 font-regular text-gray-600 w-full px-3 py-2 pr-10 border-1 rounded-sm bg-white ${
                                    errors.cvv ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' : 'border-gray-400'
                                }`}
                                maxLength={3}
                            />
                            {errors.cvv && (
                                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9B2FAC]" />
                            )}
                        </div>
                        <InputError error={errors.cvv} />
                    </div>
                </div>
            </div>


        </div>
    );
}
