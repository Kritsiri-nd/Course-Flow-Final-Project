import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    // Fetch assignments with related course, module, and lesson data
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    );

    // Query assignments with proper relationships
    const { data, error } = await supabase
        .from("assignments")
        .select(`
      id,
      question,
      answer,
      created_at,
      updated_at,
      lesson_id,
      lessons (
        id,
        title,
        module_id,
        modules (
          id,
          title,
          course_id,
          courses (
            id,
            title,
            category
          )
        )
      )
    `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching assignments:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize the data structure - handle both array and object responses
    const normalized = (data ?? []).map((assignment) => {
        const lesson = Array.isArray(assignment.lessons) ? assignment.lessons[0] : assignment.lessons;
        const module = lesson?.modules ? (Array.isArray(lesson.modules) ? lesson.modules[0] : lesson.modules) : null;
        const course = module?.courses ? (Array.isArray(module.courses) ? module.courses[0] : module.courses) : null;

        return {
            id: assignment.id,
            question: assignment.question,
            answer: assignment.answer,
            created_at: assignment.created_at,
            updated_at: assignment.updated_at,
            lesson: lesson ? {
                id: lesson.id,
                title: lesson.title,
                module: module ? {
                    id: module.id,
                    title: module.title,
                    course: course ? {
                        id: course.id,
                        title: course.title,
                        category: course.category
                    } : null
                } : null
            } : null
        };
    });

    return NextResponse.json(normalized, { status: 200 });
}

