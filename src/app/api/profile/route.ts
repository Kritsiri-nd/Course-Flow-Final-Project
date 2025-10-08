import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import {
  validateFirstName,
  validateLastName,
  validateDateOfBirth,
  validateEmail,
  validateEducationalBackground,
} from "@/lib/validators";
import { revalidatePath } from "next/cache";

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
  const email = formData.get("email") as string | null;
  const avatarFile = formData.get("avatar") as File | null;

  // ✅ Validate ข้อมูลก่อน
  const validationErrors: string[] = [];

  const validators = [
    { fn: validateFirstName, value: first_name },
    { fn: validateLastName, value: last_name },
    { fn: validateDateOfBirth, value: date_of_birth },
    { fn: validateEducationalBackground, value: education },
    { fn: validateEmail, value: email },
  ];

  for (const v of validators) {
    if (v.value) {
      const result = v.fn(v.value);
      if (!result.isValid) validationErrors.push(result.message!);
    }
  }

  if (validationErrors.length > 0)
    return NextResponse.json({ error: validationErrors.join(" ") }, { status: 400 });

  // ✅ Upload รูป
  let photo_url: string | null = null;

  if (avatarFile && avatarFile.size > 0) {
    const fileName = `${session.user.id}-${Date.now()}.${avatarFile.name.split(".").pop()}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, { upsert: true });

    if (uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    photo_url = publicUrlData.publicUrl;
  }

  // ✅ Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      first_name,
      last_name,
      date_of_birth,
      education,
      ...(photo_url ? { photo_url } : {}),
    })
    .eq("id", session.user.id);

  if (updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 });


  revalidatePath("/user/profile");
  return NextResponse.json({ success: true });
}
