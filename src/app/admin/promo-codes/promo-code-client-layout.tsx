'use client';

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminPanel } from '@/components/layouts/sidebar-admin-panel';
import { PlusCircle, Search } from "lucide-react";
import Link from "next/link";

// รับ children เข้ามา ซึ่งก็คือตารางข้อมูลที่ถูก render มาจาก Server
export function PromoCodesClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminPanel />
      
      <SidebarInset className="bg-gray-100">
        <header className="flex h-16 shrink-0 items-center justify-between bg-white border-b border-gray-300 
        px-4 sm:px-6 sticky top-0 z-20">
          {/* Left Side: Sidebar Trigger and Title */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-h3 font-semibold text-gray-800">
              Promo code
            </h1>
          </div>

          {/* Right Side: Search and Button Group */}
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md w-48 sm:w-64 focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500 focus:outline-none 
                font-inter font-bold text-sm"
              />
            </div>
            
            {/* Add Button */}
            <Link href="/admin/promo-codes/new">
              <button className="bg-blue-600 text-white font-inter font-semibold px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 
              transition-colors">
                <PlusCircle className="h-5 w-5" />
                <span>Add Promo code</span>
              </button>
            </Link>
          </div>
        </header>

        {/* แสดงผล children (ตารางข้อมูล) ที่นี่ */}
        <main className="flex flex-1 flex-col">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}