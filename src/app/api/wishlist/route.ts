import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/createSupabaseServerClient';

// GET /api/wishlist - ดึงรายการ wishlist ของ user
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // ตรวจสอบ session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ดึงข้อมูล wishlist
    const { data: wishlistItems, error } = await supabase
      .from('wishlist')
      .select(`
        id,
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
      .eq('user_id', session.user.id)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }

    return NextResponse.json({ wishlist: wishlistItems });
  } catch (error) {
    console.error('Error in wishlist GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/wishlist - เพิ่ม course เข้า wishlist
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // ตรวจสอบ session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // ตรวจสอบว่า course มีอยู่จริงหรือไม่
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // ตรวจสอบว่า course อยู่ใน wishlist อยู่แล้วหรือไม่
    const { data: existingItem } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('course_id', courseId)
      .single();

    if (existingItem) {
      return NextResponse.json({ error: 'Course already in wishlist' }, { status: 409 });
    }

    // เพิ่ม course เข้า wishlist
    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: session.user.id,
        course_id: courseId
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to wishlist:', error);
      return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Course added to wishlist successfully',
      wishlistItem: data 
    });
  } catch (error) {
    console.error('Error in wishlist POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
