import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/createSupabaseServerClient';

// DELETE /api/wishlist/[id] - ลบ course ออกจาก wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // ตรวจสอบ session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: courseId } = await params;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // ลบ course ออกจาก wishlist
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', session.user.id)
      .eq('course_id', courseId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Course removed from wishlist successfully' 
    });
  } catch (error) {
    console.error('Error in wishlist DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/wishlist/[id] - ตรวจสอบว่า course อยู่ใน wishlist หรือไม่
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // ตรวจสอบ session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: courseId } = await params;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // ตรวจสอบว่า course อยู่ใน wishlist หรือไม่
    const { data: wishlistItem, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking wishlist:', error);
      return NextResponse.json({ error: 'Failed to check wishlist' }, { status: 500 });
    }

    return NextResponse.json({ 
      inWishlist: !!wishlistItem,
      wishlistItem: wishlistItem || null
    });
  } catch (error) {
    console.error('Error in wishlist GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
