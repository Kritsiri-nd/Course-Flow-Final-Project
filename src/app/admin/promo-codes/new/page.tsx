'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminPanel } from '@/components/layouts/sidebar-admin-panel';

// --- Reusable Form Field Component ---
// คอมโพเนนต์นี้ใช้สร้าง Label และ Input เพื่อลดการเขียนโค้ดซ้ำซ้อน
const FormField = ({ id, label, type, name, required = false, defaultValue, placeholder }) => (
  <div>
    <label 
      htmlFor={id} 
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      required={required}
      className="
        block w-full rounded-md border-gray-300 shadow-sm 
        focus:border-blue-500 focus:ring-blue-500
      "
    />
  </div>
);

// --- Discount Type Selector Component ---
// จัดการส่วนเลือกประเภทส่วนลดโดยเฉพาะ ทำให้โค้ดหลักสะอาดขึ้น
const DiscountTypeSelector = ({ discountType, setDiscountType }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Select discount type*
    </label>
    <div className="
      flex flex-col sm:flex-row sm:items-center 
      gap-4 sm:gap-6
    ">
      {/* Radio for Fixed Amount */}
      <div className="flex items-center">
        <input
          type="radio"
          id="fixed"
          name="discount_type"
          value="fixed"
          checked={discountType === 'fixed'}
          onChange={() => setDiscountType('fixed')}
          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="fixed" className="ml-2 block text-sm text-gray-900">
          Fixed amount (THB)
        </label>
      </div>
      
      {/* Radio for Percent */}
      <div className="flex items-center">
        <input
          type="radio"
          id="percent"
          name="discount_type"
          value="percent"
          checked={discountType === 'percent'}
          onChange={() => setDiscountType('percent')}
          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="percent" className="ml-2 block text-sm text-gray-900">
          Percent (%)
        </label>
      </div>

      {/* Discount Value Input */}
      <div className="sm:ml-4">
        <input
          type="number"
          name="discount_value"
          placeholder={discountType === 'fixed' ? 'e.g. 200' : 'e.g. 30'}
          required
          className="
            block w-full max-w-xs rounded-md border-gray-300 shadow-sm 
            focus:border-blue-500 focus:ring-blue-500
          "
        />
      </div>
    </div>
  </div>
);

// --- Courses Included Selector Component ---
const CoursesIncludedSelect = () => (
  <div>
    <label 
      htmlFor="courses-included" 
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      Courses Included
    </label>
    <select
      id="courses-included"
      name="courses_included"
      className="
        block w-full rounded-md border-gray-300 shadow-sm 
        focus:border-blue-500 focus:ring-blue-500
      "
    >
      <option value="all">All courses</option>
      <option value="specific">Select specific courses...</option>
    </select>
  </div>
);


// --- Main Form Component ---
// รวมฟอร์มทั้งหมดไว้ในคอมโพเนนต์นี้
const PromoCodeForm = ({ handleSubmit, discountType, setDiscountType }) => (
  <form id="promo-code-form" onSubmit={handleSubmit} className="space-y-6">
    
    {/* --- Row 1: Promo Code & Minimum Purchase --- */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        id="promo-code"
        label="Set promo code*"
        type="text"
        name="promo_code"
        required
      />
      <FormField
        id="min-purchase"
        label="Minimum purchase amount (THB)*"
        type="number"
        name="min_purchase_amount"
        defaultValue={0}
        required
      />
    </div>

    {/* --- Row 2: Discount Type --- */}
    <DiscountTypeSelector 
      discountType={discountType} 
      setDiscountType={setDiscountType} 
    />

    {/* --- Row 3: Courses Included --- */}
    <CoursesIncludedSelect />
    
  </form>
);


// --- Main Page Component ---
export default function AddPromoCodePage() {
  const [discountType, setDiscountType] = useState('percent'); // Default to percent as in the image

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log('Form data submitted:', data);
    // TODO: เรียกใช้ Server Action เพื่อบันทึกข้อมูล
  };

  return (
    <SidebarProvider>
      <AdminPanel />
      <SidebarInset className="bg-gray-100">

        {/* ===== Header ===== */}
        <header className="
          flex h-16 shrink-0 items-center justify-between 
          bg-white border-b border-gray-300 px-4 sm:px-6 
          sticky top-0 z-20
        ">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1 md:hidden" />
            <h1 className="text-xl font-semibold text-gray-800">
              Add Promo code
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/admin/promo-codes">
              <button className="
                px-4 py-2 rounded-md border border-gray-300 bg-white 
                text-sm font-semibold text-gray-700 hover:bg-gray-50 
                transition-colors
              ">
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              form="promo-code-form"
              className="
                px-4 py-2 rounded-md bg-blue-600 text-sm 
                font-semibold text-white hover:bg-blue-700 
                transition-colors
              "
            >
              Create
            </button>
          </div>
        </header>

        {/* ===== Main Content ===== */}
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 lg:p-8 shadow-sm">
            <PromoCodeForm 
              handleSubmit={handleSubmit}
              discountType={discountType}
              setDiscountType={setDiscountType}
            />
          </div>
        </main>
        
      </SidebarInset>
    </SidebarProvider>
  );
}