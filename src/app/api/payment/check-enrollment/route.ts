import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const courseId = searchParams.get('courseId');

        if (!userId || !courseId) {
            return NextResponse.json({ error: 'User ID and Course ID are required' }, { status: 400 });
        }

        // ใช้ Service Role Key เพื่อ bypass RLS
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // ตรวจสอบ enrollment
        const { data: enrollment, error: enrollmentError } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (enrollmentError && enrollmentError.code !== 'PGRST116') {
            console.error('Error checking enrollment:', enrollmentError);
            return NextResponse.json({ error: 'Failed to check enrollment' }, { status: 500 });
        }

        // ตรวจสอบ payment status
        const { data: payments, error: paymentError } = await supabase
            .from('payments')
            .select('status')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (paymentError) {
            console.error('Error checking payment status:', paymentError);
            return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 });
        }

        const latestPayment = payments?.[0];
        
        return NextResponse.json({
            enrolled: !!enrollment,
            enrollmentId: enrollment?.id || null,
            paymentStatus: latestPayment?.status || 'pending'
        });

    } catch (error) {
        console.error('Error in check-enrollment API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
