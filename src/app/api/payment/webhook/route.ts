import { NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    console.log('🔔 Webhook endpoint called!')
    console.log('🔔 Request headers:', Object.fromEntries(req.headers.entries()))
    
    const payload = await req.json()
    console.log('🔔 Webhook received:', JSON.stringify(payload, null, 2))
    
    // Omise webhook structure
    console.log('🔔 Payload structure:', {
      hasData: !!payload.data,
      dataKeys: payload.data ? Object.keys(payload.data) : [],
      payloadKeys: Object.keys(payload)
    })
    
    const { data } = payload
    if (!data) {
      console.error('❌ Missing data in webhook payload')
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }
    
    const { id, status, paid } = data
    
    if (!id) {
      console.error('❌ Missing charge ID in webhook payload')
      return NextResponse.json({ error: 'Missing charge ID' }, { status: 400 })
    }
    
    console.log('🔔 Processing webhook for charge:', { id, status, paid })
    
    // กรองเฉพาะ charge.complete event เท่านั้น
    if (status === 'pending' && !paid) {
      console.log('ℹ️ Received charge.create or pending status, ignoring')
      return NextResponse.json({ ok: true, message: 'Ignoring pending charge' })
    }

    // ใช้ Service Role Key เพื่อ bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('🔔 Supabase client created with service role')

    // หา payment record ก่อน
    console.log('🔔 Searching for payment with provider_payment_id:', id)
    const { data: existingPayment, error: searchError } = await supabase
      .from('payments')
      .select('*')
      .eq('provider_payment_id', id)
      .single()

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('❌ Error searching for payment:', searchError)
      return NextResponse.json({ error: 'Failed to search payment' }, { status: 500 })
    }

    if (!existingPayment) {
      console.log('ℹ️ Payment record not found yet, webhook came too early')
      console.log('ℹ️ Will retry later or wait for payment record to be created')
      return NextResponse.json({ ok: true, message: 'Payment record not found yet' })
    }

    console.log('✅ Payment record found:', existingPayment.id)

    // อัปเดตสถานะการจ่ายเงิน
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({ 
        status: paid ? 'successful' : 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('provider_payment_id', id)
      .select()
      .single()

    if (paymentError) {
      console.error('❌ Error updating payment status:', paymentError)
      console.error('❌ Payment ID searched:', id)
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
    }

    if (!payment) {
      console.error('❌ No payment found with provider_payment_id:', id)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    console.log('✅ Payment status updated:', payment?.id)

    // ถ้าชำระเงินสำเร็จ ให้สร้าง enrollment
    if (paid && payment) {
      console.log('🔔 Payment successful, checking for existing enrollment...')
      console.log('🔔 User ID:', payment.user_id, 'Course ID:', payment.course_id)
      
      // ตรวจสอบว่ามี enrollment อยู่แล้วหรือไม่
      const { data: existingEnrollment, error: existingError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', payment.user_id)
        .eq('course_id', payment.course_id)
        .single()

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('❌ Error checking existing enrollment:', existingError)
        return NextResponse.json({ error: 'Failed to check existing enrollment' }, { status: 500 })
      }

      if (!existingEnrollment) {
        console.log('🔔 Creating new enrollment...')
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('enrollments')
          .insert({
            user_id: payment.user_id,
            course_id: payment.course_id,
            status: 'in-progress',
            progress_percentage: 0,
            enrolled_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString()
          })
          .select()
          .single()

        if (enrollmentError) {
          console.error('❌ Error creating enrollment:', enrollmentError)
          return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 })
        }

        console.log('✅ Enrollment created successfully:', enrollment?.id)
      } else {
        console.log('ℹ️ User already enrolled in this course')
      }
    } else {
      console.log('🔔 Payment not successful or payment not found')
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Webhook error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
