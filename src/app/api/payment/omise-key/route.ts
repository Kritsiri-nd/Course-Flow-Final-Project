import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const publicKey = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY;
    
    if (!publicKey) {
      return NextResponse.json({ error: 'Omise public key not found' }, { status: 500 });
    }

    return NextResponse.json({ publicKey });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get Omise key' }, { status: 500 });
  }
}
