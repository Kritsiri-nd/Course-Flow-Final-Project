"use client";

import { Input } from "@/components/ui/input";
import { formatNumberInput, formatPercentageInput, handleKeyDown } from "@/lib/formUtils";

interface PromoCode {
  enabled: boolean;
  code: string;
  minPurchaseAmount: string;
  discountType: "amount" | "percentage";
  discountValue: string;
}

interface PromoCodeSectionProps {
  promoCode: PromoCode;
  onPromoCodeChange: (field: keyof PromoCode, value: string | boolean) => void;
}

export function PromoCodeSection({ promoCode, onPromoCodeChange }: PromoCodeSectionProps) {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          id="promo-code"
          checked={promoCode.enabled}
          onChange={(e) => onPromoCodeChange('enabled', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="promo-code" className="text-b3 font-medium text-gray-700">
          Promo code
        </label>
      </div>
      
      {promoCode.enabled && (
        <div className="bg-gray-100 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-b3 font-medium text-gray-700 mb-2">
                Set promo code
              </label>
              <Input 
                placeholder="Enter promo code" 
                className="w-full" 
                value={promoCode.code}
                onChange={(e) => onPromoCodeChange('code', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-b3 font-medium text-gray-700 mb-2">
                Minimum purchase amount (THB)
              </label>
              <Input 
                placeholder="0" 
                className="w-full" 
                type="number"
                min="0"
                step="0.01"
                value={promoCode.minPurchaseAmount}
                onChange={(e) => onPromoCodeChange('minPurchaseAmount', formatNumberInput(e.target.value))}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <div>
            <label className="block text-b3 font-medium text-gray-700 mb-2">
              Select discount type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="discount-amount"
                  name="discount-type"
                  value="amount"
                  checked={promoCode.discountType === "amount"}
                  onChange={(e) => onPromoCodeChange('discountType', e.target.value as 'amount' | 'percentage')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="discount-amount" className="text-b3 font-medium text-gray-700 whitespace-nowrap">
                  Discount (THB)
                </label>
                <Input 
                  placeholder="200" 
                  className="w-full" 
                  type="number"
                  min="0"
                  step="0.01"
                  value={promoCode.discountType === 'amount' ? promoCode.discountValue : ''}
                  onChange={(e) => onPromoCodeChange('discountValue', formatNumberInput(e.target.value))}
                  onKeyDown={handleKeyDown}
                  disabled={promoCode.discountType !== 'amount'}
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="discount-percentage"
                  name="discount-type"
                  value="percentage"
                  checked={promoCode.discountType === "percentage"}
                  onChange={(e) => onPromoCodeChange('discountType', e.target.value as 'amount' | 'percentage')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="discount-percentage" className="text-b3 font-medium text-gray-700 whitespace-nowrap">
                  Discount (%)
                </label>
                <Input 
                  placeholder="Enter percentage" 
                  className="w-full" 
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={promoCode.discountType === 'percentage' ? promoCode.discountValue : ''}
                  onChange={(e) => onPromoCodeChange('discountValue', formatPercentageInput(e.target.value))}
                  onKeyDown={handleKeyDown}
                  disabled={promoCode.discountType !== 'percentage'}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
