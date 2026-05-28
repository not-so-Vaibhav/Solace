require('dotenv').config({ path: '.env.local' });
async function test() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sessions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      student_id: '00000000-0000-0000-0000-000000000000',
      listener_id: null,
      format: 'chat',
      scheduled_at: new Date().toISOString(),
      status: 'booked',
      duration: 25
    })
  });
  console.log(await res.text());
}
test();
