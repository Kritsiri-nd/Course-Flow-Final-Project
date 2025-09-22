"use client";

import { useState } from "react";
import { AdminPanel } from "@/components/layouts/sidebar-admin-panel";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Upload, Trash2, Edit, GripVertical } from "lucide-react";

export default function AddCoursePage() {
  const [promoCodeEnabled, setPromoCodeEnabled] = useState(true);
  const [discountType, setDiscountType] = useState("amount");
  const [lessons, setLessons] = useState([
    { id: 1, name: "Introduction", subLessons: 10 },
    { id: 2, name: "Service Design Theories and Principles", subLessons: 10 },
    { id: 3, name: "Understanding Users and Finding Opportunities", subLessons: 10 },
    { id: 4, name: "Identifying and Validating Opportunities for Design", subLessons: 10 },
    { id: 5, name: "Prototyping", subLessons: 10 },
    { id: 6, name: "Course Summary", subLessons: 10 },
  ]);

  return (
    <SidebarProvider>
      <AdminPanel />
      <SidebarInset className="bg-gray-100">
        {/* header */}
        <header className="flex h-23 shrink-0 items-center gap-2 bg-white border-b border-gray-300 px-4 sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-h3 font-semibold">Add Course</h1>

          {/* cancel & create buttons */}
          <div className="ml-auto gap-4 flex items-center">
            <Button
              variant="outline"
              onClick={() => {
                // Handle cancel action
                console.log("Cancel clicked");
              }}
              className="w-[119px] h-[60px] px-8 py-[18px] gap-[10px] rounded-xl border border-[#F47E20] text-[#F47E20] shadow-[4px_4px_24px_0px_#00000014] opacity-100 text-center font-inter font-bold text-base leading-[150%] tracking-normal hover:bg-transparent hover:text-[#F47E20] cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Handle create course action
                console.log("Create clicked");
              }}
              className="w-[119px] h-[60px] px-8 py-[18px] gap-[10px] rounded-xl bg-[#2F5FAC] text-white shadow-[4px_4px_24px_0px_#00000014] opacity-100 text-center font-inter font-bold text-base leading-[150%] tracking-normal hover:bg-[#2F5FAC] hover:text-white cursor-pointer"
            >
              Create
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-8">
            
            {/* Course Information */}
            <div>
                <h2 className="text-h3 font-semibold text-gray-900 mb-4">Course Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-b3 font-medium text-gray-700 mb-2">
                      Course name <span className="text-red-500">*</span>
                    </label>
                    <Input placeholder="Place Holder" className="w-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-b3 font-medium text-gray-700 mb-2">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <Input placeholder="Place Holder" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-b3 font-medium text-gray-700 mb-2">
                        Total learning time <span className="text-red-500">*</span>
                      </label>
                      <Input placeholder="Place Holder" className="w-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="promo-code"
                    checked={promoCodeEnabled}
                    onChange={(e) => setPromoCodeEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="promo-code" className="text-b3 font-medium text-gray-700">
                    Promo code
                  </label>
                </div>
                
                {promoCodeEnabled && (
                  <div className="bg-gray-100 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-b3 font-medium text-gray-700 mb-2">
                          Set promo code
                        </label>
                        <Input placeholder="Place Holder" className="w-full" />
                      </div>
                      <div>
                        <label className="block text-b3 font-medium text-gray-700 mb-2">
                          Minimum purchase amount (THB)
                        </label>
                        <Input placeholder="0" className="w-full" />
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
                            checked={discountType === "amount"}
                            onChange={(e) => setDiscountType(e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="discount-amount" className="text-b3 font-medium text-gray-700 whitespace-nowrap">
                            Discount (THB)
                          </label>
                          <Input placeholder="200" className="w-full" />
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="discount-percentage"
                            name="discount-type"
                            value="percentage"
                            checked={discountType === "percentage"}
                            onChange={(e) => setDiscountType(e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="discount-percentage" className="text-b3 font-medium text-gray-700 whitespace-nowrap">
                            Discount (%)
                          </label>
                          <Input placeholder="Place Holder" className="w-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Course Summary */}
              <div>
                <label className="block text-b3 font-medium text-gray-700 mb-2">
                  Course summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Place Holder"
                  className="w-full h-[72px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Course Detail */}
              <div>
              <h2 className="text-h3 font-semibold text-gray-900 mb-4">Course Detail</h2>
              <div>
                <label className="block text-b3 font-medium text-gray-700 mb-2">
                  Course detail <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Place Holder"
                  className="w-full h-[192px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

              <div>
                {/* Cover Image */}
                <div>
                  <label className="block text-b3 font-medium text-gray-700 mb-2">
                    Cover image <span className="text-red-500">*</span>
                  </label>
                  <p className="text-b3 text-gray-500 mb-3">
                    Supported file types: .jpg, .png, .jpeg. Max file size: 5 MB
                  </p>
                  <div className="w-[240px] h-[240px] rounded-lg flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
                    <Plus className="w-6 h-6 text-blue-400 mb-2" />
                    <span className="text-b3 text-blue-400 font-medium">Upload Image</span>
                  </div>
                </div>

                {/* Video Trailer */}
                <div className="mt-6">
                  <label className="block text-b3 font-medium text-gray-700 mb-2">
                    Video Trailer <span className="text-red-500">*</span>
                  </label>
                  <p className="text-b3 text-gray-500 mb-3">
                    Supported file types: .mp4, .mov, .avi. Max file size: 20 MB
                  </p>
                  <div className="w-[240px] h-[240px] rounded-lg flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
                    <Plus className="w-6 h-6 text-blue-400 mb-2" />
                    <span className="text-b3 text-blue-400 font-medium">Upload Video</span>
                  </div>
                </div>

                {/* Attach File */}
                <div className="mt-6">
                  <label className="block text-b3 font-medium text-gray-700 mb-2">
                    Attach File (Optional)
                  </label>
                  <div className="w-[160px] h-[160px] rounded-lg flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
                    <Plus className="w-6 h-6 text-blue-400 mb-2" />
                    <span className="text-b3 text-blue-400 font-medium">Upload File</span>
                  </div>
                </div>
              </div>
          </div>

        {/* Lesson */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h3 font-medium text-[#2A2E3F] leading-[125%] tracking-[-2%]">Lesson</h2>
              <button
                type="button"
                onClick={() => {
                  // Handle add lesson action
                  console.log("Add lesson clicked");
                }}
                className="w-[171px] h-[60px] pt-[18px] pr-[32px] pb-[18px] pl-[32px] gap-[10px] rounded-[12px] bg-[#2F5FAC] text-white shadow-[4px_4px_24px_0px_#00000014] opacity-100 flex items-center justify-center transition-all duration-200 hover:bg-[#2F5FAC] hover:scale-105 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Lesson
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700 w-12"></th>
                  <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700">Lesson name</th>
                  <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700">Sub-lesson</th>
                  <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700 w-32">Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "Introduction",
                  "Service Design Theories and Principles",
                  "Understanding Users and Finding Opportunities",
                  "Identifying and Validating Opportunities for Design",
                  "Prototyping",
                  "Course Summary"
                ].map((lesson, idx) => (
                  <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-b3 text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-3 text-b3 text-gray-900">{lesson}</td>
                    <td className="px-4 py-3 text-b3 text-gray-900">10</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-200 rounded transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-200 rounded transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2H7v-2a2 2 0 012-2h2v2a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
             </table>
            </div>
          </div>
        </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}