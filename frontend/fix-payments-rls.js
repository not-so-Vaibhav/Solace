const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLS() {
  const sql = `
    -- Enable RLS just in case it wasn't
    ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
    
    -- Drop the admin policy if it already exists to avoid errors
    DROP POLICY IF EXISTS "Admins can read all payments" ON payments;
    
    -- Create the admin policy
    CREATE POLICY "Admins can read all payments" ON payments
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role = 'admin'
      )
    );
  `;
  
  // Actually, Supabase JS client cannot execute raw SQL natively without a postgres function.
  // Instead, I'll use the REST API `rpc` if there is a function, or just write it to a .sql file and run it.
}
