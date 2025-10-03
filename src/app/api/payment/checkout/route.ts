import { NextResponse } from 'next/server'
import Omise from 'omise'
import { createSupabaseServerClient } from '@/lib/createSupabaseServerClient'

export async function POST(req: Request) {
  try {
    const { course_id, user_id, method, token, phone_number, charge_id } = await req.json()
    console.log('Request data:', { course_id, user_id, method, token, phone_number, charge_id });
    // method = "promptpay" | "card"
    // token = card token ที่สร้างจาก Omise.js (ใช้เฉพาะกับบัตร)
    // phone_number = หมายเลขโทรศัพท์สำหรับ PromptPay
    // charge_id = charge ID ที่มีอยู่แล้ว (สำหรับ QR payment)

    const supabase = await createSupabaseServerClient()
    const { data: course, error } = await supabase
      .from('courses')
      .select('price, currency')
      .eq('id', course_id)
      .single()

    if (error || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const omise = Omise({
      publicKey: process.env.OMISE_PUBLIC_KEY!,
      secretKey: process.env.OMISE_SECRET_KEY!,
    })

    let charge

    // If charge_id is provided (for QR payment), use existing charge
    if (charge_id) {
      console.log('Using existing charge:', charge_id);
      charge = { id: charge_id, paid: false, status: 'pending' };
    } else if (method === 'promptpay') {
      if (!phone_number) {
        return NextResponse.json({ error: 'Missing phone number for PromptPay' }, { status: 400 })
      }
      
      // ✅ PromptPay QR
      charge = await omise.charges.create({
        amount: Math.round(course.price * 100),
        currency: course.currency,
        source: { 
          type: 'promptpay', 
          phone_number: phone_number!,
          amount: Math.round(course.price * 100),
          currency: course.currency
        },
        return_uri: 'http://localhost:3000/payment/success',
      })
    } else if (method === 'card') {
      if (!token) {
        return NextResponse.json({ error: 'Missing card token' }, { status: 400 })
      }

      // ✅ Card payment (ต้องสร้าง token จาก Omise.js ฝั่ง client ก่อน)
      charge = await omise.charges.create({
        amount: Math.round(course.price * 100),
        currency: course.currency,
        card: token, // ใช้ token ที่ได้จาก client
        return_uri: 'http://localhost:3000/payment/success',
      })
    } else {
      return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 })
    }

    // Save payment record
    const { data: payment, error: paymentError } = await supabase.from('payments').insert({
      user_id,
      course_id,
      amount: course.price,
      currency: course.currency,
      status: charge_id ? 'pending' : 'pending', // QR payment starts as pending
      provider: 'omise',
      provider_payment_id: charge.id,
    }).select().single()

    if (paymentError) {
      console.error('Error saving payment:', paymentError)
      return NextResponse.json({ error: 'Failed to save payment record' }, { status: 500 })
    }

    console.log('✅ Payment record saved:', payment.id);

    // Check if payment is successful immediately (for card payments)
    if (charge.paid && charge.status === 'successful') {
      // Update payment status to successful
      await supabase.from('payments')
        .update({ status: 'successful' })
        .eq('id', payment.id)

      // Create enrollment
      const { data: enrollmentData, error: enrollmentError } = await supabase.from('enrollments').insert({
        user_id,
        course_id,
        status: 'in-progress',
        progress_percentage: 0,
        enrolled_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString()
      }).select().single()

      if (enrollmentError) {
        console.error('❌ Error creating enrollment:', enrollmentError)
        // Don't fail the payment, just log the error
      } else {
        console.log('✅ Enrollment created successfully:', enrollmentData)
        console.log('✅ User ID:', user_id, 'Course ID:', course_id)
      }
    }

    return NextResponse.json({
      ...charge,
      payment_id: payment.id,
      enrollment_created: charge.paid && charge.status === 'successful'
    })
  } catch (err: unknown) {
    let message = 'Unknown error'
    if (err instanceof Error) {
      message = err.message
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
  
}