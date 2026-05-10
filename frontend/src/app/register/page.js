'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');
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
            role: role // Use selected role
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
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => setRole('student')}
                  style={{ flex: 1, padding: '10px', borderRadius: '50px', border: '1px solid var(--border)', background: role === 'student' ? 'var(--text)' : 'transparent', color: role === 'student' ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                >
                  Register as Student
                </button>
                <button 
                  type="button" 
                  onClick={() => setRole('admin')}
                  style={{ flex: 1, padding: '10px', borderRadius: '50px', border: '1px solid var(--border)', background: role === 'admin' ? 'var(--text)' : 'transparent', color: role === 'admin' ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                >
                  Register as Admin
                </button>
              </div>

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
                {loading ? 'Creating account...' : `Register as ${role === 'admin' ? 'Admin' : 'Student'}`}
              </button>
            </form>

            <p className="register-prompt" style={{ marginTop: '24px' }}>
              Already have an account? <Link href="/login">Login here</Link>
            </p>
          </div>
        </section>

        <section className="login-visual-side">
          <div className="visual-card">
            <img src="/images/login-illustration.png" alt="Register" className="visual-illustration" />
            <h2 className="visual-title">You're not alone.</h2>
            <p className="visual-sub">
              Access peer support, journal your thoughts, and track your wellness journey with <strong>Solace</strong>.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
