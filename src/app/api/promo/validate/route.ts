import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";

export async function POST(request: NextRequest) {
  try {
    const { promoCode, courseId, userId } = await request.json();

    if (!promoCode || !courseId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: promoCode, courseId, userId" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // ดึงข้อมูลโปรโมโค้ด
    const { data: promo, error: promoError } = await supabase
      .from("promo_codes")
      .select(`
        id,
        code,
        discount_type,
        discount_value,
        min_purchase_amount,
        is_active,
        applies_to_all_courses,
        promo_code_courses (
          course_id
        )
      `)
      .eq("code", promoCode.toUpperCase())
      .eq("is_active", true)
      .single();

    if (promoError || !promo) {
      return NextResponse.json(
        { 
          valid: false, 
          error: "Invalid or inactive promo code" 
        },
        { status: 200 }
      );
    }

    // ดึงข้อมูลคอร์ส
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, price, currency")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าคอร์สนี้ใช้โปรโมโค้ดได้หรือไม่
    const isCourseEligible = promo.applies_to_all_courses || 
      promo.promo_code_courses.some((pcc: any) => pcc.course_id === courseId);

    if (!isCourseEligible) {
      return NextResponse.json(
        { 
          valid: false, 
          error: "This promo code is not valid for the selected course" 
        },
        { status: 200 }
      );
    }

    // ตรวจสอบยอดซื้อขั้นต่ำ
    if (course.price < promo.min_purchase_amount) {
      return NextResponse.json(
        { 
          valid: false, 
          error: `Minimum purchase amount is ${promo.min_purchase_amount.toLocaleString()} THB` 
        },
        { status: 200 }
      );
    }

    // คำนวณส่วนลด
    let discountAmount = 0;
    if (promo.discount_type === "fixed") {
      discountAmount = Math.min(promo.discount_value, course.price);
    } else if (promo.discount_type === "percentage") {
      discountAmount = (course.price * promo.discount_value) / 100;
    }

    const finalAmount = Math.max(0, course.price - discountAmount);

    return NextResponse.json({
      valid: true,
      promoCode: {
        id: parseInt(promo.id),
        code: promo.code,
        discountType: promo.discount_type,
        discountValue: promo.discount_value,
        discountAmount: Math.round(discountAmount * 100) / 100,
        originalAmount: course.price,
        finalAmount: Math.round(finalAmount * 100) / 100,
        minPurchaseAmount: promo.min_purchase_amount
      },
      course: {
        id: course.id,
        title: course.title,
        price: course.price,
        currency: course.currency
      }
    });

  } catch (error) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
