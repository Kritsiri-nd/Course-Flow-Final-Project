import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm'; 

export default async function LoginPage() {
  // สร้าง Server Client เพื่ออ่าน Cookie
  const supabase = await createSupabaseServerClient();

  // ตรวจสอบ Session จากฝั่ง Server
  const { data: { session } } = await supabase.auth.getSession();

  // ถ้ามี Session (ผู้ใช้ล็อกอินอยู่แล้ว)
  if (session) {
    //สั่งให้ redirect ไปยังหน้า profile ทันที!
    redirect('/user/profile');
  }

  // 6. ถ้าไม่มี Session, ก็แสดงฟอร์ม Login ตามปกติ
  return <LoginForm />;
}
