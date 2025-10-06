import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";

// GET /api/lesson-progress?lesson_id=123
export async function GET(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const lessonIdParam = url.searchParams.get("lesson_id");
        if (!lessonIdParam) {
            return NextResponse.json({ error: "lesson_id is required" }, { status: 400 });
        }
        const lessonId = Number(lessonIdParam);
        if (!Number.isFinite(lessonId)) {
            return NextResponse.json({ error: "Invalid lesson_id" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("lesson_progress")
            .select("id, user_id, lesson_id, duration_seconds, last_position_seconds, seconds_watched, progress_percentage, completed_at, created_at, updated_at")
            .eq("lesson_id", lessonId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data ?? null, { status: 200 });
    } catch (e: unknown) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/lesson-progress
// Body: { lesson_id: number; duration_seconds?: number; last_position_seconds?: number; seconds_watched?: number }
export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const lessonId = Number(body?.lesson_id);
        if (!Number.isFinite(lessonId)) {
            return NextResponse.json({ error: "lesson_id is required" }, { status: 400 });
        }
        const duration = body?.duration_seconds != null ? Math.max(0, Number(body.duration_seconds)) : undefined;
        const position = body?.last_position_seconds != null ? Math.max(0, Number(body.last_position_seconds)) : undefined;
        const watchedInc = body?.seconds_watched != null ? Math.max(0, Number(body.seconds_watched)) : 0;

        // Fetch existing row
        const { data: existing, error: fetchErr } = await supabase
            .from("lesson_progress")
            .select("id, duration_seconds, last_position_seconds, seconds_watched, completed_at")
            .eq("user_id", user.id)
            .eq("lesson_id", lessonId)
            .maybeSingle();
        if (fetchErr) {
            return NextResponse.json({ error: fetchErr.message }, { status: 500 });
        }

        const nextDuration = duration ?? existing?.duration_seconds ?? null;
        const nextPosition = Math.max(
            existing?.last_position_seconds ?? 0,
            position ?? 0
        );
        const nextWatched = (existing?.seconds_watched ?? 0) + watchedInc;

        // Completion heuristic: >= 90% or within last 5 seconds
        let completedAt = existing?.completed_at ?? null as string | null;
        if (!completedAt && nextDuration && nextDuration > 0) {
            const threshold = Math.max(nextDuration * 0.9, nextDuration - 5);
            if (nextPosition >= threshold) {
                completedAt = new Date().toISOString();
            }
        }

        if (existing?.id) {
            const { data, error } = await supabase
                .from("lesson_progress")
                .update({
                    duration_seconds: nextDuration,
                    last_position_seconds: nextPosition,
                    seconds_watched: nextWatched,
                    completed_at: completedAt,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existing.id)
                .select()
                .single();
            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json(data, { status: 200 });
        }

        const { data, error } = await supabase
            .from("lesson_progress")
            .insert({
                user_id: user.id,
                lesson_id: lessonId,
                duration_seconds: nextDuration,
                last_position_seconds: nextPosition,
                seconds_watched: nextWatched,
                completed_at: completedAt,
            })
            .select()
            .single();
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(data, { status: 201 });
    } catch (e: unknown) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


