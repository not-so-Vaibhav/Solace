require('dotenv').config({ path: '.env.local' });
async function get() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
  const json = await res.json();
  const sessions = json.definitions.sessions;
  console.log('Sessions properties:', Object.keys(sessions.properties));
  console.log('Sessions properties details:', JSON.stringify(sessions.properties, null, 2));
}
get();
