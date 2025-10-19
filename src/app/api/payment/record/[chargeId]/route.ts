import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/createSupabaseServerClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chargeId: string }> }
) {
  try {
    const { chargeId } = await params;

    if (!chargeId) {
      return NextResponse.json({ error: 'Charge ID is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // ดึงข้อมูล payment record จาก charge ID
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        original_amount,
        discount_amount,
        currency,
        status,
        promo_code_id,
        promo_codes (
          code,
          discount_type,
          discount_value
        )
      `)
      .eq('provider_payment_id', chargeId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // ส่งข้อมูลราคาที่ Backend คำนวณแล้ว
    return NextResponse.json({
      payment_id: payment.id,
      calculated_amounts: {
        original_amount: payment.original_amount,
        discount_amount: payment.discount_amount,
        final_amount: payment.amount
      },
      promo_code: payment.promo_codes ? {
        code: (payment.promo_codes as any).code,
        discount_type: (payment.promo_codes as any).discount_type,
        discount_value: (payment.promo_codes as any).discount_value
      } : null,
      status: payment.status,
      currency: payment.currency
    });

  } catch (error) {
    console.error('Error fetching payment record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
