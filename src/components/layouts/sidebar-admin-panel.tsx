"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BookOpen, ClipboardList, TicketPercent, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

// 👇 1. แก้ไข import ให้เป็น Named Import
import { signOut } from "@/app/auth/action"; 

const navigationItems = [
  {
    title: "Course",
    url: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Assignment",
    url: "/admin/assignments",
    icon: ClipboardList,
  },
  {
    title: "Promo code",
    url: "/admin/promo-codes",
    icon: TicketPercent,
  },
];

export function AdminPanel() {
  const pathname = usePathname();

  return (
    <Sidebar className="h-svh border-r border-gray-400 bg-white opacity-100">
      <div className="flex h-[min(100svh,800px)] flex-col">
        <SidebarHeader className="flex h-[131px] flex-col items-center justify-center px-6 pt-6">
          <div className="space-y-6">
            <Image
              src="/assets/CourseFlow.png"
              alt="CourseFlow"
              width={174}
              height={19}
              priority
            />
            <p className="text-center text-gray-500">Admin Panel Control</p>
          </div>
        </SidebarHeader>

        <SidebarContent className="flex-1 overflow-auto px-0">
          <SidebarGroup className="mt-10 px-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`w-full justify-start rounded-none px-6 py-6 text-gray-600 hover:bg-gray-100 ${
                        pathname?.startsWith(item.url) ? "bg-gray-200" : ""
                      }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="text-base">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="mt-auto px-0 pb-6">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-10">
                <SidebarMenuItem>
                  {/* 👇 2. เปลี่ยนจาก Link เป็น Form */}
                  <form action={signOut} className="w-full">
                    <SidebarMenuButton
                      type="submit" // 👈 3. กำหนด type="submit"
                      className="w-full justify-start rounded-none px-6 py-6 text-gray-600 hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-3 cursor-pointer">
                        <LogOut className="h-5 w-5" />
                        <span className="text-base">Log out</span>
                      </div>
                    </SidebarMenuButton>
                  </form>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
