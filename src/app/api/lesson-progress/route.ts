import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import {
    isLessonCompleted,
    calculateProgressPercent,
    getLessonStatus,
    capWatchTime,
    hasVisitedLesson,
    type LessonStatus,
} from "@/lib/lessonProgressUtils";

// ====== GET: ดึงข้อมูล progress ======
// GET /api/lesson-progress?lesson_id=123 (บทเรียนเดียว)
// GET /api/lesson-progress?course_id=123&bulk=true (ทุกบทเรียนในคอร์ส)
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

        // ถ้าขอข้อมูลทั้งคอร์ส (bulk mode)
        if (courseIdParam && bulkParam === "true") {
            return handleBulkProgress(supabase, user.id, Number(courseIdParam));
        }

        // ถ้าขอข้อมูลบทเรียนเดียว
        if (!lessonIdParam) {
            return NextResponse.json({ error: "lesson_id is required" }, { status: 400 });
        }

        const lessonId = Number(lessonIdParam);
        if (!Number.isFinite(lessonId)) {
            return NextResponse.json({ error: "Invalid lesson_id" }, { status: 400 });
        }

        // ดึงข้อมูล progress ของบทเรียนนี้
        const { data, error } = await supabase
            .from("lesson_progress")
            .select("*")
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

// ====== ฟังก์ชันจัดการ bulk progress (ทั้งคอร์ส) ======
async function handleBulkProgress(supabase: any, userId: string, courseId: number) {
    if (!Number.isFinite(courseId)) {
        return NextResponse.json({ error: "Invalid course_id" }, { status: 400 });
    }

    // 1. ดึง lesson IDs ทั้งหมดในคอร์สนี้
    const lessonIds = await fetchLessonIds(supabase, courseId);

    if (lessonIds.length === 0) {
        return NextResponse.json({
            lessonStatus: {},
            overallPercent: 0,
            counts: { total: 0, completed: 0, in_progress: 0, not_started: 0 },
        });
    }

    // 2. ดึงข้อมูล progress ของ user
    const progressMap = await fetchProgressData(supabase, userId, lessonIds);

    console.log("Raw progress data:", Array.from(progressMap.values()));
    console.log("Lesson IDs:", lessonIds);

    // 3. คำนวณสถานะของแต่ละบทเรียน
    const result = calculateLessonStatuses(lessonIds, progressMap);

    console.log("Final lesson status:", result.lessonStatus);
    console.log("Overall percent:", result.overallPercent);

    return NextResponse.json(result);
}

// ดึง lesson IDs ทั้งหมดในคอร์ส
async function fetchLessonIds(supabase: any, courseId: number): Promise<number[]> {
    const { data: modulesData, error } = await supabase
        .from("modules")
        .select("id, course_id, lessons ( id, title )")
        .eq("course_id", courseId);

    if (error) {
        throw error;
    }

    const lessonIds = (modulesData ?? [])
        .flatMap((m: any) => (m?.lessons ?? []).map((l: any) => Number(l.id)))
        .filter((id: number) => Number.isFinite(id));

    return lessonIds;
}

