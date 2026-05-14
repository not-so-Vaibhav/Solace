'use client';
import StaticLayout from '@/components/layout/StaticLayout';

export default function ContactPage() {
  return (
    <StaticLayout title="Contact Us">
      <section style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '18px', lineHeight: '1.7', color: 'var(--text2)', marginBottom: '16px' }}>
          We’d love to hear from you.
        </p>
        <p>Whether you have questions, feedback, partnership inquiries, or need support, the Solace team is here to help.</p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        <section style={{ padding: '32px', background: 'var(--surface2)', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '24px', fontFamily: 'var(--serif)' }}>General Support</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>📧</span>
              <a href="mailto:solacevaibhav@gmail.com" style={{ color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--accent)', fontWeight: '600' }}>solacevaibhav@gmail.com</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>📞</span>
              <a href="tel:+919430698561" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: '600' }}>+91 94306 98561</a>
            </div>
          </div>
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text3)', marginBottom: '12px' }}>FOR:</p>
            <ul style={{ listStyleType: 'circle', paddingLeft: '20px', color: 'var(--text2)', fontSize: '14px', lineHeight: '1.8' }}>
              <li>Account support</li>
              <li>Session-related issues</li>
              <li>Payment concerns</li>
              <li>Safety reports</li>
              <li>Technical assistance</li>
            </ul>
          </div>
        </section>

        <section style={{ padding: '32px', background: 'var(--surface2)', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '24px', fontFamily: 'var(--serif)' }}>Business & Collaborations</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '20px' }}>📧</span>
            <a href="mailto:solacevaibhav@gmail.com" style={{ color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--accent)', fontWeight: '600' }}>solacevaibhav@gmail.com</a>
          </div>
          <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text3)', marginBottom: '12px' }}>FOR:</p>
            <ul style={{ listStyleType: 'circle', paddingLeft: '20px', color: 'var(--text2)', fontSize: '14px', lineHeight: '1.8' }}>
              <li>College collaborations</li>
              <li>Campus partnerships</li>
              <li>Media inquiries</li>
              <li>Brand collaborations</li>
            </ul>
          </div>
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginTop: '48px' }}>
        <section style={{ padding: '24px', background: 'var(--bg)', borderRadius: '20px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>Support Hours</h3>
          <p style={{ color: 'var(--text2)' }}>🕒 Monday – Sunday</p>
          <p style={{ color: 'var(--text2)', fontWeight: '600' }}>10:00 AM – 11:00 PM IST</p>
        </section>

        <section style={{ padding: '24px', background: 'var(--bg)', borderRadius: '20px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>Response Time</h3>
          <p style={{ color: 'var(--text2)' }}>We usually respond within:</p>
          <ul style={{ listStyleType: 'none', padding: 0, marginTop: '8px', fontSize: '14px', color: 'var(--text2)' }}>
            <li>• 24 hours for standard queries</li>
            <li>• Faster for urgent safety concerns</li>
          </ul>
        </section>
      </div>

      <div style={{ marginTop: '80px', padding: '48px', background: 'var(--surface)', borderRadius: '32px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>About Solace</h3>
        <p style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text2)', lineHeight: '1.7' }}>
          Solace is a student-focused peer support platform designed to create emotionally safe conversations, wellness reflections, and meaningful human connection.
        </p>
        <div style={{ marginTop: '32px', color: 'var(--text3)', fontSize: '15px' }}>
          🫂 Built for students, with empathy.
        </div>
      </div>
    </StaticLayout>
  );
}
