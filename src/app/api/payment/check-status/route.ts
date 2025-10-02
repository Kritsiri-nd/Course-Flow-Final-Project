import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const chargeId = searchParams.get('chargeId');

        if (!chargeId) {
            return NextResponse.json({ error: 'Charge ID is required' }, { status: 400 });
        }

        const omiseSecretKey = process.env.OMISE_SECRET_KEY;
        
        if (!omiseSecretKey) {
            return NextResponse.json({ error: 'Omise Secret Key not found' }, { status: 500 });
        }

        // Check charge status using Omise API
        const response = await fetch(`https://api.omise.co/charges/${chargeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from(omiseSecretKey + ':').toString('base64')}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('Omise Charge Status Response:', data);

        if (!response.ok) {
            console.error('Omise API Error:', data);
            return NextResponse.json({ error: data.message || 'Failed to check charge status' }, { status: response.status });
        }

        return NextResponse.json({
            id: data.id,
            status: data.status,
            paid: data.paid,
            amount: data.amount,
            currency: data.currency,
            created: data.created,
            paid_at: data.paid_at
        });
    } catch (error) {
        console.error('Error checking charge status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
