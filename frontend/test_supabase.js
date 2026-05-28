require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('sessions').insert([{
    student_id: '123e4567-e89b-12d3-a456-426614174000', // random uuid
    listener_id: null,
    format: 'chat',
    scheduled_at: new Date().toISOString(),
    status: 'booked',
    duration: 25
  }]).select().single();
  console.log(error);
}
test();
