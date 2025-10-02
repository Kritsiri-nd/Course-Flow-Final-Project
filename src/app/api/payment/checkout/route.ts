import { NextResponse } from 'next/server'
import Omise from 'omise'
import { createSupabaseServerClient } from '@/lib/createSupabaseServerClient'

export async function POST(req: Request) {
  try {
    const { course_id, user_id, method, token, phone_number } = await req.json()
    console.log('Request data:', { course_id, user_id, method, token, phone_number });
    // method = "promptpay" | "card"
    // token = card token ที่สร้างจาก Omise.js (ใช้เฉพาะกับบัตร)
    // phone_number = หมายเลขโทรศัพท์สำหรับ PromptPay

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

    if (method === 'promptpay') {
      if (!phone_number) {
        return NextResponse.json({ error: 'Missing phone number for PromptPay' }, { status: 400 })
      }
      
      // ✅ PromptPay QR
      charge = await omise.charges.create({
        amount: Math.round(course.price * 100),
        currency: course.currency,
        source: { type: 'promptpay', phone_number: phone_number! },
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
    await supabase.from('payments').insert({
      user_id,
      course_id,
      amount: course.price,
      currency: course.currency,
      status: 'pending',
      provider: 'omise',
      provider_payment_id: charge.id,
    })

    return NextResponse.json(charge)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}