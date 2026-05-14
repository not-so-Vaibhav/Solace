'use client';
import StaticLayout from '@/components/layout/StaticLayout';

export default function TermsPage() {
  return (
    <StaticLayout title="Terms of Service">
      <div style={{ color: 'var(--text3)', marginBottom: '40px', fontSize: '14px', fontWeight: '500' }}>Last updated: May 2026</div>
      
      <section style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '18px', lineHeight: '1.7', color: 'var(--text2)', marginBottom: '24px' }}>
          Welcome to Solace — a peer support platform designed to provide students with a calm, respectful, and emotionally safe space for conversation and reflection.
        </p>
        <p>By accessing or using Solace, you agree to the following terms and guidelines.</p>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>1. Nature of the Platform</h3>
          <p>Solace is a peer-support and emotional wellness platform.</p>
          <p>Our listeners are students and trained peer supporters — not licensed therapists, psychologists, psychiatrists, or medical professionals.</p>
          
          <div style={{ marginTop: '20px', padding: '24px', background: 'var(--surface2)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <p style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--text)' }}>Solace does not provide:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8' }}>
              <li>Medical treatment</li>
              <li>Psychiatric care</li>
              <li>Crisis intervention</li>
              <li>Professional therapy</li>
              <li>Diagnosis or prescriptions</li>
            </ul>
          </div>
          <p style={{ marginTop: '20px', fontStyle: 'italic', color: 'var(--text3)' }}>
            If you are experiencing a mental health emergency or are in immediate danger, please contact local emergency services or a licensed mental health professional.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>2. Respectful Conduct</h3>
          <p>All users are expected to interact respectfully and responsibly.</p>
          <p>The following behaviors are strictly prohibited:</p>
          <ul style={{ listStyleType: 'circle', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8', marginTop: '12px' }}>
            <li>Harassment or abuse</li>
            <li>Hate speech or discrimination</li>
            <li>Threats or intimidation</li>
            <li>Inappropriate sexual behavior</li>
            <li>Sharing harmful or illegal content</li>
            <li>Violating another person’s privacy</li>
          </ul>
          <p style={{ marginTop: '16px' }}>Solace reserves the right to suspend or remove accounts that violate these guidelines.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>3. Session Guidelines</h3>
          <p>Sessions on Solace are intended for supportive, structured, and non-judgmental conversations.</p>
          <p>Users understand that:</p>
          <ul style={{ listStyleType: 'circle', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8', marginTop: '12px' }}>
            <li>Listeners may share personal perspectives, not professional advice</li>
            <li>Conversations are intended for emotional support only</li>
            <li>Outcomes and experiences may vary for each individual</li>
          </ul>
          <div style={{ marginTop: '24px', padding: '20px', borderLeft: '4px solid var(--accent)', background: 'var(--bg)', borderRadius: '0 12px 12px 0' }}>
            <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>For any in-person interaction arranged through the platform:</p>
            <ul style={{ listStyleType: 'none', color: 'var(--text2)', lineHeight: '1.6' }}>
              <li>✓ Meetings must take place only in safe public locations</li>
              <li>✓ Both individuals must consent willingly</li>
              <li>✓ Users are responsible for their own personal safety</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>4. Privacy & Confidentiality</h3>
          <p>We value emotional safety and respectful confidentiality.</p>
          <p>Personal journal entries, reflections, and conversations are intended to remain private. However, Solace may review limited data when necessary to:</p>
          <ul style={{ listStyleType: 'circle', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8', marginTop: '12px' }}>
            <li>Maintain platform safety</li>
            <li>Investigate misuse</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p style={{ marginTop: '16px' }}>We encourage all users to avoid sharing highly sensitive financial, medical, or legal information during peer sessions.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>5. Payments & Bookings</h3>
          <p>Session bookings made through Solace may require payment.</p>
          <p>By booking a session, users agree that:</p>
          <ul style={{ listStyleType: 'circle', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8', marginTop: '12px' }}>
            <li>Pricing will be clearly displayed before payment</li>
            <li>Successful payment confirms the booking</li>
            <li>Refunds may be subject to platform policies</li>
            <li>Misuse of payment systems may result in account restrictions</li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', fontFamily: 'var(--serif)' }}>6. Platform Availability</h3>
          <p>We continuously improve Solace, but we do not guarantee uninterrupted access to the platform at all times.</p>
          <p>Features, pricing, availability, and services may evolve over time.</p>
        </section>

        <section style={{ padding: '40px', background: 'var(--surface)', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text)', marginBottom: '20px', fontFamily: 'var(--serif)' }}>7. Acceptance of Terms</h3>
          <p style={{ maxWidth: '600px', margin: '0 auto 32px' }}>
            By continuing to use Solace, you acknowledge that you have read, understood, and agreed to these Terms of Service.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <p style={{ fontWeight: '600', color: 'var(--accent)' }}>Contact</p>
            <a href="mailto:solacevaibhav@gmail.com" style={{ color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--accent)' }}>solacevaibhav@gmail.com</a>
          </div>
        </section>
      </div>

      <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text3)', fontSize: '15px' }}>
        🫂 Built for students, with empathy.
      </div>
    </StaticLayout>
  );
}
