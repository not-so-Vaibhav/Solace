'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { user } = await login(email, password);
      
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
      
      if (profile?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
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
        {/* Left Side: Form */}
        <section className="login-form-side">
          <div className="login-form-content">
            <h1>Welcome back!</h1>
            <p className="login-tagline">
              Simplify your wellness journey and boost your peace of mind with Solace. Get started for free.
            </p>

            {error && (
              <div style={{ 
                background: '#FEE2E2', 
                color: '#DC2626', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
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
              
              <div className="input-group" style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="login-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Link href="#" className="forgot-link">Forgot Password?</Link>

              <button 
                type="submit" 
                className="login-btn-large" 
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="divider-text">or continue with</div>

            <div className="social-login">
              <div className="social-icon">G</div>
              <div className="social-icon"></div>
              <div className="social-icon">f</div>
            </div>

            <p className="register-prompt">
              Not a member? <Link href="/register">Register now</Link>
            </p>
          </div>
        </section>

        {/* Right Side: Visual */}
        <section className="login-visual-side">
          <div className="visual-card">
            <img 
              src="/images/login-illustration.png" 
              alt="Solace Illustration" 
              className="visual-illustration"
            />
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '20px',
              boxShadow: 'var(--card-shadow)',
              position: 'absolute',
              bottom: '150px',
              left: '40px',
              textAlign: 'left',
              maxWidth: '200px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Daily Reflection</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>10 sessions</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>84%</div>
                <div style={{ background: 'var(--accent-light)', padding: '4px 10px', borderRadius: '50px', fontSize: '12px', color: 'var(--accent)' }}>Design</div>
              </div>
            </div>

            <h2 className="visual-title">Find your calm.</h2>
            <p className="visual-sub">
              Make your emotional well-being easier and more organized with <strong>Solace</strong>.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginTop: '30px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text3)', opacity: 0.3 }}></div>
              <div style={{ width: '20px', height: '8px', borderRadius: '50px', background: 'var(--text)' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text3)', opacity: 0.3 }}></div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
