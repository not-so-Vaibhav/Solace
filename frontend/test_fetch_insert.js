require('dotenv').config({ path: '.env.local' });
async function test() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/payments`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      user_id: '00000000-0000-0000-0000-000000000000',
      session_id: '00000000-0000-0000-0000-000000000000',
      amount: 100,
      status: 'completed'
    })
  });
  console.log(await res.text());
}
test();
