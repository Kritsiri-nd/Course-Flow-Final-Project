import { NextResponse } from 'next/server'
import Omise from 'omise'
import { createSupabaseServerClient } from '@/lib/createSupabaseServerClient'

export async function POST(req: Request) {
  try {
    const { 
      course_id, 
      user_id, 
      method, 
      token, 
      phone_number, 
      charge_id,
      promo_code_id,
      discount_amount,
      original_amount,
      final_amount
    } = await req.json()
    
    console.log('Request data:', { 
      course_id, 
      user_id, 
      method, 
      token, 
      phone_number, 
      charge_id,
      promo_code_id,
      discount_amount,
      original_amount,
      final_amount
    });
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

    // ใช้ราคาสุทธิที่คำนวณจากโปรโมโค้ด
    const chargeAmount = final_amount || course.price;

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
        amount: Math.round(chargeAmount * 100),
        currency: course.currency,
        source: { 
          type: 'promptpay', 
          phone_number: phone_number!,
          amount: Math.round(chargeAmount * 100),
          currency: course.currency
        },
      })
    } else if (method === 'card') {
      if (!token) {
        return NextResponse.json({ error: 'Missing card token' }, { status: 400 })
      }

      // ✅ Card payment (ต้องสร้าง token จาก Omise.js ฝั่ง client ก่อน)
      charge = await omise.charges.create({
        amount: Math.round(chargeAmount * 100),
        currency: course.currency,
        card: token, // ใช้ token ที่ได้จาก client
      })
    } else {
      return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 })
    }

    // Save payment record
    const { data: payment, error: paymentError } = await supabase.from('payments').insert({
      user_id,
      course_id,
      amount: chargeAmount, // ใช้ราคาสุทธิ
      currency: course.currency,
      status: charge_id ? 'pending' : 'pending', // QR payment starts as pending
      provider: 'omise',
      provider_payment_id: charge.id,
      promo_code_id: promo_code_id || null,
      original_amount: original_amount || course.price,
      discount_amount: discount_amount || 0,
    }).select().single()

    if (paymentError) {
      console.error('Error saving payment:', paymentError)
      return NextResponse.json({ error: 'Failed to save payment record' }, { status: 500 })
    }

    console.log('✅ Payment record saved:', payment.id);

    // บันทึกการใช้งานโปรโมโค้ดทันทีถ้ามี (สำหรับ card payment)
    if (promo_code_id && method === 'card') {
      const { error: usageError } = await supabase
        .from('promo_code_usages')
        .insert({
          promo_code_id: parseInt(promo_code_id),
          user_id: user_id,
          course_id: parseInt(course_id),
          order_id: payment.id,
          discount_amount: discount_amount || 0,
          original_amount: original_amount || course.price,
          final_amount: chargeAmount
        })

      if (usageError) {
        console.error('❌ Error recording promo code usage:', usageError)
      } else {
        console.log('✅ Promo code usage recorded successfully')
      }
    }


    return NextResponse.json({
      ...charge,
      payment_id: payment.id,
      // Enrollment will be created by webhook
      enrollment_created: false
    })
  } catch (err: unknown) {
    let message = 'Unknown error'
    if (err instanceof Error) {
      message = err.message
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
  
}