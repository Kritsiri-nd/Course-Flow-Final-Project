// src/app/api/profile/photo/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const filePath = `${session.user.id}/avatar-${Date.now()}-${randomUUID()}.${ext}`;

  // ⬆️ path = <uid>/avatar-<timestamp>-<uuid>.ext
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
  const publicUrl = urlData.publicUrl;

  // อัปเดต photo_url ใน profiles
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ photo_url: publicUrl })
    .eq("id", session.user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, url: publicUrl });
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // เซ็ต photo_url = null
  const { error } = await supabase
    .from("profiles")
    .update({ photo_url: null })
    .eq("id", session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
