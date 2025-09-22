import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Use service role on the server if available, otherwise fall back to anon.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

const supabase = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY || (ANON_KEY as string)
);

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const bucket = (form.get("bucket") as string) || "attachments";
    const folder = (form.get("folder") as string) || "misc";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const originalName = file.name || "upload";
    const fileExtension = originalName.includes(".")
      ? `.${originalName.split(".").pop()}`
      : "";
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const objectPath = `${folder}/${timestamp}-${randomSuffix}${fileExtension}`;

    const arrayBuffer = await file.arrayBuffer();
    const uploadRes = await supabase.storage
      .from(bucket)
      .upload(objectPath, Buffer.from(arrayBuffer), {
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadRes.error) {
      return NextResponse.json(
        { error: uploadRes.error.message },
        { status: 500 }
      );
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

    return NextResponse.json(
      {
        path: uploadRes.data.path,
        url: data.publicUrl,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


