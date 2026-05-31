'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus('loading');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      setError(error.message);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  };

  return (
    <>
      <Navbar />
      <main className="login-container" style={{ minHeight: 'calc(100vh - 72px)' }}>
        <section className="login-form-side">
          <div className="login-form-content">
            <h1>Forgot Password?</h1>
            <p className="login-tagline">
              No worries! Enter your email address below and we'll send you a link to reset your password.
            </p>

            {status === 'sent' ? (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #6EE7B7',
                color: '#065F46',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                lineHeight: '1.7'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>📬</div>
                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Check your email!</div>
                <div style={{ fontSize: '14px' }}>
                  We've sent a password reset link to <strong>{email}</strong>.<br />
                  The link expires in 1 hour. Check your spam folder if you don't see it.
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

                  <button
                    type="submit"
                    className="login-btn-large"
                    disabled={status === 'loading'}
                    style={{ marginTop: '8px' }}
                  >
                    {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            )}

            <p className="register-prompt" style={{ marginTop: '24px' }}>
              Remember your password? <Link href="/login">Back to Login</Link>
            </p>
          </div>
        </section>

        <section className="login-visual-side">
          <div className="visual-card">
            <h2 className="visual-title">Reset your access.</h2>
            <p className="visual-sub">
              We'll send you a secure link to get back into your <strong>Solace</strong> account safely.
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
