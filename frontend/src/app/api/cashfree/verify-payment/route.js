import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { order_id } = await request.json();

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || 'SANDBOX';

    if (!appId || !secretKey) {
      return NextResponse.json({ error: 'Cashfree API keys not configured' }, { status: 500 });
    }

    const baseUrl = env === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg';

    const response = await fetch(`${baseUrl}/orders/${order_id}`, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Failed to verify payment' }, { status: response.status });
    }

    // Cashfree returns order_status which can be 'PAID', 'ACTIVE' (pending), etc.
    return NextResponse.json({
      order_status: data.order_status,
      order_amount: data.order_amount,
      payment_details: data
    });

  } catch (error) {
    console.error('Server error verifying Cashfree payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
