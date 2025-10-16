'use server';

import { createClient } from '@/lib/createSupabaseServerClient';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * ดึงข้อมูลโปรโมโค้ดทั้งหมดพร้อมชื่อคอร์สที่เกี่ยวข้อง
 */
export async function getPromoCodesWithCourseNames() {
  // ป้องกัน Next.js Caching ข้อมูลในหน้านี้ เพื่อให้ข้อมูลอัปเดตเสมอ
  noStore();
  
  // แก้ไขโดยการเพิ่ม await เพื่อรอการสร้าง Supabase client
  const supabase = await createClient();

  // ดึงข้อมูลจาก Supabase
  const { data, error } = await supabase
    .from('promo_codes')
    .select(`
      id,
      code,
      discount_type,
      discount_value,
      min_purchase_amount,
      applies_to_all_courses,
      created_at,
      promo_code_courses (
        courses ( title )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching promo codes:', error.message);
    return [];
  }

  // จัดรูปแบบข้อมูล "Courses Included" ให้อ่านง่าย
  const formattedData = data.map(promo => {
    let coursesIncludedText = 'All';

    if (!promo.applies_to_all_courses) {
      const courseTitles = promo.promo_code_courses.map(
        (pcc: any) => pcc.courses.title
      );
      
      coursesIncludedText = courseTitles.length > 0 
        ? courseTitles.join(', ') 
        : 'No courses specified';
    }

    return { 
      ...promo, 
      coursesIncluded: coursesIncludedText 
    };
  });

  return formattedData;
}