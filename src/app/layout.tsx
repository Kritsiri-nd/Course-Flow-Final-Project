import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import HeaderNav from "@/components/ui/navbar/HeaderNav";
import UserNav from "@/components/ui/navbar/UserNav";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "CourseFlow",
  description: "Online Course Management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // ตรวจสอบว่าเป็นหน้า admin หรือไม่
  const isAdminPage = pathname.startsWith("/admin");

  // ตรวจสอบว่าเป็นหน้า user หรือไม่
  const isUserPage = pathname.startsWith("/user");

  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let userProfile = null;

  if (session) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    userProfile = profiles;
  }

  return (
    <html lang="en">
      <head />
      <body>
        {/* ใส่ Omise.js script สำหรับใช้สร้าง token บัตร */}
        <Script
          src="https://cdn.omise.co/omise.js"
          strategy="beforeInteractive"
        />

        {/* Navbar Logic */}
        {!isAdminPage && !isUserPage && <HeaderNav />}
        {!isAdminPage && isUserPage && (
          <UserNav session={session} userProfile={userProfile} />
        )}

        {children}
      </body>
    </html>
  );
}
