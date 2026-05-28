require('dotenv').config({ path: '.env.local' });
async function test() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/payments?limit=1`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
    }
  });
  console.log(await res.text());
}
test();
