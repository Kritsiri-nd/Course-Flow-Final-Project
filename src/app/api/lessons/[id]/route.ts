import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type SubLessonPayload = {
  title: string;
  video_url?: string | null;
  video_asset_id?: string | null;
};

// GET /api/lessons/[id] - fetch a module with its lessons
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const moduleId = parseInt(id, 10);
    if (Number.isNaN(moduleId)) {
      return NextResponse.json({ error: "Invalid module id" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    );

    // eslint-disable-next-line prefer-const
    let { data: moduleRow, error } = await supabase
      .from("modules")
      .select(
        `id, title, course_id, lessons ( id, title, video_url, video_asset_id, order_index )`
      )
      .eq("id", moduleId)
      .single();

    if (error) {
      if ((error as { code?: string }).code === "PGRST116") {
        // Fallback: Treat provided id as a lesson id and resolve its module
        const { data: lessonRow, error: lessonErr } = await supabase
          .from("lessons")
          .select("id, module_id")
          .eq("id", moduleId)
          .single();
        if (lessonErr || !lessonRow) {
          return NextResponse.json({ error: "Module not found" }, { status: 404 });
        }

        const { data: moduleFromLesson, error: modFromLessonErr } = await supabase
          .from("modules")
          .select(
            `id, title, course_id, lessons ( id, title, video_url, video_asset_id, order_index )`
          )
          .eq("id", lessonRow.module_id)
          .single();

        if (modFromLessonErr) {
          return NextResponse.json({ error: modFromLessonErr.message }, { status: 500 });
        }
        moduleRow = moduleFromLesson;
      } else {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json(moduleRow, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/lessons/[id] - update module title and replace lessons list
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const moduleId = parseInt(id, 10);
    if (Number.isNaN(moduleId)) {
      return NextResponse.json({ error: "Invalid module id" }, { status: 400 });
    }

    const body = await request.json();
    const {
      courseId,
      lessonTitle,
      subLessons,
    }: { courseId?: number | string; lessonTitle?: string; subLessons?: SubLessonPayload[] } = body || {};

    if (!lessonTitle || !Array.isArray(subLessons)) {
      return NextResponse.json(
        { error: "Missing/invalid fields: lessonTitle, subLessons" },
        { status: 400 }
      );
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    );

    // Verify module exists. If not, allow treating id as lesson id (resolve module_id)
    // eslint-disable-next-line prefer-const
    let { data: existingModule, error: findErr } = await admin
      .from("modules")
      .select("id, course_id")
      .eq("id", moduleId)
      .single();
    if (findErr || !existingModule) {
      const { data: lessonRow, error: lessonErr } = await admin
        .from("lessons")
        .select("id, module_id")
        .eq("id", moduleId)
        .single();
      if (lessonErr || !lessonRow) {
        return NextResponse.json({ error: "Module not found" }, { status: 404 });
      }
      const { data: moduleFromLesson, error: modFromLessonErr } = await admin
        .from("modules")
        .select("id, course_id")
        .eq("id", lessonRow.module_id)
        .single();
      if (modFromLessonErr || !moduleFromLesson) {
        return NextResponse.json({ error: "Module not found" }, { status: 404 });
      }
      existingModule = moduleFromLesson;
    }
    if (courseId && Number(existingModule.course_id) !== Number(courseId)) {
      return NextResponse.json({ error: "Module does not belong to the specified course" }, { status: 400 });
    }

    // Update module title
    const { error: updateModuleErr } = await admin
      .from("modules")
      .update({ title: lessonTitle })
      .eq("id", moduleId);
    if (updateModuleErr) {
      return NextResponse.json({ error: updateModuleErr.message }, { status: 500 });
    }

    // Replace lessons: delete existing then insert new with order
    const { error: deleteErr } = await admin
      .from("lessons")
      .delete()
      .eq("module_id", moduleId);
    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    const lessonsToInsert = (subLessons || []).map((s, idx) => ({
      module_id: moduleId,
      title: s.title,
      video_url: s.video_url ?? null,
      video_asset_id: s.video_asset_id ?? null,
      order_index: idx + 1,
    }));

    if (lessonsToInsert.length > 0) {
      const { error: insertErr } = await admin.from("lessons").insert(lessonsToInsert);
      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// DELETE /api/lessons/[id] - delete a module and its lessons
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const moduleId = parseInt(id, 10);
    if (Number.isNaN(moduleId)) {
      return NextResponse.json({ error: "Invalid module id" }, { status: 400 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    );

    // Ensure module exists, or resolve from lesson id
    // eslint-disable-next-line prefer-const
    let { data: moduleRow, error: modErr } = await admin
      .from("modules")
      .select("id")
      .eq("id", moduleId)
      .single();

    if (modErr || !moduleRow) {
      // Fallback: treat provided id as a lesson id → delete its module
      const { data: lessonRow, error: lessonErr } = await admin
        .from("lessons")
        .select("id, module_id")
        .eq("id", moduleId)
        .single();
      if (lessonErr || !lessonRow) {
        return NextResponse.json({ error: "Module not found" }, { status: 404 });
      }
      moduleRow = { id: lessonRow.module_id } as { id: number };
    }

    const idToDelete = (moduleRow as { id: number }).id;

    // Delete child lessons first to satisfy FKs (in case cascade isn't configured)
    const { error: delLessonsErr } = await admin
      .from("lessons")
      .delete()
      .eq("module_id", idToDelete);
    if (delLessonsErr) {
      return NextResponse.json({ error: delLessonsErr.message }, { status: 500 });
    }

    const { error: delModuleErr } = await admin
      .from("modules")
      .delete()
      .eq("id", idToDelete);
    if (delModuleErr) {
      return NextResponse.json({ error: delModuleErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


