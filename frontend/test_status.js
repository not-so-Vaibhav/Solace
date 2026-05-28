require('dotenv').config({ path: '.env.local' });
async function test() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sessions`;
  const headers = {
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  
  const statuses = ['pending', 'scheduled', 'booked', 'confirmed', 'requested'];
  for (const s of statuses) {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        student_id: '00000000-0000-0000-0000-000000000000',
        listener_id: null,
        scheduled_at: new Date().toISOString(),
        status: s
      })
    });
    const text = await res.text();
    console.log(`Status ${s}:`, text.includes('sessions_status_check') ? 'Violated' : text);
  }
}
test();
