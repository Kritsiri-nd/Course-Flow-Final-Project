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
                        // Verify that the completion is still valid based on current data
                        const duration = Number(row.duration_seconds || 0);
                        const currentPosition = Number(row.last_position_seconds || 0);
                        const watchedTime = Number(row.seconds_watched || 0);

                        if (duration > 0) {
                            const positionThreshold = Math.max(duration * 0.9, duration - 5);

                            // Adaptive threshold based on video duration and watch behavior
                            let watchTimeThreshold;
                            if (duration <= 30) {
                                watchTimeThreshold = Math.max(duration * 0.2, 5);
                            } else if (duration <= 120) {
                                if (watchedTime >= duration * 0.6) {
                                    watchTimeThreshold = duration * 0.25;
                                } else {
                                    watchTimeThreshold = duration * 0.4;
                                }
                            } else if (duration <= 600) {
                                if (watchedTime >= duration * 0.5) {
                                    watchTimeThreshold = duration * 0.3;
                                } else {
                                    watchTimeThreshold = duration * 0.45;
                                }
                            } else {
                                if (watchedTime >= duration * 0.4) {
                                    watchTimeThreshold = duration * 0.35;
                                } else {
                                    watchTimeThreshold = duration * 0.5;
                                }
                            }

                            // Re-validate completion: must satisfy BOTH conditions
                            if (currentPosition >= positionThreshold && watchedTime >= watchTimeThreshold) {
                                fraction = 1;
                                status = "completed";
                            } else {
                                // Completion is invalid, treat as in-progress and remove completed_at
                                fraction = Math.min(1, Math.max(0, currentPosition / duration));
                                status = "in_progress";

                                // Remove invalid completion from database
                                await supabase
                                    .from("lesson_progress")
                                    .update({ completed_at: null })
                                    .eq("lesson_id", lessonId)
                                    .eq("user_id", user.id);
                            }
                        } else {
                            fraction = 1;
                            status = "completed";
                        }
                    } else if (row.duration_seconds && row.duration_seconds > 0) {
                        fraction = Math.min(1, Math.max(0, Number(row.last_position_seconds || 0) / Number(row.duration_seconds)));
                        // Check if video is completed: >= 90% position AND adaptive real watch time based on video length
                        const positionThreshold = Math.max(row.duration_seconds * 0.9, row.duration_seconds - 5);
                        const currentPosition = Number(row.last_position_seconds || 0);
                        const watchedTime = Number(row.seconds_watched || 0);
                        const duration = Number(row.duration_seconds);

                        // Adaptive threshold based on video duration and watch behavior
                        let watchTimeThreshold;
                        if (duration <= 30) {
                            // Very short videos (≤30s): Very lenient, just need to reach the end
                            watchTimeThreshold = Math.max(duration * 0.2, 5); // At least 20% or 5 seconds
                        } else if (duration <= 120) {
                            // Short videos (30s-2min): Lenient for normal viewing, stricter for skipping
                            if (watchedTime >= duration * 0.6) {
                                watchTimeThreshold = duration * 0.25; // Allow x2 speed (50% real time)
                            } else {
                                watchTimeThreshold = duration * 0.4; // Block excessive skipping
                            }
                        } else if (duration <= 600) {
                            // Medium videos (2-10min): Balanced approach
                            if (watchedTime >= duration * 0.5) {
                                watchTimeThreshold = duration * 0.3; // Allow x2 speed
                            } else {
                                watchTimeThreshold = duration * 0.45; // Block skipping
                            }
                        } else {
                            // Long videos (>10min): Stricter to ensure engagement
                            if (watchedTime >= duration * 0.4) {
                                watchTimeThreshold = duration * 0.35; // Allow x2 speed
                            } else {
                                watchTimeThreshold = duration * 0.5; // Block skipping
                            }
                        }

                        // Video length category for logging
                        let category = "";
                        if (duration <= 30) category = "very short";
                        else if (duration <= 120) category = "short";
                        else if (duration <= 600) category = "medium";
                        else category = "long";

                        console.log(`Lesson ${lessonId}: position=${currentPosition}, watched=${watchedTime}, duration=${duration}`);
                        console.log(`Lesson ${lessonId}: Video category: ${category} (${duration}s)`);
                        console.log(`Lesson ${lessonId}: position >= threshold? ${currentPosition >= positionThreshold}`);
                        console.log(`Lesson ${lessonId}: watched >= threshold? ${watchedTime >= watchTimeThreshold}`);
                        console.log(`Lesson ${lessonId}: Threshold: ${Math.round(watchTimeThreshold)}s (${Math.round((watchTimeThreshold / duration) * 100)}% of video)`);

                        // Must satisfy BOTH conditions: reached near end AND watched enough real time
                        if (currentPosition >= positionThreshold && watchedTime >= watchTimeThreshold) {
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
        // Cap seconds_watched to prevent integer overflow and unreasonable values
        const MAX_SECONDS_WATCHED = 2000000000; // 2 billion seconds (~63 years)
        const existingWatchTime = existing?.seconds_watched ?? 0;

        // If existing watch time is unreasonable (more than 5x video duration), cap it
        const maxReasonableForVideo = nextDuration ? nextDuration * 5 : 1800; // 5x video length or 30 minutes
        const cappedExisting = Math.min(existingWatchTime, maxReasonableForVideo);

        const nextWatched = Math.round(Math.min(
            cappedExisting + watchedInc,
            maxReasonableForVideo
        ));

        console.log(`POST: Watch time capping: existing=${existingWatchTime}, capped=${cappedExisting}, video=${nextDuration}, maxReasonable=${maxReasonableForVideo}, final=${nextWatched}`);

        // Completion heuristic: >= 90% position AND adaptive real watch time based on video length
        let completedAt = existing?.completed_at ?? null as string | null;
        if (!completedAt && nextDuration && nextDuration > 0) {
            const positionThreshold = Math.max(nextDuration * 0.9, nextDuration - 5);

            // Adaptive threshold based on video duration and watch behavior
            let watchTimeThreshold;
            const duration = nextDuration;
            const watched = nextWatched;

            if (duration <= 30) {
                // Very short videos (≤30s): Very lenient, just need to reach the end
                watchTimeThreshold = Math.max(duration * 0.2, 5); // At least 20% or 5 seconds
            } else if (duration <= 120) {
                // Short videos (30s-2min): Lenient for normal viewing, stricter for skipping
                if (watched >= duration * 0.6) {
                    watchTimeThreshold = duration * 0.25; // Allow x2 speed (50% real time)
                } else {
                    watchTimeThreshold = duration * 0.4; // Block excessive skipping
                }
            } else if (duration <= 600) {
                // Medium videos (2-10min): Balanced approach
                if (watched >= duration * 0.5) {
                    watchTimeThreshold = duration * 0.3; // Allow x2 speed
                } else {
                    watchTimeThreshold = duration * 0.45; // Block skipping
                }
            } else {
                // Long videos (>10min): Stricter to ensure engagement
                if (watched >= duration * 0.4) {
                    watchTimeThreshold = duration * 0.35; // Allow x2 speed
                } else {
                    watchTimeThreshold = duration * 0.5; // Block skipping
                }
            }

            // Video length category for logging
            let category = "";
            if (duration <= 30) category = "very short";
            else if (duration <= 120) category = "short";
            else if (duration <= 600) category = "medium";
            else category = "long";

            console.log(`POST: Lesson ${lessonId}: position=${nextPosition}, watched=${watched}, duration=${duration}`);
            console.log(`POST: Video category: ${category} (${duration}s)`);
            console.log(`POST: Position check: ${nextPosition} >= ${positionThreshold}? ${nextPosition >= positionThreshold}`);
            console.log(`POST: Watch time check: ${watched} >= ${watchTimeThreshold}? ${watched >= watchTimeThreshold}`);
            console.log(`POST: Threshold: ${Math.round(watchTimeThreshold)}s (${Math.round((watchTimeThreshold / duration) * 100)}% of video)`);

            // Must satisfy BOTH conditions: reached near end AND watched enough real time
            if (nextPosition >= positionThreshold && nextWatched >= watchTimeThreshold) {
                completedAt = new Date().toISOString();
                console.log(`POST: Lesson ${lessonId}: MARKED AS COMPLETED, completedAt=${completedAt}`);
            } else if (nextPosition >= positionThreshold && nextWatched < watchTimeThreshold) {
                console.log(`POST: Lesson ${lessonId}: Position reached but insufficient watch time (${nextWatched}/${watchTimeThreshold})`);
            }
        }

        if (existing?.id) {
            const updateData: any = {
                duration_seconds: nextDuration,
                last_position_seconds: nextPosition,
                seconds_watched: nextWatched,
                updated_at: new Date().toISOString(),
            };

            // Only update completed_at if we're actually marking it as complete
            if (completedAt) {
                updateData.completed_at = completedAt;
            }

            const { data, error } = await supabase
                .from("lesson_progress")
                .update(updateData)
                .eq("id", existing.id)
                .select()
                .single();
            if (error) {
                console.error(`POST: Lesson ${lessonId} UPDATE ERROR:`, error);
                console.error(`POST: Update data:`, {
                    duration_seconds: nextDuration,
                    last_position_seconds: nextPosition,
                    seconds_watched: nextWatched,
                    completed_at: completedAt,
                    existing_id: existing.id
                });
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
            console.error(`POST: Lesson ${lessonId} INSERT ERROR:`, error);
            console.error(`POST: Insert data:`, {
                user_id: user.id,
                lesson_id: lessonId,
                duration_seconds: nextDuration,
                last_position_seconds: nextPosition,
                seconds_watched: nextWatched,
                completed_at: completedAt,
            });
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(data, { status: 201 });
    } catch (e: unknown) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


