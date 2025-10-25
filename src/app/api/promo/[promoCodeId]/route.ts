import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ promoCodeId: string }> }
) {
  try {
    const { promoCodeId } = await params;
    const supabase = await createSupabaseServerClient();

    // First, delete associated course mappings
    const { error: coursesError } = await supabase
      .from("promo_code_courses")
      .delete()
      .eq("promo_code_id", promoCodeId);

    if (coursesError) {
      console.error("Error deleting promo code courses:", coursesError);
      return NextResponse.json(
        { error: "Failed to delete promo code course associations" },
        { status: 500 }
      );
    }

    // Then delete the promo code itself
    const { error: promoError } = await supabase
      .from("promo_codes")
      .delete()
      .eq("id", promoCodeId);

    if (promoError) {
      console.error("Error deleting promo code:", promoError);
      return NextResponse.json(
        { error: "Failed to delete promo code" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Promo code deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/promo/[promoCodeId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
