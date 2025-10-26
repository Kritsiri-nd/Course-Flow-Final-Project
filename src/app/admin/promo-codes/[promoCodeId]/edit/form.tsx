 "use client";

import { useFormState } from "react-dom";
import { updatePromoCode, deletePromoCode, type FormState } from "./action";
import { useState } from "react";
import { MultiSelect } from "@/components/ui/multi-select";
import { useRouter } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminPanel } from "@/components/layouts/sidebar-admin-panel";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

// Types
type Course = {
  id: number;
  title: string;
};

type PromoCode = {
  id: number;
  code: string;
  discount_type: "fixed" | "percent";
  discount_value: number;
  min_purchase_amount: number;
  applies_to_all_courses: boolean;
};

type EditCouponFormProps = {
  promoCode: PromoCode;
  courses: Course[];
  totalCourses: number;
  selectedCourseIds: string[];
};

export default function EditCouponForm({
  promoCode,
  courses,
  totalCourses,
  selectedCourseIds,
}: EditCouponFormProps) {
  const router = useRouter();
  const initialState: FormState = { message: "" };
  const [state, dispatch] = useFormState(updatePromoCode, initialState);
  const [discountType, setDiscountType] = useState<"fixed" | "percent">(
    promoCode.discount_type
  );
  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    promoCode.applies_to_all_courses ? [] : selectedCourseIds
  );
  const [courseError, setCourseError] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this promo code?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePromoCode(promoCode.id);
      router.push("/admin/promo-codes");
    } catch (error) {
      console.error("Error deleting promo code:", error);
      alert("Failed to delete promo code. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <SidebarProvider>
      <AdminPanel />

      <SidebarInset className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between bg-white border-b border-gray-200 px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <Link
              href="/admin/promo-codes"
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-600">
              Promo code{" "}
              <span className="text-gray-900 font-bold">{promoCode.code}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/promo-codes">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-orange-500 bg-white border border-orange-500 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              form="promo-form"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <form id="promo-form" action={dispatch} className="space-y-6">
                {/* Hidden field for promo code ID */}
                <input type="hidden" name="promo_code_id" value={promoCode.id} />

                {/* Promo Code & Minimum Purchase */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Promo Code */}
                  <div>
                    <label
                      htmlFor="code"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Set promo code*
                    </label>
                    <input
                      type="text"
                      name="code"
                      id="code"
                      defaultValue={promoCode.code}
                      required
                      className="block w-full rounded-md border border-gray-300 focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2.5"
                    />
                    {state.errors?.code && (
                      <p className="mt-1 text-sm text-red-600">
                        {state.errors.code[0]}
                      </p>
                    )}
                  </div>

                  {/* Minimum Purchase Amount */}
                  <div>
                    <label
                      htmlFor="min_purchase_amount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Minimum purchase amount (THB)*
                    </label>
                    <input
                      type="number"
                      id="min_purchase_amount"
                      name="min_purchase_amount"
                      defaultValue={promoCode.min_purchase_amount}
                      min="0"
                      required
                      className="no-spinner block w-full rounded-md border border-gray-300 focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2.5"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select discount type*
                  </label>
                  <div className="flex items-center space-x-8">
                    {/* Fixed Amount Radio Group */}
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="fixed"
                        name="discount_type"
                        value="fixed"
                        checked={discountType === "fixed"}
                        onChange={() => setDiscountType("fixed")}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="fixed" className="ml-2 text-sm text-gray-700">
                        Discount (THB)
                      </label>
                      <input
                        type="number"
                        name="fixed_amount"
                        min="0"
                        defaultValue={
                          discountType === "fixed" ? promoCode.discount_value : ""
                        }
                        disabled={discountType !== "fixed"}
                        className="no-spinner ml-3 block w-32 rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed px-3 py-2.5"
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
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="percent" className="ml-2 text-sm text-gray-700">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        name="percent_amount"
                        min="1"
                        max="100"
                        step="1"
                        placeholder="Percent"
                        defaultValue={
                          discountType === "percent" ? promoCode.discount_value : ""
                        }
                        disabled={discountType !== "percent"}
                        onInput={(e) => {
                          const value = e.currentTarget.value.replace(/[^\d]/g, "");
                          const numValue = parseInt(value, 10);

                          if (isNaN(numValue)) {
                            e.currentTarget.value = "";
                          } else if (numValue > 100) {
                            e.currentTarget.value = "100";
                          } else if (numValue < 1 && value !== "") {
                            e.currentTarget.value = "1";
                          } else {
                            e.currentTarget.value = value;
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "." ||
                            e.key === "+" ||
                            e.key === "-" ||
                            e.key === "e" ||
                            e.key === "E"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.currentTarget.value, 10);
                          if (isNaN(value) || value < 1) {
                            e.currentTarget.value = "";
                          } else if (value > 100) {
                            e.currentTarget.value = "100";
                          }
                        }}
                        className="no-spinner ml-3 block w-32 rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed px-3 py-2.5"
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
                <div className="courses-section">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Courses Included
                  </label>
                  <MultiSelect
                    options={courses.map((course) => ({
                      value: course.id.toString(),
                      label: course.title,
                    }))}
                    onValueChange={(values) => {
                      setSelectedCourses(values);
                      if (values.length > 0) {
                        setCourseError("");
                      }
                    }}
                    defaultValue={
                      promoCode.applies_to_all_courses ? [] : selectedCourseIds
                    }
                    placeholder={
                      promoCode.applies_to_all_courses
                        ? "All courses"
                        : "Select courses..."
                    }
                    variant="inverted"
                    maxCount={3}
                    hideSelectAll={false}
                    className={`focus:border-orange-500 focus:ring-orange-500 data-[state=open]:border-orange-500 data-[state=open]:ring-orange-500 ${
                      courseError ? "border-red-500" : ""
                    }`}
                  />
                  <input
                    type="hidden"
                    name="course_ids"
                    value={selectedCourses.join(",")}
                  />
                  <input type="hidden" name="total_courses" value={totalCourses} />
                  {(state.errors?.course_ids || courseError) && (
                    <p className="mt-1 text-sm text-red-600">
                      {courseError ||
                        (state.errors?.course_ids && state.errors.course_ids[0])}
                    </p>
                  )}
                </div>

                {/* Delete Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? "Deleting..." : "Delete Promo code"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
