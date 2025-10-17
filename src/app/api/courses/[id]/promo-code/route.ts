import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// GET /api/courses/[id]/promo-code - Get promo code for a specific course
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

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
        );

        // Get promo code linked to this course
        const { data, error } = await supabase
            .from("promo_codes")
            .select(`
                id,
                code,
                discount_type,
                discount_value,
                min_purchase_amount,
                applies_to_all_courses,
                promo_code_courses!inner(course_id)
            `)
            .eq("promo_code_courses.course_id", courseId)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                // No promo code found for this course
                return NextResponse.json(null, { status: 200 });
            }
            console.error("Error fetching promo code:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error("Error fetching promo code:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
