// src/app/admin/layout-client.tsx

'use client';

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminPanel } from '@/components/layouts/sidebar-admin-panel';
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getHeaderContent = () => {
    // --- กรณีอยู่ที่หน้า "สร้าง" โปรโมโค้ด ---
    if (pathname === '/admin/promo-codes/new') {
      return {
        title: 'Add New Promo Code',
        // หน้านี้จะไม่มีปุ่มบน Header
        addButton: null, 
      };
    }

    // --- กรณีอยู่ที่หน้า "รายการ" โปรโมโค้ด ---
    if (pathname.startsWith('/admin/promo-codes')) {
      return {
        title: 'Promo Codes',
        // หน้านี้จะมีแค่ปุ่ม "Add" เพื่อไปหน้า "สร้าง"
        addButton: {
          href: '/admin/promo-codes/new',
          text: 'Add Promo Code',
        },
      };
    }

    // --- ค่าเริ่มต้น ---
    return { title: 'Dashboard', addButton: null };
  };

  const headerContent = getHeaderContent();

  return (
    <SidebarProvider>
      <AdminPanel />
      
      <SidebarInset className="flex flex-col h-screen bg-gray-50">
        <header className="flex h-16 shrink-0 items-center justify-between bg-white border-b border-gray-200 px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold text-gray-800">
              {headerContent.title}
            </h1>
          </div>

          {/* ปุ่ม Add จะแสดงแค่ในหน้ารายการเท่านั้น */}
          <div className="flex items-center gap-4">
            {headerContent.addButton && (
              <Link href={headerContent.addButton.href}>
                <button className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm">
                  <PlusCircle className="h-5 w-5" />
                  <span>{headerContent.addButton.text}</span>
                </button>
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}