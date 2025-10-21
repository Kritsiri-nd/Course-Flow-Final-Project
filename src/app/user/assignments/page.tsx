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
  
  console.log('🔍 Debug - User ID:', session.user.id);
  console.log('🔍 Debug - Enrollments:', enrollments);

  // หาก user ไม่มี enrollments ให้สร้างให้อัตโนมัติ (สำหรับการทดสอบ)
  if (!enrollments || enrollments.length === 0) {
    try {
      console.log('🔧 User has no enrollments, creating some for testing...');
      
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
        console.error('Error creating enrollments:', createError);
      } else {
        enrollments = createdEnrollments;
        console.log('✅ Created enrollments:', enrollments);
      }
    } catch (error) {
      console.error('Error in auto-enrollment:', error);
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
    
    console.log('🔍 Debug - Course IDs:', courseIds);
    console.log('🔍 Debug - Assignments data:', data);
    console.log('🔍 Debug - Assignments error:', error);
    
    assignmentsData = data || [];
    assignmentsError = error;
  }

  if (assignmentsError) {
    console.error('Error fetching assignments:', assignmentsError);
  }

  // Debug: ตรวจสอบว่ามี assignments ในระบบหรือไม่
  const { data: allAssignments } = await supabase
    .from('assignments')
    .select('id, question, lesson_id')
    .limit(5);
  
  console.log('🔍 Debug - All assignments in system:', allAssignments);

  // Debug: ตรวจสอบโครงสร้าง lessons และ modules
  const { data: lessonsData } = await supabase
    .from('lessons')
    .select('id, title, module_id')
    .limit(5);
  
  const { data: modulesData } = await supabase
    .from('modules')
    .select('id, title, course_id')
    .limit(5);
  
  console.log('🔍 Debug - Lessons data:', lessonsData);
  console.log('🔍 Debug - Modules data:', modulesData);

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


  console.log('🔍 Debug - Transformed assignments:', transformedAssignments);
  console.log('🔍 Debug - Assignments with status:', transformedAssignments.map(a => ({ id: a.id, status: a.status, courseTitle: a.courseTitle })));

  return (
    <>
      <MyAssignmentsClient 
        assignments={transformedAssignments}
      />
      <Footer />
    </>
  );
}