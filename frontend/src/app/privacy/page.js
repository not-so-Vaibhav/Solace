'use client';
import StaticLayout from '@/components/layout/StaticLayout';

export default function PrivacyPage() {
  return (
    <StaticLayout title="Privacy Policy">
      <div style={{ color: 'var(--text3)', marginBottom: '40px', fontSize: '14px', fontWeight: '500' }}>Last updated: May 2026</div>
      
      <section style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '18px', lineHeight: '1.7', color: 'var(--text2)', marginBottom: '24px' }}>
          At Solace, protecting the privacy and emotional safety of our users is one of our highest priorities. This Privacy Policy explains how we collect, use, and safeguard your information while using the platform.
        </p>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>1. Information We Collect</h3>
          <p>To provide a safe and personalized experience, Solace may collect:</p>
          <ul style={{ listStyleType: 'circle', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8', marginTop: '12px' }}>
            <li>Basic account information such as name and email</li>
            <li>Session booking details</li>
            <li>Journal entries and reflections submitted by users</li>
            <li>Platform usage and activity data</li>
            <li>Payment confirmation details from secure payment providers</li>
          </ul>
          <p style={{ marginTop: '16px', fontStyle: 'italic', color: 'var(--text3)' }}>We do not collect unnecessary sensitive personal information.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>2. How We Use Your Information</h3>
          <p>Your information is used to:</p>
          <ul style={{ listStyleType: 'circle', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8', marginTop: '12px' }}>
            <li>Manage bookings and user accounts</li>
            <li>Improve the platform experience</li>
            <li>Provide personalized wellness insights</li>
            <li>Maintain platform safety and moderation</li>
            <li>Respond to support requests</li>
          </ul>
          <div style={{ marginTop: '24px', padding: '20px', borderLeft: '4px solid var(--accent)', background: 'var(--surface2)', borderRadius: '0 12px 12px 0' }}>
            <p style={{ fontWeight: '600', color: 'var(--accent)' }}>Solace does not sell user data to advertisers or third parties.</p>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>3. Conversations & Confidentiality</h3>
          <p>Conversations on Solace are intended to remain respectful and private.</p>
          <p>While we value confidentiality, limited access to conversations or reports may occur when necessary to:</p>
          <ul style={{ listStyleType: 'circle', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8', marginTop: '12px' }}>
            <li>Investigate harmful behavior</li>
            <li>Prevent abuse or safety risks</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>4. Data Security</h3>
          <p>We take reasonable measures to protect user information from unauthorized access, misuse, or disclosure.</p>
          <p style={{ marginTop: '16px' }}>
            However, no online platform can guarantee absolute security. Users are encouraged to avoid sharing highly sensitive financial, legal, or medical information during peer sessions.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>5. Third-Party Services</h3>
          <p>Payments and authentication services may be processed through trusted third-party providers.</p>
          <p>These providers may have their own privacy policies and security practices.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>6. User Rights</h3>
          <p>Users may request:</p>
          <ul style={{ listStyleType: 'circle', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8', marginTop: '12px' }}>
            <li>Account updates</li>
            <li>Correction of personal information</li>
            <li>Deletion of their account and associated data</li>
          </ul>
          <p style={{ marginTop: '16px' }}>Requests can be submitted through our support email.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>7. Changes to This Policy</h3>
          <p>Solace may update this Privacy Policy periodically to reflect platform improvements or legal requirements.</p>
          <p>Continued use of the platform after updates constitutes acceptance of the revised policy.</p>
        </section>

        <section style={{ padding: '40px', background: 'var(--surface)', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text)', marginBottom: '20px', fontFamily: 'var(--serif)' }}>Contact Us</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <a href="mailto:solacevaibhav@gmail.com" style={{ color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--accent)', fontWeight: '600' }}>solacevaibhav@gmail.com</a>
          </div>
        </section>
      </div>

      <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text3)', fontSize: '15px' }}>
        🫂 Built for students, with empathy.
      </div>
    </StaticLayout>
  );
}
