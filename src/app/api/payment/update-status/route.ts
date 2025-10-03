import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/createSupabaseServerClient'

export async function POST(req: NextRequest) {
  try {
    const { charge_id, status } = await req.json()

    if (!charge_id || !status) {
      return NextResponse.json({ 
        error: 'Missing required fields: charge_id and status' 
      }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    // Update payment status
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('provider_payment_id', charge_id)
      .select()
      .single()

    if (paymentError) {
      console.error('Error updating payment status:', paymentError)
      return NextResponse.json({ 
        error: 'Failed to update payment status' 
      }, { status: 500 })
    }

    console.log('✅ Payment status updated:', payment)

    return NextResponse.json({
      success: true,
      payment,
      message: 'Payment status updated successfully'
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error in update-status API:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
