import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { amount, customer_id, customer_name, customer_email, customer_phone } = await request.json();

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || 'SANDBOX'; // SANDBOX or PRODUCTION

    if (!appId || !secretKey) {
      return NextResponse.json({ error: 'Cashfree API keys not configured' }, { status: 500 });
    }

    const baseUrl = env === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg';

    const orderId = `solace_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      },
      body: JSON.stringify({
        order_amount: amount,
        order_currency: 'INR',
        order_id: orderId,
        customer_details: {
          customer_id: customer_id || 'guest',
          customer_name: customer_name || 'Student',
          customer_email: customer_email || 'student@example.com',
          customer_phone: customer_phone || '9999999999'
        },
        order_meta: {
          return_url: `${(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace('http://', 'https://')}/dashboard?order_id=${orderId}`
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree Order Error:', data);
      return NextResponse.json({ error: data.message || 'Failed to create order' }, { status: response.status });
    }

    return NextResponse.json({
      order_id: data.order_id,
      payment_session_id: data.payment_session_id
    });

  } catch (error) {
    console.error('Server error creating Cashfree order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
