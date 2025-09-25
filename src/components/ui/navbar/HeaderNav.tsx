import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";


import AdminNav from '@/components/ui/navbar/AdminNav';
import UserNav from '@/components/ui/navbar/UserNav';
import NonuserNav from '@/components/ui/navbar/NonuserNav';



export const dynamic = 'force-dynamic';


type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string | null;
} | null;

export default async function HeaderNav() {
  const supabase = await createSupabaseServerClient();

  // ดึงข้อมูล session ของผู้ใช้
  const { data: { session } } = await supabase.auth.getSession();

  // ถ้าไม่มี session ให้แสดง NonuserNav ทันที
  if (!session) {
    return <NonuserNav />;
  }

  // ถ้ามี session, ดึงข้อมูล profile เพื่อตรวจสอบ 'role'
  const { data: userProfile, error } = await supabase
    .from('profiles') // ตรวจสอบให้แน่ใจว่าชื่อตารางถูกต้อง
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !userProfile) {
    // หากเกิดข้อผิดพลาดในการดึง profile หรือไม่มี profile
    // อาจจะให้แสดง NonuserNav ไปก่อนเพื่อความปลอดภัย
    console.error("Error fetching profile:", error);
    return <NonuserNav />;
  }

  // เงื่อนไขเพื่อเลือก Navbar ที่จะแสดงผล
  if (userProfile.role === 'user') {
    // ถ้า role เป็น 'user'

    return <UserNav session={session} userProfile={userProfile} />;
  } else {
    // สำหรับ role อื่นๆ ทั้งหมด (เช่น 'admin')

    return <UserNav session={session} userProfile={userProfile} />;
  }
}