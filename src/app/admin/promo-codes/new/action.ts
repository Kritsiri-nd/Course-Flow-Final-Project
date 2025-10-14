"use server"; // แก้ไขที่ 1: พิมพ์ "use server" ให้ถูกต้อง

import { createClient } from '@/lib/createSupabaseServerClient';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation'; // แก้ไขที่ 2: เปลี่ยน path การ import
import { z } from 'zod';

// ... (ส่วนของ Schema และ Interface เหมือนเดิม) ...
const PromocodeSchema = z.object({
    code: z.string().min(1, { message: "Promo Code is required" }),
    discount_type: z.enum(["fixed", "percent"]),
    discount_value: z.coerce.number().min(0, { message: "Discount value must be a positive number" }),
    min_purchase_amount: z.coerce.number().min(0, { message: "Minimum purchase amount must be a positive number" }),
    course_ids: z.union([z.string(),z.array(z.string())]).optional(),
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


export async function addPromoCode(
    preveState: FormState,
    formData: FormData
): Promise<FormState> {
    const supabase = createClient();

    const rawFormData = {
        code: formData.get("code"),
        discount_type: formData.get("discount_type"),
        // แก้ไข logic การดึงค่า discount_value ให้ชัดเจนขึ้น
        discount_value: formData.get("discount_type") === "fixed"
            ? formData.get("discount_value_fixed")
            : formData.get("discount_value_percent"),
        min_purchase_amount: formData.get("min_purchase_amount"),
        course_ids: formData.getAll("course_ids"), 
    };

    const validateFields = PromocodeSchema.safeParse({
        ...rawFormData,
        course_ids: (rawFormData.course_ids.length === 1 && rawFormData.course_ids[0] === "all")
            ? "all" 
            : rawFormData.course_ids,
    });

    if (!validateFields.success){
        console.error("Validation errors:", validateFields.error.flatten().fieldErrors);
        return {
            message : "Validation failed. Please Check your input",
            errors: validateFields.error.flatten().fieldErrors,
        };
    }

    const { code, discount_type, discount_value, min_purchase_amount, course_ids } = validateFields.data;
    const applies_to_all_courses = course_ids === "all";

    try {
        const { data: newPromoCode, error: promoCodeError } = await supabase
            .from("promo_codes")      
            .insert({
                code: code.toUpperCase(),
                discount_type,
                discount_value,
                min_purchase_amount,
                applies_to_all_courses,
            })
            .select("id")
            .single();

        if (promoCodeError){
            console.error("Error inserting promo code:", promoCodeError);
            if (promoCodeError.code === "23505") { // Unique constraint violation
                return {
                    message: "Promo code already exists.",
                    errors: { code: ["This promo code is already in use."] },
                };
            }
            return {
                message: "Database Error: Failed to create promo code.",
            };
        }

        // แก้ไขที่ 3: เพิ่ม logic การบันทึก course ที่เกี่ยวข้อง
        if (!applies_to_all_courses && Array.isArray(course_ids) && course_ids.length > 0){
            const promoCodeCourses = course_ids.map((courseId) => ({
                promo_code_id: newPromoCode.id,
                course_id: parseInt(courseId, 10), // แปลง id เป็นตัวเลข
            }));

            // ทำการ insert ข้อมูลลงในตาราง promo_code_courses
            const { error: coursesError } = await supabase
                .from('promo_code_courses')
                .insert(promoCodeCourses);

            if (coursesError) {
                console.error("Error inserting promo code courses:", coursesError);
                return { message: "Database Error: Failed to link promo code to courses." };
            }
        }

    } catch (error) {
        console.error("Unexpected error:", error);
        return { message: "An unexpected error occurred." };
    }

    // ถ้าสำเร็จ ให้ revalidate path และ redirect
    revalidatePath("/admin/promo-codes");
    redirect("/admin/promo-codes");
    // หมายเหตุ: redirect() จะ throw error ดังนั้นโค้ดหลังจากนี้จะไม่ทำงาน
    // ไม่จำเป็นต้อง return ค่าใดๆ ที่นี่
}