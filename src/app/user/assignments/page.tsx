import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import { redirect } from "next/navigation";
import Footer from '@/components/ui/footer';
import MyAssignmentsClient from "./MyAssignmentsClient";

export default async function UserAssignmentsPage() {
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

  // Mock data สำหรับ assignments (ในอนาคตควรดึงจาก database)
  const assignmentsData = [
    {
      id: '1',
      courseTitle: 'Service Design Essentials',
      lessonTitle: 'Introduction: 4 Levels of Service Design in an Organization',
      question: 'What are the 4 elements of service design?',
      answer: '',
      status: 'pending' as const,
      courseId: '1'
    },
    {
      id: '2',
      courseTitle: 'Service Design Essentials',
      lessonTitle: 'Introduction: What is Service Design ?',
      question: 'What is service system design?',
      answer: 'At Service Systems Design, you will learn how to plan and organise people, infrastructure, communication, media and components of a service, in order to improve its quality, the interaction between service provider and users and the users\' experience.',
      status: 'submitted' as const,
      courseId: '1'
    },
    {
      id: '3',
      courseTitle: 'Service Design Essentials',
      lessonTitle: 'Introduction: Service Design vs. UX vs. UI vs. Design Thinking',
      question: 'Difference between Service Design vs. UX vs. UI vs. Design Thinking',
      answer: '1. Service design is..',
      status: 'in-progress' as const,
      courseId: '1'
    },
    {
      id: '4',
      courseTitle: 'Service Design Essentials',
      lessonTitle: 'Introduction: Getting to Know You',
      question: 'Introduce yourself',
      answer: '',
      status: 'overdue' as const,
      courseId: '1'
    }
  ];

  // สร้าง user data สำหรับแสดงผล
  const userData = {
    name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User',
    photo: profile?.photo_url || '/assets/defaultUser.png',
  };

  return (
    <>
      <MyAssignmentsClient 
        userData={userData}
        assignments={assignmentsData}
      />
      <Footer />
    </>
  );
}