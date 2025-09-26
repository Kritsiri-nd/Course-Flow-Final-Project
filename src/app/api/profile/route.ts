import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import { validateFirstName, validateLastName, validateDateOfBirth, validateEmail, validateEducationalBackground } from "@/lib/validators";

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

  // Server-side validation
  const validationErrors: string[] = [];

  // First name validation
  if (first_name) {
    const firstNameValidation = validateFirstName(first_name);
    if (!firstNameValidation.isValid) {
      validationErrors.push(firstNameValidation.message!);
    }
  }

  // Last name validation
  if (last_name) {
    const lastNameValidation = validateLastName(last_name);
    if (!lastNameValidation.isValid) {
      validationErrors.push(lastNameValidation.message!);
    }
  }

  // Date of birth validation
  if (date_of_birth) {
    const dobValidation = validateDateOfBirth(date_of_birth);
    if (!dobValidation.isValid) {
      validationErrors.push(dobValidation.message!);
    }
  }

  // Email validation
  if (email) {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      validationErrors.push(emailValidation.message!);
    }
  }

  // Education validation
  if (education) {
    const educationValidation = validateEducationalBackground(education);
    if (!educationValidation.isValid) {
      validationErrors.push(educationValidation.message!);
    }
  }

  // If there are validation errors, return them
  if (validationErrors.length > 0) {
    return NextResponse.json(
      { error: validationErrors.join(' ') },
      { status: 400 }
    );
  }

  let photo_url: string | null = null;

  // ✅ Upload Avatar ถ้ามี
  if (avatarFile && avatarFile.size > 0) {
    const fileName = `${session.user.id}-${Date.now()}.${avatarFile.name.split(".").pop()}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
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

  // ✅ Update profiles table
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

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // ✅ Update email (Auth table)
  if (email && email !== session.user.email) {
    const { error: emailError } = await supabase.auth.updateUser({ email });
    if (emailError) {
      return NextResponse.json({ error: emailError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
