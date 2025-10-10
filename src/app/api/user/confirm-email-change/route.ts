import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ✅ หา profile จาก token
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, pending_email, email_change_expires")
      .eq("email_change_token", token)
      .single();

    if (profileError || !profile)
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

    if (new Date() > new Date(profile.email_change_expires))
      return NextResponse.json({ error: "Token expired" }, { status: 400 });

    // ✅ อัปเดต email จริงใน auth.users
    const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
      email: profile.pending_email,
    });
    if (updateError) throw updateError;

    // ✅ เคลียร์ token ออก
    await supabase
      .from("profiles")
      .update({
        pending_email: null,
        email_change_token: null,
        email_change_expires: null,
      })
      .eq("id", profile.id);

    return NextResponse.json({ success: true, message: "Email updated successfully" });
  } catch (error: unknown) {
    console.error("Error in confirm-email-change:", error);
  
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
  
    return NextResponse.json({ error: message }, { status: 500 });
  }
  
}
