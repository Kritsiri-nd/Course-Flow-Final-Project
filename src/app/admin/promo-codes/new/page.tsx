"use server";

import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import AddCouponForm from "./addCounponForm";

export default async function AddPromoCodePage() {
  const supabase = await createSupabaseServerClient();
  
  // ดึงข้อมูลคอร์สทั้งหมดเพื่อนำไปสร้าง dropdown
  // สมมติว่าคุณมีตาราง 'courses' ที่มี 'id' และ 'title'
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title")
    .order("title", { ascending: true });
    
  if (error) {
    console.error("Failed to fetch courses:", error);
    // จัดการ UI กรณีที่ดึงข้อมูลคอร์สไม่สำเร็จ
    return <p>Error loading course data. Please try again later.</p>;
  }

  return (
    <div>
      <AddCouponForm courses={courses || []} />
    </div>
  );
}