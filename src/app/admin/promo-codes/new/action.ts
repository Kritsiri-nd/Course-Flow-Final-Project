"use server";

import { createClient } from '@/lib/createSupabaseServerClient';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const PromocodeSchema = z.object({
    code: z.string().min(1, { message: "Promo Code is required" }),
    discount_type: z.string().refine((val) => val === "fixed" || val === "percent", {
        message: "Discount type must be either 'fixed' or 'percent'"
    }),
    discount_value: z.coerce.number().min(0.01, { message: "Discount value must be greater than 0" }),
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
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const supabase = await createClient();

    // ดึงข้อมูล user ที่ล็อกอินอยู่
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        console.error("Authentication error:", authError);
        return {
            message: "Authentication failed. Please login again.",
        };
    }

    const creatorEmail = user.email;
    const discountType = formData.get("discount_type");

    const rawFormData = {
        code: formData.get("code"),
        discount_type: discountType,
        discount_value: discountType === "fixed"
            ? formData.get("fixed_amount")
            : formData.get("percent_amount"),
        min_purchase_amount: formData.get("min_purchase_amount"),
        course_ids: formData.get("course_ids")?.toString().split(",").filter(id => id.trim() !== "") || [],
        total_courses: parseInt(formData.get("total_courses")?.toString() || "0", 10),
    };

    const validateFields = PromocodeSchema.safeParse({
        ...rawFormData,
        course_ids: rawFormData.course_ids.length === 0 ? "all" : rawFormData.course_ids,
    });

    if (!validateFields.success){
        return {
            message : "Validation failed. Please check your input.",
            errors: validateFields.error.flatten().fieldErrors,
        };
    }

    const { code, discount_type, discount_value, min_purchase_amount, course_ids } = validateFields.data;
    // ตรวจสอบว่าเลือก courses ครบทุกตัวหรือไม่
    const applies_to_all_courses = course_ids === "all" || 
        (Array.isArray(course_ids) && rawFormData.total_courses > 0 && 
         course_ids.length === rawFormData.total_courses);

    const dataToInsert = {
        code: code.toUpperCase(),
        discount_type,
        discount_value,
        min_purchase_amount,
        applies_to_all_courses,
        expires_at: null
    };

    try {
        // Cast discount_type เพื่อให้ตรงกับ database enum
        const insertData = {
            ...dataToInsert,
            discount_type: discount_type as 'fixed' | 'percent'
        };
        
        // แมป enum ตามที่ database คาดหวัง
        const enumMapping: { [key: string]: string } = {
            'fixed': 'fixed',
            'percent': 'percentage'
        };
        
        const finalData = {
            ...insertData,
            discount_type: enumMapping[discount_type] || discount_type,
            created_by_email: creatorEmail
        };

        let { data: newPromoCode, error: promoCodeError } = await supabase
            .from("promo_codes")
            .insert(finalData)
            .select("id")
            .single();

        // หาก schema cache ยังไม่ update ให้ลองใช้ข้อมูลโดยไม่มี email
        if (promoCodeError && promoCodeError.message.includes("schema cache")) {
            const dataWithoutEmail = { ...finalData };
            delete dataWithoutEmail.created_by_email;
            
            const { data: fallbackResult, error: fallbackError } = await supabase
                .from("promo_codes")
                .insert(dataWithoutEmail)
                .select("id")
                .single();
                
            newPromoCode = fallbackResult;
            promoCodeError = fallbackError;
        }

        // หากยังไม่ได้ ลองใช้ค่า discount_type เดิม
        if (promoCodeError && promoCodeError.message.includes('discount_type_enum')) {
            const originalData = {
                ...insertData,
                discount_type: discount_type,
                created_by_email: creatorEmail
            };
            
            const { data: result, error: retryError } = await supabase
                .from("promo_codes")
                .insert(originalData)
                .select("id")
                .single();
                
            newPromoCode = result;
            promoCodeError = retryError;
        }

        if (promoCodeError){
            console.error("Error inserting promo code:", promoCodeError);
            if (promoCodeError.code === "23505") {
                return {
                    message: "Promo code already exists.",
                    errors: { code: ["This promo code is already in use."] },
                };
            }
            return {
                message: `Database Error: ${promoCodeError.message}`,
            };
        }

        if (!newPromoCode) {
            return {
                message: "Database Error: Failed to create promo code.",
            };
        }

        if (!applies_to_all_courses && Array.isArray(course_ids) && course_ids.length > 0){
            const promoCodeCourses = course_ids.map((courseId) => ({
                promo_code_id: newPromoCode.id,
                course_id: parseInt(courseId, 10),
            }));

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

    revalidatePath("/admin/promo-codes");
    redirect("/admin/promo-codes");
}

