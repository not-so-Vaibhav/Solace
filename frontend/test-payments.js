require('dotenv').config({ path: '.env.local' });

async function checkPayments() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/payments?select=*';
  const response = await fetch(url, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const data = await response.json();
  console.log("Payments count:", data.length);
  if (data.length > 0) console.log("Sample:", data[0]);
}
checkPayments();
