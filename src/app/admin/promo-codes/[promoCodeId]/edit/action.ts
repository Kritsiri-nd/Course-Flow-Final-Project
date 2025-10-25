"use server";

import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const PromoCodeSchema = z.object({
  code: z.string().min(1, { message: "Promo Code is required" }),
  discount_type: z.enum(["fixed", "percent"]),
  discount_value: z.coerce
    .number()
    .min(0, { message: "Discount value must be a positive number" }),
  min_purchase_amount: z.coerce
    .number()
    .min(0, { message: "Minimum purchase amount must be a positive number" }),
  course_ids: z
    .union([z.string(), z.array(z.string())])
    .optional(),
});

export interface FormState {
  message: string;
  errors?: {
    code?: string[];
    discount_value?: string[];
    min_purchase_amount?: string[];
    course_ids?: string[];
  };
}

export async function updatePromoCode(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createSupabaseServerClient();

  const promoCodeId = formData.get("promo_code_id");
  const discountType = formData.get("discount_type");

  const rawFormData = {
    code: formData.get("code"),
    discount_type: discountType,
    discount_value:
      discountType === "fixed"
        ? formData.get("fixed_amount")
        : formData.get("percent_amount"),
    min_purchase_amount: formData.get("min_purchase_amount"),
    course_ids: formData.get("course_ids"),
  };

  // Parse course_ids string to array
  let courseIdsArray: string[] = [];
  const courseIdsStr = rawFormData.course_ids as string;
  
  if (courseIdsStr && courseIdsStr.trim() !== "") {
    courseIdsArray = courseIdsStr.split(",").filter((id) => id.trim() !== "");
  }

  const totalCourses = parseInt(formData.get("total_courses") as string, 10);
  const applies_to_all_courses =
    courseIdsArray.length === 0 ||
    courseIdsArray.length === totalCourses;

  const validateFields = PromoCodeSchema.safeParse({
    ...rawFormData,
    course_ids: applies_to_all_courses ? "all" : courseIdsArray,
  });

  if (!validateFields.success) {
    console.error(
      "Validation errors:",
      validateFields.error.flatten().fieldErrors
    );
    return {
      message: "Validation failed. Please check your input",
      errors: validateFields.error.flatten().fieldErrors,
    };
  }

  const { code, discount_type, discount_value, min_purchase_amount } =
    validateFields.data;

  try {
    // Update promo code
    const { error: updateError } = await supabase
      .from("promo_codes")
      .update({
        code: code.toUpperCase(),
        discount_type,
        discount_value,
        min_purchase_amount,
        applies_to_all_courses,
      })
      .eq("id", promoCodeId);

    if (updateError) {
      console.error("Error updating promo code:", updateError);
      if (updateError.code === "23505") {
        return {
          message:
            "Promo code already exists. Please choose a different code.",
          errors: {
            code: ["Promo code already exists. Please choose a different code."],
          },
        };
      }
      return {
        message: "Failed to update promo code. Please try again.",
        errors: { code: [updateError.message] },
      };
    }

    // Delete existing course associations
    const { error: deleteError } = await supabase
      .from("promo_code_courses")
      .delete()
      .eq("promo_code_id", promoCodeId);

    if (deleteError) {
      console.error("Error deleting old course associations:", deleteError);
    }

    // Insert new course associations if not applying to all courses
    if (!applies_to_all_courses && courseIdsArray.length > 0) {
      const promoCodeCourses = courseIdsArray.map((course_id) => ({
        promo_code_id: Number(promoCodeId),
        course_id: Number(course_id),
      }));

      const { error: coursesError } = await supabase
        .from("promo_code_courses")
        .insert(promoCodeCourses);

      if (coursesError) {
        console.error("Error inserting promo code courses:", coursesError);
        return {
          message: "Failed to associate courses with promo code. Please try again.",
          errors: { course_ids: [coursesError.message] },
        };
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return { message: "An unexpected error occurred." };
  }

  revalidatePath("/admin/promo-codes");
  redirect("/admin/promo-codes");
}

export async function deletePromoCode(promoCodeId: number) {
  const supabase = await createSupabaseServerClient();

  try {
    // Delete course associations first
    const { error: deleteCoursesError } = await supabase
      .from("promo_code_courses")
      .delete()
      .eq("promo_code_id", promoCodeId);

    if (deleteCoursesError) {
      console.error("Error deleting course associations:", deleteCoursesError);
      throw new Error("Failed to delete course associations");
    }

    // Delete promo code
    const { error: deletePromoError } = await supabase
      .from("promo_codes")
      .delete()
      .eq("id", promoCodeId);

    if (deletePromoError) {
      console.error("Error deleting promo code:", deletePromoError);
      throw new Error("Failed to delete promo code");
    }

    revalidatePath("/admin/promo-codes");
  } catch (error) {
    console.error("Error in deletePromoCode:", error);
    throw error;
  }
}
