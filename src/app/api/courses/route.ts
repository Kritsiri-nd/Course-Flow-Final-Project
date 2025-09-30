import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  // ดึง courses พร้อม modules และ lessons
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
  );

  const { data, error } = await supabase
    .from("courses")
    .select(`
      id,
      category,
      title,
      summary,
      description,
      price,
      currency,
      thumbnail,
      video_url,
      instructor,
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
    modules: (course.modules ?? []).map((m: { lessons?: unknown[] }) => ({
      ...m,
      lessons: m.lessons ?? [],
    })),
  }));

  return NextResponse.json(normalized, { status: 200 });
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      category,
      title,
      description,
      summary,
      price,
      currency = "THB",
      thumbnail,
      video_url,
      instructor,
      duration_hours,
    } = body ?? {};

    // Basic validation
    const missing: string[] = [];
    if (!title) missing.push("title");
    if (!description) missing.push("description");
    if (!summary) missing.push("summary");
    if (price === undefined || price === null) missing.push("price");
    if (!category) missing.push("category");
    if (!duration_hours && duration_hours !== 0) missing.push("duration_hours");

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const payload = {
      category,
      title,
      description,
      summary,
      price,
      currency,
      thumbnail: thumbnail ?? null,
      video_url: video_url ?? null,
      instructor: instructor ?? null,
      duration_hours,
    };

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    );

    const { data, error } = await supabase
      .from("courses")
      .insert(payload)
      .select()
      .single();

    if (error) {
      // 23505 = unique_violation (e.g., duplicate primary key or unique index)
      if ((error as { code?: string }).code === "23505") {
        return NextResponse.json(
          { error: error.message, code: "unique_violation" },
          { status: 409 }
        );
      }
      console.error("Error creating course:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error("Unexpected error creating course:", (err as Error)?.message || err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
