'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import AuthVisualSide from '@/components/auth/AuthVisualSide';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && userRole && !authLoading) {
      if (userRole === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, userRole, authLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const data = await login(email, password);
      console.log('✅ Login successful, checking for immediate redirect...');
      
      // FALLBACK: If the useEffect is slow (mobile), try to redirect now
      if (data?.user) {
        // We wait a tiny bit for the AuthContext to potentially update userRole
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single();
            if (profile?.role) {
              console.log('🚀 Immediate redirect triggered');
              router.push(profile.role === 'admin' ? '/admin/dashboard' : '/dashboard');
            }
          } catch (err) {
            console.warn('Immediate redirect check failed, relying on useEffect');
          }
        }, 800);
      }
    } catch (err) {
      if (err.message === 'Invalid login credentials') {
        setError("We couldn't find an account with those details.\nCheck your email and password and try again.");
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setError(`Failed to log in with ${provider}`);
    }
  };

  return (
    <>
      <Navbar />
      <main className="login-container" style={{ minHeight: 'calc(100vh - 72px)' }}>
        {/* Left Side: Form */}
        <section className="login-form-side">
          <div className="login-form-content">
            <h1 className="auth-animate" style={{ animationDelay: '0.1s' }}>Welcome back!</h1>
            <p className="login-tagline auth-animate" style={{ animationDelay: '0.2s' }}>
              Simplify your wellness journey and boost your peace of mind with Solace. Get started for free.
            </p>

            {error && (
              <div className="auth-animate" style={{ 
                background: '#FEE2E2', 
                color: '#DC2626', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                fontSize: '14px',
                animationDelay: '0s',
                whiteSpace: 'pre-wrap'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="input-floating-group auth-animate" style={{ animationDelay: '0.3s' }}>
                <input 
                  type="email" 
                  placeholder=" " 
                  className="login-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                />
                <label htmlFor="email" className="input-floating-label">Email Address</label>
              </div>
              
              <div className="input-floating-group auth-animate" style={{ animationDelay: '0.4s' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder=" " 
                  className="login-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  style={{ paddingRight: '50px' }}
                />
                <label htmlFor="password" className="input-floating-label">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>

              <Link href="/forgot-password" className="forgot-link auth-animate" style={{ animationDelay: '0.45s' }}>Forgot Password?</Link>

              <button 
                type="submit" 
                className="login-btn-large auth-animate" 
                disabled={loading}
                style={{ animationDelay: '0.5s' }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="divider-text auth-animate" style={{ animationDelay: '0.55s' }}>or continue with</div>

            <div className="social-login auth-animate" style={{ animationDelay: '0.6s' }}>
              <button 
                className="google-btn" 
                onClick={() => handleOAuthLogin('google')}
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <p className="auth-animate" style={{ animationDelay: '0.65s', fontSize: '13px', color: 'var(--text3)', textAlign: 'center', marginTop: '-24px', marginBottom: '30px' }}>
              Your conversations remain private and confidential.
            </p>

            <p className="register-prompt auth-animate" style={{ animationDelay: '0.7s' }}>
              Not a member? <Link href="/register">Register now</Link>
            </p>
          </div>
        </section>

        {/* Right Side: Visual */}
        <AuthVisualSide />
      </main>
    </>
  );
}

