import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";

export async function POST(req: Request) {
  try {
    const { token, new_email, expires } = await req.json();

    if (!token || !new_email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // ✅ ดึง user จาก session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ บันทึก token, pending_email, วันหมดอายุ ลง profiles
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        pending_email: new_email,
        email_change_token: token,
        email_change_expires: expires,
      })
      .eq("id", session.user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ save-email-token error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
