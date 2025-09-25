import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("GET /api/assignments/[id] - ID:", params.id);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    );

    const { data, error } = await supabase
      .from("assignments")
      .select(`
        id,
        question,
        answer,
        lesson_id,
        created_at,
        updated_at,
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
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          error: "Assignment not found",
          details: error
        }, { status: 404 });
      }
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        details: error
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ 
        error: "Assignment not found"
      }, { status: 404 });
    }

    // Normalize the data structure
    const lesson = Array.isArray(data.lessons) ? data.lessons[0] : data.lessons;
    const module = lesson?.modules ? (Array.isArray(lesson.modules) ? lesson.modules[0] : lesson.modules) : null;
    const course = module?.courses ? (Array.isArray(module.courses) ? module.courses[0] : module.courses) : null;

    const normalized = {
      id: data.id,
      question: data.question,
      answer: data.answer,
      lesson_id: data.lesson_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
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

    console.log("Normalized data:", normalized);
    return NextResponse.json(normalized, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/assignments/[id]:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    );

    const body = await request.json();
    const { question, answer, lesson_id } = body;

    if (!question || !lesson_id) {
      return NextResponse.json(
        { error: "Question and lesson_id are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("assignments")
      .update({
        question,
        answer: answer || null,
        lesson_id: parseInt(lesson_id),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        details: error
      }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in PUT /api/assignments/[id]:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    );

    const { error } = await supabase
      .from("assignments")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/assignments/[id]:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 