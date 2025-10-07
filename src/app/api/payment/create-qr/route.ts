import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { amount, currency = 'thb' } = await request.json();

        const omiseSecretKey = process.env.OMISE_SECRET_KEY;
        
        if (!omiseSecretKey) {
            return NextResponse.json({ error: 'Omise Secret Key not found' }, { status: 500 });
        }

        // Create PromptPay charge using Omise API
        const response = await fetch('https://api.omise.co/charges', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(omiseSecretKey + ':').toString('base64')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                currency: currency,
                source: {
                    type: 'promptpay'
                }
            }),
        });

        console.log('Omise API Request:');
        console.log('- URL:', 'https://api.omise.co/charges');
        console.log('- Method:', 'POST');
        console.log('- Amount:', amount);
        console.log('- Currency:', currency);
        console.log('- Secret Key:', omiseSecretKey ? 'Present' : 'Missing');

        const data = await response.json();
        console.log('Omise API Response Status:', response.status);
        console.log('Omise API Response Data:', data);

        if (!response.ok) {
            console.error('Omise API Error:', data);
            return NextResponse.json({ error: data.message || 'Failed to create QR code' }, { status: response.status });
        }

        console.log('Omise API Success - returning data');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating QR code:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
