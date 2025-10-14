import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createSupabaseServerClient();

        // Check session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Get user's submission for this assignment
        const { data: submission, error } = await supabase
            .from('user_assignment_submissions')
            .select('*')
            .eq('assignment_id', id)
            .eq('user_id', session.user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching submission:', error);
            return NextResponse.json(
                { error: "Failed to fetch submission" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            submission: submission || null
        }, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/assignments/[id]/submission:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
