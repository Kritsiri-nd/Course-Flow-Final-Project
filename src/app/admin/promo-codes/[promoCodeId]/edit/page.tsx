import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import EditCouponForm from "./form";
import { redirect } from "next/navigation";

export default async function EditPromoCodePage({
  params,
}: {
  params: Promise<{ promoCodeId: string }>;
}) {
  const { promoCodeId } = await params;
  const supabase = await createSupabaseServerClient();
  
  // ดึงข้อมูล promo code ที่ต้องการแก้ไข
  const { data: promoCode, error: promoError } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("id", promoCodeId)
    .single();

  if (promoError || !promoCode) {
    console.error("Failed to fetch promo code:", promoError);
    redirect("/admin/promo-codes");
  }

  // ดึงข้อมูลคอร์สที่เชื่อมโยงกับ promo code นี้
  const { data: promoCodeCourses } = await supabase
    .from("promo_code_courses")
    .select("course_id")
    .eq("promo_code_id", promoCodeId);

  // ดึงข้อมูลคอร์สทั้งหมดเพื่อนำไปสร้าง dropdown
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, title")
    .order("title", { ascending: true });
    
  if (coursesError) {
    console.error("Failed to fetch courses:", coursesError);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Error loading course data. Please try again later.</p>
      </div>
    );
  }

  // สร้าง array ของ course IDs ที่ถูกเลือก
  const selectedCourseIds = promoCodeCourses?.map((pc) => pc.course_id.toString()) || [];

  return (
    <EditCouponForm
      promoCode={promoCode}
      courses={courses || []}
      totalCourses={courses?.length || 0}
      selectedCourseIds={selectedCourseIds}
    />
  );
}