import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";

export async function PUT(req: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();

  const first_name = formData.get("first_name") as string | null;
  const last_name = formData.get("last_name") as string | null;
  const date_of_birth = formData.get("date_of_birth") as string | null;
  const education = formData.get("education") as string | null;
  const avatarFile = formData.get("avatar") as File | null;

  let photo_url: string | null = null;

  // ถ้ามีการอัปโหลดไฟล์ใหม่
  if (avatarFile && avatarFile.size > 0) {
    const fileName = `${session.user.id}-${Date.now()}.${avatarFile.name.split(".").pop()}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars") // bucket
      .upload(fileName, avatarFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    photo_url = publicUrlData.publicUrl;
  }

  // update profile table
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      first_name,
      last_name,
      date_of_birth,
      education,
      ...(photo_url ? { photo_url } : {}), // อัปเดต photo_url เฉพาะตอนมีรูป
    })
    .eq("id", session.user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
