'use server';

import { createSupabaseServerClient } from '@/lib/createSupabaseServerClient';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signInAsAdmin(
  prevState: { error: string } | undefined,
  formData: FormData,
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createSupabaseServerClient();

  // 1. ตรวจสอบข้อมูลเบื้องต้น
  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  // 2. พยายาม Login (Authentication)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: 'Invalid email or password.' };
  }

  // 3. ตรวจสอบสิทธิ์ (Authorization) จากตาราง profiles
  // อ้างอิงจากรูปภาพ database ของคุณ
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role') // เราต้องการแค่คอลัมน์ 'role'
    .eq('id', authData.user.id)
    .single();

  // ถ้าหาโปรไฟล์ไม่เจอ หรือ role ไม่ใช่ 'admin'
  if (profileError || !profile || profile.role !== 'admin') {
    // เพื่อความปลอดภัย: ถ้า Login สำเร็จแต่ไม่ใช่ Admin ให้ Sign Out ทันที!
    await supabase.auth.signOut();
    return { error: 'Access Denied. You do not have admin privileges.' };
  }

  // 4. ถ้าทุกอย่างถูกต้อง ให้ Redirect
  revalidatePath('/admin', 'layout'); // ล้าง cache ของหน้า admin
  redirect('/admin/courses'); // หรือหน้าที่คุณต้องการให้ไปหลัง login
}
