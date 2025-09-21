import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  // ดึง courses พร้อม modules และ lessons
  const { data, error } = await supabase
    .from("courses")
    .select(`
      id,
      category,
      title,
      description,
      price,
      currency,
      thumbnail,
      video_url,
      instructor,
      rating,
      students,
      language,
      duration_hours,
      created_at,
      modules (
        id,
        title,
        order_index,
        created_at,
        lessons (
          id,
          title,
          order_index,
          created_at
        )
      )
    `)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching courses:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // normalize: modules, lessons ต้องเป็น array เสมอ
  const normalized = (data ?? []).map((course) => ({
    ...course,
    modules: (course.modules ?? []).map((m: any) => ({
      ...m,
      lessons: m.lessons ?? [],
    })),
  }));

  return NextResponse.json(normalized, { status: 200 });
}
