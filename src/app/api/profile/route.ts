
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";

export async function PUT(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const first_name = formData.get("first_name") as string | null;
    const last_name = formData.get("last_name") as string | null;
    const date_of_birth = formData.get("date_of_birth") as string | null;
    const education = formData.get("education") as string | null;
    const file = formData.get("avatar") as File | null;

    let photo_url: string | null = null;

    if (file) {
      const ext = file.name.split(".").pop();
      const filePath = `${session.user.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      photo_url = publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name,
        last_name,
        date_of_birth,
        education,
        ...(photo_url ? { photo_url } : {}),
      })
      .eq("id", session.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
