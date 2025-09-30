import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type SubLessonPayload = {
  title: string;
  video_url?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      courseId,
      lessonTitle,
      subLessons,
    }: { courseId: number | string; lessonTitle: string; subLessons: SubLessonPayload[] } = body || {};

    const numericCourseId = Number(courseId);

    if (!Number.isFinite(numericCourseId) || !lessonTitle || !Array.isArray(subLessons)) {
      return NextResponse.json(
        { error: "Missing/invalid fields: courseId, lessonTitle, subLessons" },
        { status: 400 }
      );
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    );

    // Ensure course exists to satisfy FK
    const { data: courseRow, error: courseErr } = await admin
      .from("courses")
      .select("id")
      .eq("id", numericCourseId)
      .single();

    if (courseErr || !courseRow) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Determine next order index for module under course
    const { data: existingModules, error: modErr } = await admin
      .from("modules")
      .select("order_index")
      .eq("course_id", numericCourseId)
      .order("order_index", { ascending: false })
      .limit(1);
    if (modErr) {
      console.error("Failed to fetch modules for order_index:", modErr.message);
      return NextResponse.json({ error: modErr.message }, { status: 500 });
    }
    const nextModuleOrder = (existingModules?.[0]?.order_index ?? 0) + 1;

    // Create module for this lesson
    const { data: moduleRow, error: createModuleErr } = await admin
      .from("modules")
      .insert({ course_id: numericCourseId, title: lessonTitle, order_index: nextModuleOrder })
      .select("id")
      .single();

    if (createModuleErr) {
      console.error("Failed to create module:", createModuleErr.message);
      return NextResponse.json({ error: createModuleErr.message }, { status: 500 });
    }

    const moduleId = moduleRow.id as number;

    // Insert sub-lessons
    const lessonsToInsert = subLessons.map((s, idx) => ({
      module_id: moduleId,
      title: s.title,
      order_index: idx + 1,
      video_url: s.video_url ?? null,
    }));

    if (lessonsToInsert.length > 0) {
      const { error: insertLessonsErr } = await admin
        .from("lessons")
        .insert(lessonsToInsert);
      if (insertLessonsErr) {
        console.error("Failed to insert lessons:", insertLessonsErr.message);
        return NextResponse.json({ error: insertLessonsErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, moduleId }, { status: 201 });
    } catch (e: unknown) {
    console.error("Unexpected error creating lessons:", (e as Error)?.message || e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


