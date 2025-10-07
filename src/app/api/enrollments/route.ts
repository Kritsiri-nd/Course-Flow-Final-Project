import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/createSupabaseServerClient'

export async function POST(req: NextRequest) {
  try {
    const { course_id, user_id } = await req.json()

    if (!course_id || !user_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: course_id and user_id' 
      }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    // Check if user is already enrolled in this course
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ 
        error: 'User is already enrolled in this course',
        enrollment_id: existingEnrollment.id
      }, { status: 409 })
    }

    // Check if user has a successful payment for this course
    const { data: payment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .eq('status', 'successful')
      .single()

    if (!payment) {
      return NextResponse.json({ 
        error: 'No successful payment found for this course' 
      }, { status: 400 })
    }

    // Create enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .insert({
        user_id,
        course_id,
        status: 'in-progress',
        progress_percentage: 0,
        enrolled_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError)
      return NextResponse.json({ 
        error: 'Failed to create enrollment' 
      }, { status: 500 })
    }

    console.log('✅ Enrollment created successfully:', enrollment.id)

    return NextResponse.json({
      success: true,
      enrollment,
      message: 'Enrollment created successfully'
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error in enrollments API:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ 
        error: 'user_id is required' 
      }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    // Get user's enrollments with course details
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        status,
        progress_percentage,
        enrolled_at,
        completed_at,
        last_accessed_at,
        courses (
          id,
          title,
          description,
          thumbnail,
          instructor,
          duration_hours
        )
      `)
      .eq('user_id', user_id)
      .order('enrolled_at', { ascending: false })

    if (error) {
      console.error('Error fetching enrollments:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch enrollments' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      enrollments: enrollments || []
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error in enrollments GET API:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
