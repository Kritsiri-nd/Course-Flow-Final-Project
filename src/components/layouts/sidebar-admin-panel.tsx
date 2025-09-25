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
import { usePathname, useRouter} from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabaseClient";

import Router from "next/router";

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
  const router = useRouter();
  const supabase = createClient();


const handleLogout = async () => {

  await supabase.auth.signOut();
  router.refresh();
  router.push('/auth/login');

}

  return (
    <Sidebar className="h-svh border-r border-gray-400 bg-white opacity-100">
      <div className="h-[min(100svh,800px)] flex flex-col">
        <SidebarHeader className="flex flex-col items-center justify-center h-[131px] px-6 pt-6">
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

        <SidebarContent className="px-0 flex-1 overflow-auto">
          <SidebarGroup className="px-0 mt-10">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`w-full justify-start px-6 py-6 rounded-none text-gray-600 hover:bg-gray-100 ${
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

        <SidebarFooter className="px-0 pb-6 mt-auto">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-10">
                <SidebarMenuItem>

                  <SidebarMenuItem>
                  <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 justify-start px-6 py-6 rounded-none text-gray-600 hover:bg-gray-100"
                  >
                  <LogOut className="h-5 w-5" />
                  <span className="text-base">Log out</span>
                  </button>
                </SidebarMenuItem>

                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
