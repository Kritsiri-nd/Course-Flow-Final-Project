import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // ตรวจสอบ session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assignmentId, answer } = body;

    if (!assignmentId || !answer) {
      return NextResponse.json(
        { error: "Assignment ID and answer are required" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า assignment มีอยู่จริงหรือไม่
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('id')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // ตรวจสอบว่า user มี submission อยู่แล้วหรือไม่
    const { data: existingSubmission } = await supabase
      .from('user_assignment_submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('user_id', session.user.id)
      .single();

    let result;
    if (existingSubmission) {
      // อัปเดต submission ที่มีอยู่
      const { data, error } = await supabase
        .from('user_assignment_submissions')
        .update({
          answer,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', existingSubmission.id)
        .select()
        .single();

      result = { data, error };
    } else {
      // สร้าง submission ใหม่
      const { data, error } = await supabase
        .from('user_assignment_submissions')
        .insert({
          assignment_id: assignmentId,
          user_id: session.user.id,
          answer,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error('Error saving assignment submission:', result.error);
      return NextResponse.json(
        { error: "Failed to save assignment submission" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in assignment submission:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // ตรวจสอบ session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assignmentId, answer } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า assignment มีอยู่จริงหรือไม่
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('id')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // ตรวจสอบว่า user มี submission อยู่แล้วหรือไม่
    const { data: existingSubmission } = await supabase
      .from('user_assignment_submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('user_id', session.user.id)
      .single();

    let result;
    if (existingSubmission) {
      // อัปเดต submission ที่มีอยู่
      const { data, error } = await supabase
        .from('user_assignment_submissions')
        .update({
          answer: answer || '',
          status: answer && answer.trim() ? 'in-progress' : 'pending'
        })
        .eq('id', existingSubmission.id)
        .select()
        .single();

      result = { data, error };
    } else {
      // สร้าง submission ใหม่
      const { data, error } = await supabase
        .from('user_assignment_submissions')
        .insert({
          assignment_id: assignmentId,
          user_id: session.user.id,
          answer: answer || '',
          status: answer && answer.trim() ? 'in-progress' : 'pending'
        })
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error('Error updating assignment submission:', result.error);
      return NextResponse.json(
        { error: "Failed to update assignment submission" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in assignment update:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
