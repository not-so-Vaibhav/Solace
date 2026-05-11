'use client';
import StaticLayout from '@/components/layout/StaticLayout';

export default function ContactPage() {
  return (
    <StaticLayout title="Contact Us">
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: '8px' }}>Email</h3>
        <p><a href="mailto:solacevaibhav@email.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>solacevaibhav@email.com</a></p>
      </div>
      <div>
        <h3 style={{ color: 'var(--text)', marginBottom: '8px' }}>Support Hours</h3>
        <p>10 AM – 11 PM IST</p>
      </div>
    </StaticLayout>
  );
}
