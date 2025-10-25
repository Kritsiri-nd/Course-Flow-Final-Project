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
  
  const handleCreateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Get the form element
    const form = document.getElementById('promo-form') as HTMLFormElement;
    if (!form) return;
    
    // Get the course_ids hidden input value
    const courseIdsInput = form.querySelector('input[name="course_ids"]') as HTMLInputElement;
    const selectedCourses = courseIdsInput?.value || '';
    
    // Check if no courses are selected
    if (!selectedCourses || selectedCourses.trim() === '') {
      e.preventDefault();
      
      // Show visual feedback by scrolling to the courses section
      const coursesSection = form.querySelector('.courses-section');
      if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Show alert with helpful message
      alert('Please select at least one course before creating the promo code.');
      return;
    }
    
    // If validation passes, submit the form
    form.requestSubmit();
  };

  const getHeaderContent = () => {
    // --- กรณีอยู่ที่หน้า "สร้าง" โปรโมโค้ด ---
    if (pathname === '/admin/promo-codes/new') {
      return {
        title: 'Add Promo Code',
        // หน้านี้จะมีปุ่ม Cancel และ Create บน Header
        showFormButtons: true,
        addButton: null, 
      };
    }

    // --- กรณีอยู่ที่หน้า "รายการ" โปรโมโค้ด ---
    if (pathname.startsWith('/admin/promo-codes')) {
      return {
        title: 'Promo Codes',
        showFormButtons: false,
        // หน้านี้จะมีแค่ปุ่ม "Add" เพื่อไปหน้า "สร้าง"
        addButton: {
          href: '/admin/promo-codes/new',
          text: 'Add Promo Code',
        },
      };
    }

    // --- ค่าเริ่มต้น ---
    return { title: 'Dashboard', showFormButtons: false, addButton: null };
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

          {/* ปุ่มต่างๆ ตาม context */}
          <div className="flex items-center gap-4">
            {headerContent.showFormButtons ? (
              /* ปุ่ม Cancel และ Create สำหรับหน้าฟอร์ม */
              <div className="flex items-center gap-3">
                <Link href="/admin/promo-codes">
                  <button className="px-4 py-2 text-sm font-medium text-orange-500 bg-white border border-orange-500 rounded-md shadow-sm 
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Cancel
                  </button>
                </Link>
                <button 
                  type="button"
                  onClick={handleCreateClick}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create
                </button>
              </div>
            ) : headerContent.addButton ? (
              /* ปุ่ม Add สำหรับหน้ารายการ */
              <Link href={headerContent.addButton.href}>
                <button className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm">
                  <PlusCircle className="h-5 w-5" />
                  <span>{headerContent.addButton.text}</span>
                </button>
              </Link>
            ) : null}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}