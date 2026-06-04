'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import AuthVisualSide from '@/components/auth/AuthVisualSide';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Create entry in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          { 
            id: data.user.id, 
            email, 
            full_name: fullName,
            role: 'student'
          }
        ]);

      if (profileError) throw profileError;

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="login-container" style={{ minHeight: 'calc(100vh - 72px)' }}>
        <section className="login-form-side">
          <div className="login-form-content">
            <h1>Create an account</h1>
            <p className="login-tagline">
              Join the Solace community and start your journey towards emotional wellness.
            </p>

            {error && (
              <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ background: '#D1FAE5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                Registration successful! Redirecting to login...
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="login-input"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="login-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input-group">
                <input 
                  type="password" 
                  placeholder="Password (min 6 characters)" 
                  className="login-input"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="login-btn-large" disabled={loading || success}>
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>

            <p className="register-prompt" style={{ marginTop: '24px' }}>
              Already have an account? <Link href="/login">Login here</Link>
            </p>
          </div>
        </section>

        <AuthVisualSide />
      </main>
    </>
  );
}
