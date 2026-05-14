'use client';
import StaticLayout from '@/components/layout/StaticLayout';

export default function RefundPolicyPage() {
  return (
    <StaticLayout title="Refund & Cancellation Policy">
      <div style={{ color: 'var(--text3)', marginBottom: '40px', fontSize: '14px', fontWeight: '500' }}>Last updated: May 2026</div>
      
      <section style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '18px', lineHeight: '1.7', color: 'var(--text2)', marginBottom: '24px' }}>
          This Refund & Cancellation Policy outlines how cancellations, rescheduling, and refunds are handled for sessions booked through Solace.
        </p>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>1. Session Cancellation</h3>
          <p>Users may cancel or reschedule a session up to 2 hours before the scheduled session time.</p>
          <p style={{ marginTop: '12px' }}>Eligible cancellations may receive:</p>
          <ul style={{ listStyleType: 'circle', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8' }}>
            <li>A session credit, or</li>
            <li>A rescheduled booking depending on availability</li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>2. Non-Refundable Sessions</h3>
          <p>The following are generally non-refundable:</p>
          <ul style={{ listStyleType: 'circle', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8', marginTop: '12px' }}>
            <li>Completed sessions</li>
            <li>Missed sessions without prior notice</li>
            <li>Cancellations made less than 2 hours before the session</li>
          </ul>
          <div style={{ marginTop: '24px', padding: '20px', background: 'var(--surface2)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '14px', fontStyle: 'italic', color: 'var(--text3)' }}>
            This policy helps respect the time and availability of peer listeners.
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>3. Exceptional Situations</h3>
          <p>Refund requests related to technical issues, duplicate payments, or emergency circumstances may be reviewed on a case-by-case basis.</p>
          <p style={{ marginTop: '16px' }}>Approval of refunds remains at the discretion of the Solace support team.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>4. Payment Processing</h3>
          <p>Refunds, when approved, may take 5–10 business days to reflect in the original payment method depending on the payment provider or bank.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>5. Platform Rights</h3>
          <p>Solace reserves the right to refuse refunds in cases involving:</p>
          <ul style={{ listStyleType: 'circle', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8', marginTop: '12px' }}>
            <li>Policy abuse</li>
            <li>Fraudulent activity</li>
            <li>Repeated misuse of bookings or payments</li>
          </ul>
        </section>

        <section style={{ padding: '40px', background: 'var(--surface)', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text)', marginBottom: '24px', fontFamily: 'var(--serif)' }}>Need Help?</h3>
          <p style={{ marginBottom: '32px' }}>For cancellation or refund assistance:</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>📧</span>
              <a href="mailto:solacevaibhav@gmail.com" style={{ color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--accent)', fontWeight: '600' }}>solacevaibhav@gmail.com</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text3)', fontSize: '14px' }}>
              <span style={{ fontSize: '20px' }}>🕒</span>
              <span>Support Hours: 10 AM – 11 PM IST</span>
            </div>
          </div>
        </section>
      </div>

      <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text3)', fontSize: '15px' }}>
        🫂 Built for students, with empathy.
      </div>
    </StaticLayout>
  );
}
