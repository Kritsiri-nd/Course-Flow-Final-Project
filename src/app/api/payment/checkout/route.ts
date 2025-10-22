import { NextResponse } from 'next/server'
import Omise from 'omise'
import { createSupabaseServerClient } from '@/lib/createSupabaseServerClient'

export async function POST(req: Request) {
  try {
    // 1. รับเฉพาะข้อมูลที่จำเป็น (IDs เท่านั้น)
    const { 
      course_id, 
      user_id, 
      method, 
      token,
      promo_code_id // รับเฉพาะ ID
      // ❌ ไม่รับ final_amount, original_amount, discount_amount จาก Frontend
    } = await req.json()
    
    console.log('Request data:', { 
      course_id, 
      user_id, 
      method, 
      token, 
      promo_code_id
    });
    // method = "promptpay" | "card"
    // token = card token ที่สร้างจาก Omise.js (ใช้เฉพาะกับบัตร)

    const supabase = await createSupabaseServerClient()

    // 2. ดึงข้อมูลที่เชื่อถือได้จากฐานข้อมูล
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, price, currency, title')
      .eq('id', course_id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // 3. คำนวณราคาสุดท้ายที่ฝั่ง Backend เท่านั้น
    let finalAmount = course.price
    let discountAmount = 0
    let originalAmount = course.price
    let promoCodeData = null

    // ถ้ามี promo_code_id ให้ตรวจสอบและคำนวณส่วนลด
    if (promo_code_id) {
      const { data: promo, error: promoError } = await supabase
        .from('promo_codes')
        .select(`
          id,
          code,
          discount_type,
          discount_value,
          min_purchase_amount,
          is_active,
          applies_to_all_courses,
          promo_code_courses (
            course_id
          )
        `)
        .eq('id', promo_code_id)
        .eq('is_active', true)
        .single()

      if (promoError || !promo) {
        return NextResponse.json({ 
          error: 'Invalid or inactive promo code' 
        }, { status: 400 })
      }

      // ตรวจสอบเงื่อนไขโปรโมโค้ด
      const isCourseEligible = promo.applies_to_all_courses || 
        promo.promo_code_courses.some((pcc: any) => pcc.course_id === parseInt(course_id))

      if (!isCourseEligible) {
        return NextResponse.json({ 
          error: 'This promo code is not valid for the selected course' 
        }, { status: 400 })
      }

      // ตรวจสอบยอดซื้อขั้นต่ำ
      if (course.price < promo.min_purchase_amount) {
        return NextResponse.json({ 
          error: `Minimum purchase amount is ${promo.min_purchase_amount.toLocaleString()} THB` 
        }, { status: 400 })
      }

      // คำนวณส่วนลดที่ฝั่ง Backend
      if (promo.discount_type === 'fixed') {
        discountAmount = Math.min(promo.discount_value, course.price)
      } else if (promo.discount_type === 'percentage') {
        discountAmount = (course.price * promo.discount_value) / 100
      }

      finalAmount = Math.max(0, course.price - discountAmount)
      promoCodeData = promo
    }

    console.log('Backend calculated amounts:', {
      originalAmount,
      discountAmount,
      finalAmount,
      promoCode: promoCodeData?.code
    })

    const omise = Omise({
      publicKey: process.env.OMISE_PUBLIC_KEY!,
      secretKey: process.env.OMISE_SECRET_KEY!,
    })

    let charge

    // 4. สั่งจ่ายเงินด้วยราคาที่ Backend คำนวณได้

    if (method === 'promptpay') {
      charge = await omise.charges.create({
        amount: Math.round(finalAmount * 100), // ใช้ราคาที่ Backend คำนวณ
        currency: course.currency,
        source: {
          type: 'promptpay'
        }
      })
    } else if (method === 'card') {
      if (!token) {
        return NextResponse.json({ error: 'Missing card token' }, { status: 400 })
      }

      charge = await omise.charges.create({
        amount: Math.round(finalAmount * 100), // ใช้ราคาที่ Backend คำนวณ
        currency: course.currency,
        card: token,
      })
    } else {
      return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 })
    }

    // 5. บันทึกข้อมูลการชำระเงินด้วยราคาที่ Backend คำนวณ
    const { data: payment, error: paymentError } = await supabase.from('payments').insert({
      user_id,
      course_id,
      amount: finalAmount, // ใช้ราคาที่ Backend คำนวณ
      currency: course.currency,
      status: 'pending',
      provider: 'omise',
      provider_payment_id: charge.id,
      promo_code_id: promo_code_id || null,
      original_amount: originalAmount, // ใช้ราคาที่ Backend คำนวณ
      discount_amount: discountAmount, // ใช้ส่วนลดที่ Backend คำนวณ
    }).select().single()

    if (paymentError) {
      console.error('Error saving payment:', paymentError)
      return NextResponse.json({ error: 'Failed to save payment record' }, { status: 500 })
    }

    console.log('✅ Payment record saved:', payment.id);

    // 6. บันทึกการใช้งานโปรโมโค้ด (ถ้ามี)
    if (promo_code_id) {
      const { error: usageError } = await supabase
        .from('promo_code_usages')
        .insert({
          promo_code_id: parseInt(promo_code_id),
          user_id: user_id,
          course_id: parseInt(course_id),
          order_id: payment.id,
          discount_amount: discountAmount, // ใช้ส่วนลดที่ Backend คำนวณ
          original_amount: originalAmount, // ใช้ราคาเดิมที่ Backend คำนวณ
          final_amount: finalAmount // ใช้ราคาสุดท้ายที่ Backend คำนวณ
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
      // ส่งข้อมูลที่ Backend คำนวณกลับไป (เพื่อแสดงผล)
      calculated_amounts: {
        original_amount: originalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount
      },
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