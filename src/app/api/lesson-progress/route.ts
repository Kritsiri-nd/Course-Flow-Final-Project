import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";

// GET /api/lesson-progress?lesson_id=123 OR /api/lesson-progress?course_id=123&bulk=true
export async function GET(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const lessonIdParam = url.searchParams.get("lesson_id");
        const courseIdParam = url.searchParams.get("course_id");
        const bulkParam = url.searchParams.get("bulk");

        // Handle bulk progress for course
        if (courseIdParam && bulkParam === "true") {
            const courseId = Number(courseIdParam);
            if (!Number.isFinite(courseId)) {
                return NextResponse.json({ error: "Invalid course_id" }, { status: 400 });
            }

            // Fetch all lesson ids for the course
            const { data: modulesData, error: modulesErr } = await supabase
                .from("modules")
                .select(
                    `id, course_id, lessons ( id, title )`
                )
                .eq("course_id", courseId);

            if (modulesErr) {
                return NextResponse.json({ error: modulesErr.message }, { status: 500 });
            }

            const lessonIds = (modulesData ?? [])
                .flatMap((m: any) => (m?.lessons ?? []).map((l: any) => Number(l.id)))
                .filter((n: any) => Number.isFinite(n));

            if (lessonIds.length === 0) {
                return NextResponse.json({ lessonStatus: {}, overallPercent: 0, counts: { total: 0, completed: 0, in_progress: 0, not_started: 0 } });
            }

            // Fetch progress rows for these lessons for this user
            const { data: progressRows, error: progErr } = await supabase
                .from("lesson_progress")
                .select(
                    "lesson_id, duration_seconds, last_position_seconds, seconds_watched, completed_at"
                )
                .eq("user_id", user.id)
                .in("lesson_id", lessonIds);

            if (progErr) {
                return NextResponse.json({ error: progErr.message }, { status: 500 });
            }

            const progressByLesson = new Map<number, any>();
            for (const row of progressRows ?? []) {
                progressByLesson.set(Number(row.lesson_id), row);
            }

            console.log('Raw progress data:', progressRows);
            console.log('Lesson IDs:', lessonIds);

            let totalFraction = 0;
            let countCompleted = 0;
            let countInProgress = 0;
            let countNotStarted = 0;

            const lessonStatus: Record<number, { status: "completed" | "in_progress" | "not_started"; percent: number }> = {};

            for (const lessonId of lessonIds) {
                const row = progressByLesson.get(Number(lessonId));
                let fraction = 0;
                let status: "completed" | "in_progress" | "not_started" = "not_started";

                if (row) {
                    if (row.completed_at) {
                        fraction = 1;
                        status = "completed";
                    } else if (row.duration_seconds && row.duration_seconds > 0) {
                        fraction = Math.min(1, Math.max(0, Number(row.last_position_seconds || 0) / Number(row.duration_seconds)));
                        // Check if video is completed (>= 90% or within last 5 seconds)
                        const threshold = Math.max(row.duration_seconds * 0.9, row.duration_seconds - 5);
                        const currentPosition = Number(row.last_position_seconds || 0);
                        const duration = Number(row.duration_seconds);

                        console.log(`Lesson ${lessonId}: position=${currentPosition}, duration=${duration}, threshold=${threshold}`);
                        console.log(`Lesson ${lessonId}: position >= threshold? ${currentPosition >= threshold}`);

                        if (currentPosition >= threshold) {
                            status = "completed";
                            fraction = 1;
                            console.log(`Lesson ${lessonId}: MARKED AS COMPLETED`);
                        } else {
                            status = fraction > 0 ? "in_progress" : "not_started";
                            console.log(`Lesson ${lessonId}: status=${status}, fraction=${fraction}`);
                        }
                    } else {
                        const watched = Number(row.seconds_watched || 0);
                        status = watched > 0 ? "in_progress" : "not_started";
                        fraction = 0;
                    }
                } else {
                    status = "not_started";
                    fraction = 0;
                }

                totalFraction += fraction;
                if (status === "completed") countCompleted += 1;
                else if (status === "in_progress") countInProgress += 1;
                else countNotStarted += 1;

                lessonStatus[lessonId] = { status, percent: Math.round(fraction * 100) };
            }

            const overallPercent = Math.round((totalFraction / lessonIds.length) * 100);

            console.log('Final lesson status:', lessonStatus);
            console.log('Overall percent:', overallPercent);

            return NextResponse.json({
                lessonStatus,
                overallPercent,
                counts: {
                    total: lessonIds.length,
                    completed: countCompleted,
                    in_progress: countInProgress,
                    not_started: countNotStarted,
                },
            });
        }

        // Handle single lesson progress (original functionality)
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
            console.log(`POST: Lesson ${lessonId}: position=${nextPosition}, duration=${nextDuration}, threshold=${threshold}`);
            if (nextPosition >= threshold) {
                completedAt = new Date().toISOString();
                console.log(`POST: Lesson ${lessonId}: MARKED AS COMPLETED, completedAt=${completedAt}`);
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


