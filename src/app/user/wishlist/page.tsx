import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import { redirect } from "next/navigation";
import MyWishlistClient from "./MyWishlistClient";
import Footer from '@/components/ui/footer';

export default async function WishlistPage() {
  const supabase = await createSupabaseServerClient();
  
  // ตรวจสอบ session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  // ดึงข้อมูล profile ของ user
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, photo_url')
    .eq('id', session.user.id)
    .single();

  // ดึงข้อมูล wishlist courses จากตาราง wishlist
  const { data: wishlistItems } = await supabase
    .from('wishlist')
    .select(`
      added_at,
      courses (
        id, 
        title, 
        summary, 
        thumbnail, 
        duration_hours,
        modules (
          lessons (
            id
          )
        )
      )
    `)
    .eq('user_id', session.user.id);

  // ดึงข้อมูล courses ที่ user ลงทะเบียนเพื่อนับจำนวน
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('status')
    .eq('user_id', session.user.id);

  // นับจำนวน courses แต่ละประเภท
  const coursesInProgress = enrollments?.filter(e => e.status === 'in-progress').length || 0;
  const coursesCompleted = enrollments?.filter(e => e.status === 'completed').length || 0;

  // แปลง wishlist data เป็น courses data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wishlistCoursesData = wishlistItems?.map((item: any) => {
    const course = item.courses;
    if (!course) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lessonsCount = course.modules?.reduce((total: number, module: any) => {
      return total + (module.lessons?.length || 0);
    }, 0) || 0;

    return {
      id: course.id?.toString() || '',
      title: course.title || '',
      description: course.summary || 'No description available',
      image: course.thumbnail || '/images/learning.png',
      lessonsCount,
      hoursCount: course.duration_hours || 0,
      category: 'Course',
    };
  }).filter((course): course is NonNullable<typeof course> => course !== null) || [];

  // สร้าง user data สำหรับแสดงผล
  const userData = {
    name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User',
    photo: profile?.photo_url || '/assets/defaultUser.png',
    coursesInProgress,
    coursesCompleted,
  };

  return (
    <>
      <MyWishlistClient 
        userData={userData}
        wishlistCourses={wishlistCoursesData}
      />
      <Footer />
    </>
  );
}
