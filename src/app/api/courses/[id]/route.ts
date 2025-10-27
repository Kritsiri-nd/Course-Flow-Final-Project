import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";

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

        const supabase = await createSupabaseServerClient();

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
        attachment_url,
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
            content,
            video_url,
            video_asset_id,
            order_index,
            created_at
          )
        )
      `)
            .eq("id", courseId)
            .order("order_index", { referencedTable: "modules" })
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
<<<<<<< HEAD
            modules: (data?.modules ?? [])
                .map((m: { lessons?: unknown[] }) => ({
                    ...m,
                    lessons: (m.lessons ?? []).sort((a: any, b: any) => {
                        const aIndex = a.order_index ?? a.id;
                        const bIndex = b.order_index ?? b.id;
                        return aIndex - bIndex;
                    }),
                }))
                .sort((a: any, b: any) => {
                    const aIndex = a.order_index ?? a.id;
                    const bIndex = b.order_index ?? b.id;
                    return aIndex - bIndex;
                }),
=======
            modules: (data?.modules ?? []).map((m: { lessons?: unknown[] }) => ({
                ...m,
                lessons: (m.lessons ?? []).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)),
            })),
>>>>>>> ce67ee5 (feat: Enhance lesson deletion functionality in LessonManagement component)
        };

        return NextResponse.json(normalized, { status: 200 });
    } catch (err: unknown) {
        console.error("Error fetching course:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/courses/[id] - Update a course
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const courseId = parseInt(id, 10);
        if (Number.isNaN(courseId)) {
            return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
        }

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
            attachment_url,
            instructor,
            duration_hours,
            promo_code,
        } = body ?? {};

        // Basic validation mirroring POST API
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
            attachment_url: attachment_url ?? null,
            instructor: instructor ?? null,
            duration_hours,
        };

        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
        );

        const { data: courseData, error } = await adminSupabase
            .from("courses")
            .update(payload)
            .eq("id", courseId)
            .select()
            .single();

        if (error) {
            console.error("Error updating course:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Handle promo code update if provided
        if (promo_code && promo_code.enabled && promo_code.code && promo_code.discountValue) {
            try {
                // First, check if there's an existing promo code for this course
                const { data: existingPromoCode, error: fetchError } = await adminSupabase
                    .from("promo_codes")
                    .select(`
                        id,
                        promo_code_courses!inner(course_id)
                    `)
                    .eq("promo_code_courses.course_id", courseId)
                    .single();

                const promoCodeData = {
                    code: promo_code.code.toUpperCase(),
                    discount_type: promo_code.discountType === "amount" ? "fixed" : "percentage",
                    discount_value: parseFloat(promo_code.discountValue),
                    min_purchase_amount: parseFloat(promo_code.minPurchaseAmount || "0"),
                    applies_to_all_courses: false,
                };

                if (existingPromoCode && !fetchError) {
                    // Update existing promo code
                    const { error: updateError } = await adminSupabase
                        .from("promo_codes")
                        .update(promoCodeData)
                        .eq("id", existingPromoCode.id);

                    if (updateError) {
                        console.error("Error updating promo code:", updateError);
                    }
                } else {
                    // Create new promo code and link to course
                    const { data: newPromoCode, error: createError } = await adminSupabase
                        .from("promo_codes")
                        .insert(promoCodeData)
                        .select("id")
                        .single();

                    if (createError) {
                        console.error("Error creating promo code:", createError);
                    } else if (newPromoCode) {
                        // Link promo code to the course
                        const { error: linkError } = await adminSupabase
                            .from("promo_code_courses")
                            .insert({
                                promo_code_id: newPromoCode.id,
                                course_id: courseId,
                            });

                        if (linkError) {
                            console.error("Error linking promo code to course:", linkError);
                        }
                    }
                }
            } catch (promoError) {
                console.error("Unexpected error handling promo code:", promoError);
            }
        }

        return NextResponse.json(courseData, { status: 200 });
    } catch (err: unknown) {
        console.error("Unexpected error updating course:", (err as Error)?.message || err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/courses/[id] - Delete a course
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const courseId = parseInt(id, 10);
        if (Number.isNaN(courseId)) {
            return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
        }

        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
        );

        const { error } = await adminSupabase
            .from("courses")
            .delete()
            .eq("id", courseId);

        if (error) {
            console.error("Error deleting course:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err: unknown) {
        console.error("Unexpected error deleting course:", (err as Error)?.message || err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}