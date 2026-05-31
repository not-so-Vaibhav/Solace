require('dotenv').config({ path: '.env.local' });

async function testOrder() {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secretKey) {
    console.log("No keys"); return;
  }
  
  const response = await fetch('https://sandbox.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      },
      body: JSON.stringify({
        order_amount: 100,
        order_currency: 'INR',
        order_id: 'test_order_' + Date.now(),
        customer_details: {
          customer_id: 'guest',
          customer_phone: '9999999999'
        }
      })
  });
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

testOrder();
