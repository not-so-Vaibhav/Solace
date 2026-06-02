import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client bypasses RLS - safe here because we verify the JWT first
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request) {
  try {
    // 1. Extract and verify the user's JWT from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // 2. Verify the JWT and get the user's auth data
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) {
      console.error('JWT verification failed:', authError?.message);
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const userEmail = authUser.email;
    const authUid = authUser.id;

    console.log(`📊 [user-data] Fetching dashboard data for email: ${userEmail}, auth_uid: ${authUid}`);

    // 3. Look up the canonical profile by EMAIL (handles OAuth vs email/password UUID mismatch)
    const { data: profileByEmail } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle();

    // 4. Also try by UUID in case email lookup fails
    let profile = profileByEmail;
    if (!profile) {
      const { data: profileById } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', authUid)
        .maybeSingle();
      profile = profileById;
    }

    // 5. If still no profile, create one for this auth user
    if (!profile) {
      console.log(`🆕 [user-data] Creating new profile for ${userEmail}`);
      const { data: newProfile } = await supabaseAdmin
        .from('users')
        .insert([{
          id: authUid,
          email: userEmail,
          full_name: authUser.user_metadata?.full_name || userEmail.split('@')[0],
          role: 'student'
        }])
        .select()
        .single();
      profile = newProfile;
    }

    // 6. Fetch sessions using the CANONICAL user ID from the profile (not necessarily authUid)
    const canonicalUserId = profile?.id || authUid;
    
    const { data: sessions } = await supabaseAdmin
      .from('sessions')
      .select(`
        *,
        listener:users!sessions_listener_id_fkey(id, full_name, avatar_url)
      `)
      .eq('student_id', canonicalUserId)
      .order('scheduled_at', { ascending: false });

    // 7. Fetch journals
    const { data: journals } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', canonicalUserId)
      .order('created_at', { ascending: false });

    // 8. Fetch payments
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('user_id', canonicalUserId)
      .order('created_at', { ascending: false });

    console.log(`✅ [user-data] Found: profile=${!!profile}, sessions=${sessions?.length || 0}, journals=${journals?.length || 0}`);

    return NextResponse.json({
      profile: profile || null,
      sessions: sessions || [],
      journals: journals || [],
      payments: payments || [],
      canonicalUserId,
      authUid,
      isIdentityMismatch: canonicalUserId !== authUid
    });

  } catch (error) {
    console.error('❌ [user-data] Internal error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
