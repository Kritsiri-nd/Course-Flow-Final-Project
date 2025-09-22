import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET /api/courses/[id]
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const courseId = parseInt(id, 10);
        if (Number.isNaN(courseId)) {
            return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
        }

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
            .eq("id", courseId)
            .single();

        if (error) {
            if (error.code === "PGRST116" /* No rows returned */) {
                return NextResponse.json({ error: "Course not found" }, { status: 404 });
            }
            console.error("Error fetching course:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const normalized = {
            ...data,
            modules: (data?.modules ?? []).map((m: any) => ({
                ...m,
                lessons: m.lessons ?? [],
            })),
        };

        return NextResponse.json(normalized, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching course:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}