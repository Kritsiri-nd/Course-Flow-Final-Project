import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type LessonOrderUpdate = {
  id: number;
  order_index: number;
};

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      courseId, 
      lessonOrders 
    }: { 
      courseId: number | string; 
      lessonOrders: LessonOrderUpdate[] 
    } = body || {};

    const numericCourseId = Number(courseId);

    if (!Number.isFinite(numericCourseId) || !Array.isArray(lessonOrders)) {
      return NextResponse.json(
        { error: "Missing/invalid fields: courseId, lessonOrders" },
        { status: 400 }
      );
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    );

    // Verify course exists
    const { data: courseRow, error: courseErr } = await admin
      .from("courses")
      .select("id")
      .eq("id", numericCourseId)
      .single();

    if (courseErr || !courseRow) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Update each module's order_index
    const updatePromises = lessonOrders.map(({ id, order_index }) =>
      admin
        .from("modules")
        .update({ order_index })
        .eq("id", id)
        .eq("course_id", numericCourseId)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for any errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error("Failed to update lesson orders:", errors);
      return NextResponse.json(
        { error: "Failed to update some lesson orders" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: unknown) {
    console.error("Unexpected error reordering lessons:", (e as Error)?.message || e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
