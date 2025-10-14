"use severe";

import { createClient } from '@/lib/createSupabaseServerClient'; //ใช้สำหรับการสร้าง Supabase client ฝั่ง server
import { revalidatePath } from 'next/cache'; // ใช้สำหรับการรีเฟรชข้อมูลในหน้า
import { redirect } from 'next/dist/server/api-utils'; //ใช้สำหรับการเปลี่ยนเส้นทาง
import { z } from 'zod'; //ใช้สำหรับการตรวจสอบ schema


//ตรวจสอบข้อมูลที่ส่งมาจากฟอร์ม

const PromocodeSchema = z.object({

    code: z.string().min(1, { message: "Promo Code is required" }),
    discount_type: z.enum(["fixed", "percent"]),
    discount_value: z.coerce.number().min(0, { message: "Discount value must be a positive number" }),
    min_purchase_amount: z.coerce.number().min(0, { message: "Minimum purchase amount must be a positive number" }),
    course_ids: z.union([z.string(),z.array(z.string())]).optional(), // รับค่าเป็น string หรือ array ของ string
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
        discount_value: formData.get("discount_value") === "fixed"
            ? formData.get("discount_value_fixed")
            : formData.get("discount_value_percent"),
        min_purchase_amount: formData.get("min_purchase_amount"),
        course_ids: formData.getAll("course_ids"), 
    };

    const validateFields = PromocodeSchema.safeParse({
        ...rawFormData,
        course_ids: (rawFormData.course_ids.length === 1 &&
            rawFormData.course_ids[0] === "all")
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

    try{

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
            if (promoCodeError.code === "23505") {
                return {
                    message: "Promo code already exists. Please choose a different code.",
                    errors: { code: ["Promo code already exists. Please choose a different code."] },
                };
            }
            return {
                message: "Failed to create promo code. Please try again.",
                errors: { code: [promoCodeError.message] },
            };
        }

        if (!applies_to_all_courses && Array.isArray(course_ids) && course_ids.length > 0){

            const promoCodeCourses = course_ids.map((course_id) => ({
                promo_code_id: newPromoCode.id,
                course_id,
            }));
        }

    } catch (error) {
        console.error("Unexpected error:", error);
        return { message: "An unexpected error occurred." };
    }

    // 4. ถ้าสำเร็จ ให้ revalidate path และ redirect
    revalidatePath("/admin/promo-codes"); // แก้ไข path ตามหน้าแสดงรายการ promo code
    redirect("/admin/promo-codes");
}