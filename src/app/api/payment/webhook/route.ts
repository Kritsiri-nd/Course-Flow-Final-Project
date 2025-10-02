import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/createSupabaseServerClient'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const { id, status } = payload.data

    const supabase = await createSupabaseServerClient()

    // อัปเดตสถานะการจ่ายเงิน
    const { data: payment } = await supabase
      .from('payments')
      .update({ status })
      .eq('provider_payment_id', id)
      .select()
      .single()

    if (status === 'successful' && payment) {
      // สร้าง enrollment
      await supabase.from('enrollments').insert({
        user_id: payment.user_id,
        course_id: payment.course_id,
        status: 'active',
        progress_percentage: 0
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
