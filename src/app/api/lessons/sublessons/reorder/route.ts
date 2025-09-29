import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type SubLessonOrderUpdate = {
  id: number;
  order_index: number;
};

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      moduleId, 
      subLessonOrders 
    }: { 
      moduleId: number | string; 
      subLessonOrders: SubLessonOrderUpdate[] 
    } = body || {};

    const numericModuleId = Number(moduleId);

    if (!Number.isFinite(numericModuleId) || !Array.isArray(subLessonOrders)) {
      return NextResponse.json(
        { error: "Missing/invalid fields: moduleId, subLessonOrders" },
        { status: 400 }
      );
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    );

    // Verify module exists
    const { data: moduleRow, error: moduleErr } = await admin
      .from("modules")
      .select("id")
      .eq("id", numericModuleId)
      .single();

    if (moduleErr || !moduleRow) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Update each lesson's order_index
    const updatePromises = subLessonOrders.map(({ id, order_index }) =>
      admin
        .from("lessons")
        .update({ order_index })
        .eq("id", id)
        .eq("module_id", numericModuleId)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for any errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error("Failed to update sub-lesson orders:", errors);
      return NextResponse.json(
        { error: "Failed to update some sub-lesson orders" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("Unexpected error reordering sub-lessons:", e?.message || e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
