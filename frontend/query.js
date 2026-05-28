require('dotenv').config({ path: '.env.local' });
async function get() {
  const query = {
    query: `SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'payments';`
  };
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/run_sql`, {
    method: 'POST',
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query)
  });
  console.log(await res.text());
}
get();
