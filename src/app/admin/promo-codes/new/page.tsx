import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import AddCouponForm from "./form";

export default async function AddPromoCodePage() {
  const supabase = await createSupabaseServerClient();
  
  // ดึงข้อมูลคอร์สทั้งหมดเพื่อนำไปสร้าง dropdown
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title")
    .order("title", { ascending: true });
    
  if (error) {
    console.error("Failed to fetch courses:", error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Error loading course data. Please try again later.</p>
      </div>
    );
  }

  return <AddCouponForm courses={courses || []} totalCourses={courses?.length || 0} />;
}