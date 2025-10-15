"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addPromoCode, type FormState } from "./action";
import { useRouter } from 'next/navigation'; 
import { useState } from "react";
import { MultiSelect } from "@/components/ui/multi-select";


// Types
type Course = {
  id: number;
  title: string;
};

type AddCouponFormProps = {
  courses: Course[];
};

// Submit Button Component
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Promo Code"}
    </button>
  );
}

export default function AddCouponForm({ courses }: AddCouponFormProps) {

  const router = useRouter(); 
  const initialState: FormState = { message: "" };
  const [state, dispatch] = useFormState(addPromoCode, initialState);
  const [discountType, setDiscountType] = useState<"fixed" | "percent">("percent");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white border border-gray-300 rounded-xl ">
      <form action={dispatch} className="space-y-6">
        {/* Promo Code & Minimum Purchase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Promo Code */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Set promo code*
            </label>
            <input 
              type="text" 
              name="code" 
              id="code" 
              required 
              className="block w-full rounded-md  border border-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2.5"
            />
            {state.errors?.code && ( 
              <p className="mt-1 text-sm text-red-600"> 
                {state.errors.code[0]} 
              </p>
            )}
          </div>

          {/* Minimum Purchase Amount */}
          <div>
            <label htmlFor="min_purchase_amount" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum purchase amount (THB)*
            </label>
            <input 
              type="number"
              id="min_purchase_amount"
              name="min_purchase_amount"
              defaultValue={0}
              min="0"
              required 
              className="no-spinner block w-full rounded-md border border-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2.5"
            />
            {state.errors?.min_purchase_amount && ( 
              <p className="mt-1 text-sm text-red-600"> 
                {state.errors.min_purchase_amount[0]} 
              </p>
            )}
          </div>
        </div>

        {/* Discount Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select discount type*
          </label>
          <div className="mt-2 flex items-center space-x-8">
            {/* Fixed Amount Radio Group */}
            <div className="flex items-center">
              <input
                type="radio"
                id="fixed"
                name="discount_type"
                value="fixed"
                checked={discountType === "fixed"}
                onChange={() => setDiscountType("fixed")}
                className="h-4 w-4  text-indigo-600 border border-gray-400 focus:ring-indigo-500"
              />
              <label htmlFor="fixed" className="ml-2 text-sm text-gray-700">
                Fixed amount (THB)
              </label>
              <input 
                type="number" 
                name="fixed_amount"
                min="0"
                disabled={discountType !== "fixed"}
                className="no-spinner ml-3 block w-32 rounded-md border border-gray-400 shadow-sm focus:border-orange-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed px-3 py-2.5"
              />
            </div>

            {/* Percent Radio Group */}
            <div className="flex items-center">
              <input
                type="radio"
                id="percent"
                name="discount_type"
                value="percent"
                checked={discountType === "percent"}
                onChange={() => setDiscountType("percent")}
                className="h-4 w-4 text-indigo-600 border-gray-400 focus:ring-indigo-500"
              />
              <label htmlFor="percent" className="ml-2 text-sm text-gray-700">
                Percent (%)
              </label>
              <input
                type="number"
                name="percent_amount"
                min="0.01"
                max="100"
                step="0.01"
                placeholder="Percent"
                disabled={discountType !== "percent"}
                onInput={(e) => {
                  const value = parseFloat(e.currentTarget.value);
                  if (value > 100) {
                    e.currentTarget.value = "100";
                  }
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.currentTarget.value);
                  if (value < 0.01 && e.currentTarget.value !== "") {
                    e.currentTarget.value = "0.01";
                  }
                }}
                className="no-spinner ml-3 block w-32 rounded-md border border-gray-400 shadow-sm focus:border-orange-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed px-3 py-2.5"
              />
            </div>
          </div>
          {state.errors?.discount_value && (
            <p className="mt-1 text-sm text-red-600">
              {state.errors.discount_value[0]}
            </p>
          )}
        </div>

        {/* Courses Included */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Courses Included
          </label>
          <MultiSelect
            options={courses.map((course) => ({
              value: course.id.toString(),
              label: course.title
            }))}
            onValueChange={setSelectedCourses}
            defaultValue={[]}
            placeholder="Select courses..."
            variant="inverted"
            maxCount={3}
            hideSelectAll={false}
            className="focus:border-orange-500 focus:ring-orange-500 data-[state=open]:border-orange-500 data-[state=open]:ring-orange-500"
          />
          <input 
            type="hidden" 
            name="course_ids" 
            value={selectedCourses.join(",")} 
          />
          {state.errors?.course_ids && (
            <p className="mt-1 text-sm text-red-600">
              {state.errors.course_ids[0]}
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end items-center space-x-3 pt-4">
          <button 
            type="button" 
            onClick={() => router.push("/admin/promo-codes")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>

          <button 
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Promo Code
          </button>
        </div>
      </form>
    </div>
  );
}