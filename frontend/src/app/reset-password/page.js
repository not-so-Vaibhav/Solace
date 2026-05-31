'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error | invalid
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Supabase v2 automatically parses the hash token from the URL and fires
    // the PASSWORD_RECOVERY event. We listen for it to confirm the link is valid.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Token is valid — user is now in a temporary recovery session
        // Keep status as 'idle' so the form shows
        setStatus('idle');
      }
    });

    // Fallback: if no hash token at all, mark as invalid after a short delay
    const timer = setTimeout(() => {
      const hash = window.location.hash;
      if (!hash || (!hash.includes('access_token') && !hash.includes('type=recovery'))) {
        setStatus('invalid');
      }
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setStatus('loading');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setStatus('error');
    } else {
      setStatus('success');
      // Sign out the recovery session and redirect to login after 3 seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/login');
      }, 3000);
    }
  };

  if (status === 'invalid') {
    return (
      <>
        <Navbar />
        <main className="login-container" style={{ minHeight: 'calc(100vh - 72px)' }}>
          <section className="login-form-side">
            <div className="login-form-content">
              <div style={{
                background: '#FEF3C7',
                border: '1px solid #FCD34D',
                color: '#92400E',
                padding: '24px',
                borderRadius: '12px',
                textAlign: 'center',
                lineHeight: '1.7'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Invalid or Expired Link</div>
                <div style={{ fontSize: '14px' }}>
                  This password reset link is invalid or has already been used. Reset links expire after 1 hour.
                </div>
              </div>
              <p className="register-prompt" style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link href="/forgot-password">→ Request a new reset link</Link>
              </p>
            </div>
          </section>
          <section className="login-visual-side">
            <div className="visual-card">
              <h2 className="visual-title">Stay secure.</h2>
              <p className="visual-sub">Reset links expire after 1 hour for your protection.</p>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="login-container" style={{ minHeight: 'calc(100vh - 72px)' }}>
        <section className="login-form-side">
          <div className="login-form-content">
            <h1>Set New Password</h1>
            <p className="login-tagline">
              Choose a strong new password to secure your Solace account.
            </p>

            {status === 'success' ? (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #6EE7B7',
                color: '#065F46',
                padding: '24px',
                borderRadius: '12px',
                textAlign: 'center',
                lineHeight: '1.7'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Password Updated!</div>
                <div style={{ fontSize: '14px' }}>
                  Your password has been changed successfully.<br />
                  Redirecting you to login in a moment…
                </div>
              </div>
            ) : (
              <>
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

                <form onSubmit={handleSubmit}>
                  <div className="input-group" style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="New Password (min. 8 characters)"
                      className="login-input"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: '60px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: '13px', fontWeight: '600'
                      }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {/* Password strength hint */}
                  {password.length > 0 && (
                    <div style={{ fontSize: '12px', marginTop: '6px', marginBottom: '4px', color: password.length >= 8 ? '#059669' : '#DC2626' }}>
                      {password.length >= 8 ? '✓ Password length is good' : `✗ ${8 - password.length} more characters needed`}
                    </div>
                  )}

                  <div className="input-group" style={{ marginTop: '12px' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm New Password"
                      className="login-input"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  {/* Match indicator */}
                  {confirmPassword.length > 0 && (
                    <div style={{ fontSize: '12px', marginTop: '6px', color: password === confirmPassword ? '#059669' : '#DC2626' }}>
                      {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="login-btn-large"
                    disabled={status === 'loading'}
                    style={{ marginTop: '20px' }}
                  >
                    {status === 'loading' ? 'Updating Password…' : 'Update Password'}
                  </button>
                </form>
              </>
            )}

            <p className="register-prompt" style={{ marginTop: '24px' }}>
              <Link href="/login">← Back to Login</Link>
            </p>
          </div>
        </section>

        <section className="login-visual-side">
          <div className="visual-card">
            <h2 className="visual-title">Almost there.</h2>
            <p className="visual-sub">
              Create a strong password to keep your <strong>Solace</strong> account secure.
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