// ดึงข้อมูล progress ทั้งหมด
async function fetchProgressData(
    supabase: any,
    userId: string,
    lessonIds: number[]
): Promise<Map<number, any>> {
    const { data: progressRows, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, duration_seconds, last_position_seconds, seconds_watched, completed_at")
        .eq("user_id", userId)
        .in("lesson_id", lessonIds);

    if (error) {
        throw error;
    }

    // แปลงเป็น Map เพื่อเข้าถึงง่าย
    const progressMap = new Map<number, any>();
    for (const row of progressRows ?? []) {
        progressMap.set(Number(row.lesson_id), row);
    }

    return progressMap;
}

// คำนวณสถานะของแต่ละบทเรียน
function calculateLessonStatuses(
    lessonIds: number[],
    progressMap: Map<number, any>
) {
    let totalPercent = 0;
    let countCompleted = 0;
    let countInProgress = 0;
    let countNotStarted = 0;

    const lessonStatus: Record<
        number,
        { status: LessonStatus; percent: number }
    > = {};

    for (const lessonId of lessonIds) {
        const progressData = progressMap.get(lessonId);

        // คำนวณสถานะของบทเรียนนี้
        const result = calculateSingleLessonStatus(progressData);

        // เก็บผลลัพธ์
        lessonStatus[lessonId] = {
            status: result.status,
            percent: result.percent,
        };

        totalPercent += result.percent;

        // นับจำนวนแต่ละสถานะ
        if (result.status === "completed") countCompleted++;
        else if (result.status === "in_progress") countInProgress++;
        else countNotStarted++;
    }

    const overallPercent = Math.round(totalPercent / lessonIds.length);

    return {
        lessonStatus,
        overallPercent,
        counts: {
            total: lessonIds.length,
            completed: countCompleted,
            in_progress: countInProgress,
            not_started: countNotStarted,
        },
    };
}

// คำนวณสถานะของบทเรียนเดียว
function calculateSingleLessonStatus(progressData: any) {
    // ถ้าไม่มีข้อมูล = ยังไม่เริ่มเรียน
    if (!progressData) {
        return { status: "not_started" as LessonStatus, percent: 0 };
    }

    const duration = Number(progressData.duration_seconds || 0);
    const position = Number(progressData.last_position_seconds || 0);
    const watched = Number(progressData.seconds_watched || 0);
    const hasCompletedAt = !!progressData.completed_at;

    // กรณีไม่มีวิดีโอ (duration <= 0) - auto complete ทันที
    if (duration <= 0) {
        const hasVisited = hasVisitedLesson(progressData);

        if (hasVisited) {
            console.log(`Lesson ${progressData.lesson_id}: No video and visited - COMPLETED`);
            return { status: "completed" as LessonStatus, percent: 100 };
        } else {
            console.log(`Lesson ${progressData.lesson_id}: No video but not visited - NOT STARTED`);
            return { status: "not_started" as LessonStatus, percent: 0 };
        }
    }

    // กรณีมีวิดีโอ - ใช้ logic เดิม
    // ถ้ามี completed_at แล้ว = ให้ยึดถือว่าจบแล้ว ไม่ต้องคำนวณใหม่
    const completed = hasCompletedAt ? true : isLessonCompleted(position, watched, duration);

    // คำนวณ percent
    const percent = completed ? 100 : calculateProgressPercent(position, watched, duration);
    const status = getLessonStatus(true, completed, watched);

    console.log(`Lesson ${progressData.lesson_id}: position=${position}s, watched=${watched}s, duration=${duration}s`);
    console.log(`Lesson ${progressData.lesson_id}: status=${status}, percent=${Math.round(percent)}%`);

    return { status, percent: Math.round(percent) };
}

// ====== POST: บันทึก progress ======
// Body: { lesson_id: number; duration_seconds?: number; last_position_seconds?: number; seconds_watched?: number }
export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // อ่านข้อมูลจาก request body
        const body = await request.json();
        const lessonId = Number(body?.lesson_id);

        if (!Number.isFinite(lessonId)) {
            return NextResponse.json({ error: "lesson_id is required" }, { status: 400 });
        }

        const duration = body?.duration_seconds != null ? Math.max(0, Number(body.duration_seconds)) : undefined;
        const position = body?.last_position_seconds != null ? Math.max(0, Number(body.last_position_seconds)) : undefined;
        const watchedInc = body?.seconds_watched != null ? Math.max(0, Number(body.seconds_watched)) : 0;

        // ดึงข้อมูลเดิม (ถ้ามี)
        const { data: existing, error: fetchErr } = await supabase
            .from("lesson_progress")
            .select("id, duration_seconds, last_position_seconds, seconds_watched, completed_at")
            .eq("user_id", user.id)
            .eq("lesson_id", lessonId)
            .maybeSingle();

        if (fetchErr) {
            return NextResponse.json({ error: fetchErr.message }, { status: 500 });
        }

        // คำนวณค่าใหม่
        const nextDuration = duration ?? existing?.duration_seconds ?? null;

        // ใช้ตำแหน่งล่าสุดที่ส่งมา (ไม่ใช่ค่าที่มากที่สุด)
        // เพื่อให้ user สามารถ seek backward และ resume จากตำแหน่งนั้นได้
        const nextPosition = position !== undefined ? position : (existing?.last_position_seconds ?? 0);

        // จำกัด watch time ไม่ให้สูงเกินไป
        const existingWatchTime = existing?.seconds_watched ?? 0;
        const cappedWatchTime = capWatchTime(existingWatchTime, nextDuration);
        const maxAllowed = nextDuration ? nextDuration * 5 : 1800;
        const nextWatched = Math.min(cappedWatchTime + watchedInc, maxAllowed);

        console.log(`POST Lesson ${lessonId}: position ${existing?.last_position_seconds ?? 0}s → ${nextPosition}s`);
        console.log(`POST Lesson ${lessonId}: watched ${existingWatchTime}s → ${nextWatched}s, duration=${nextDuration}s`);

        // ตรวจสอบว่าจบหรือยัง
        let completedAt = existing?.completed_at ?? null;

        // กรณีไม่มีวิดีโอ (duration <= 0) - auto complete ทันที
        if (!completedAt && (!nextDuration || nextDuration <= 0)) {
            completedAt = new Date().toISOString();
            console.log(`POST: Lesson ${lessonId} COMPLETED (no video)!`);
        }
        // กรณีมีวิดีโอ - ใช้ logic เดิม
        else if (!completedAt && nextDuration && nextDuration > 0) {
            const completed = isLessonCompleted(nextPosition, nextWatched, nextDuration);

            if (completed) {
                completedAt = new Date().toISOString();
                console.log(`POST: Lesson ${lessonId} COMPLETED!`);
            } else {
                console.log(`POST: Lesson ${lessonId} not yet completed (position=${nextPosition}, watched=${nextWatched})`);
            }
        }

        // บันทึกลง database
        const updateData = {
            duration_seconds: nextDuration,
            last_position_seconds: nextPosition,
            seconds_watched: nextWatched,
            completed_at: completedAt,
            updated_at: new Date().toISOString(),
        };

        if (existing?.id) {
            // Update ข้อมูลเดิม
            const { data, error } = await supabase
                .from("lesson_progress")
                .update(updateData)
                .eq("id", existing.id)
                .select()
                .single();

            if (error) {
                console.error(`POST: Update error:`, error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json(data, { status: 200 });
        }

        // Insert ข้อมูลใหม่
        const { data, error } = await supabase
            .from("lesson_progress")
            .insert({
                user_id: user.id,
                lesson_id: lessonId,
                ...updateData,
            })
            .select()
            .single();

        if (error) {
            console.error(`POST: Insert error:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (e: unknown) {
        console.error("POST error:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}