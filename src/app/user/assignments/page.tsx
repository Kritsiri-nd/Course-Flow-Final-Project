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


  // ดึงข้อมูล assignments เฉพาะของ user ที่ login เข้ามา
  // วิธีที่ 1: ดึง enrollments ก่อน แล้วดึง assignments ตาม course_ids
  let { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('user_id', session.user.id);
  
  // หาก user ไม่มี enrollments ให้สร้างให้อัตโนมัติ (สำหรับการทดสอบ)
  if (!enrollments || enrollments.length === 0) {
    try {
      
      // สร้าง enrollments สำหรับ courses ที่มี assignments
      const { data: createdEnrollments, error: createError } = await supabase
        .from('enrollments')
        .insert([
          {
            user_id: session.user.id,
            course_id: 4, // Fullstack Web Development
            status: 'in-progress',
            enrolled_at: new Date().toISOString()
          },
          {
            user_id: session.user.id,
            course_id: 3, // Agile for Beginners
            status: 'in-progress',
            enrolled_at: new Date().toISOString()
          }
        ])
        .select('course_id');
      
      if (createError) {
        // Handle error silently
      } else {
        enrollments = createdEnrollments;
      }
    } catch (error) {
      // Handle error silently
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let assignmentsData: any[] = [];
  let assignmentsError = null;

  if (enrollments && enrollments.length > 0) {
    // ดึง course_ids จาก enrollments
    const courseIds = enrollments.map(e => e.course_id);
    
    // ดึง assignments เฉพาะที่มี user submissions ของ user นี้
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        id,
        question,
        answer,
        created_at,
        updated_at,
        lesson_id,
        lessons (
          id,
          title,
          module_id,
          modules (
            id,
            title,
            course_id,
            courses (
              id,
              title,
              category
            )
          )
        ),
        user_assignment_submissions!inner (
          id,
          user_id,
          answer,
          status,
          submitted_at,
          created_at
        )
      `)
      .in('lessons.modules.course_id', courseIds)
      .eq('user_assignment_submissions.user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    // Debug logging removed
    
    assignmentsData = data || [];
    assignmentsError = error;
  }

  if (assignmentsError) {
    // Handle error silently
  }

  // แปลงข้อมูลจากฐานข้อมูลให้ตรงกับ interface ที่ต้องการ
  const transformedAssignments = (assignmentsData || []).map((assignment) => {
    const lesson = Array.isArray(assignment.lessons) ? assignment.lessons[0] : assignment.lessons;
    const lessonModule = lesson?.modules ? (Array.isArray(lesson.modules) ? lesson.modules[0] : lesson.modules) : null;
    const course = lessonModule?.courses ? (Array.isArray(lessonModule.courses) ? lessonModule.courses[0] : lessonModule.courses) : null;
    
    // ดึงข้อมูล user submission (เนื่องจากใช้ !inner join จะมีข้อมูลของ user นี้เท่านั้น)
    const userSubmissions = Array.isArray(assignment.user_assignment_submissions) 
      ? assignment.user_assignment_submissions 
      : assignment.user_assignment_submissions ? [assignment.user_assignment_submissions] : [];
    
    const userSubmission = userSubmissions[0]; // เนื่องจากใช้ !inner join จะมีแค่ 1 record

    // กำหนด status ตาม user submission
    let status: 'pending' | 'in-progress' | 'submitted' | 'overdue' = 'pending';
    let userAnswer = '';
    
    if (userSubmission) {
      userAnswer = userSubmission.answer || '';
      
      // ใช้ status จากฐานข้อมูลเป็นหลัก
      if (userSubmission.status === 'submitted') {
        status = 'submitted';
      } else if (userSubmission.status === 'in-progress') {
        status = 'in-progress';
      } else if (userSubmission.status === 'pending') {
        // ตรวจสอบว่า overdue หรือไม่ (จากวันที่สร้าง user submission)
        const submissionCreatedAt = new Date(userSubmission.created_at);
        const now = new Date();
        const daysDiff = (now.getTime() - submissionCreatedAt.getTime()) / (1000 * 3600 * 24);
        
        if (daysDiff > 7) {
          status = 'overdue';
        } else {
          status = 'pending';
        }
      } else {
        status = userSubmission.status as 'pending' | 'in-progress' | 'submitted' | 'overdue';
      }
    }

    return {
      id: assignment.id.toString(),
      courseTitle: course?.title || 'Unknown Course',
      lessonTitle: lesson?.title || 'Unknown Lesson',
      question: assignment.question,
      answer: userAnswer,
      modelAnswer: assignment.answer || '', // เฉลยจาก admin
      status,
      courseId: course?.id?.toString() || '1'
    };
  });


  // Debug logging removed

  return (
    <>
      <MyAssignmentsClient 
        assignments={transformedAssignments}
      />
      <Footer />
    </>
  );
}