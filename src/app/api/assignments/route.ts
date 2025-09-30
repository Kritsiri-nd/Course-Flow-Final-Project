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
        const lessonModule = lesson?.modules ? (Array.isArray(lesson.modules) ? lesson.modules[0] : lesson.modules) : null;
        const course = lessonModule?.courses ? (Array.isArray(lessonModule.courses) ? lessonModule.courses[0] : lessonModule.courses) : null;

        return {
            id: assignment.id,
            question: assignment.question,
            answer: assignment.answer,
            created_at: assignment.created_at,
            updated_at: assignment.updated_at,
            lesson: lesson ? {
                id: lesson.id,
                title: lesson.title,
                module: lessonModule ? {
                    id: lessonModule.id,
                    title: lessonModule.title,
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

export async function POST(request: Request) {
    try {
        console.log("POST /api/assignments - Starting...");
        
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
        );

        const body = await request.json();
        console.log("Request body:", body);
        
        const { question, answer, lesson_id } = body;

        // Validate required fields
        if (!question || !lesson_id) {
            console.log("Validation failed - missing required fields");
            return NextResponse.json(
                { error: "Question and lesson_id are required" },
                { status: 400 }
            );
        }

        console.log("Creating assignment with:", { question, answer, lesson_id });

        // Insert new assignment - only use columns that exist in database
        const { data, error } = await supabase
            .from("assignments")
            .insert([
                {
                    question,
                    answer: answer || null,
                    lesson_id: parseInt(lesson_id),
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ 
                error: `Database error: ${error.message}`,
                details: error
            }, { status: 500 });
        }

        console.log("Assignment created successfully:", data);
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/assignments:", error);
        return NextResponse.json(
            { 
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

