'use client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function ListenersPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <section style={{ padding: '60px 5%', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', fontWeight: '600' }}>
            The Voices of Solace
          </span>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px, 5vw, 56px)', color: 'var(--text)', marginTop: '16px', marginBottom: '20px' }}>
            Meet our Listeners
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 'clamp(16px, 2vw, 18px)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Real students who have been in your shoes. Compassionate, non-judgmental, and here to provide the safe space you deserve.
          </p>
        </div>

        {/* FOUNDER SPOTLIGHT */}
        <div style={{ 
          background: 'var(--surface)', 
          borderRadius: '32px', 
          border: '1px solid var(--border)', 
          boxShadow: 'var(--card-shadow)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          
          <div style={{ 
            background: 'var(--accent)', 
            color: '#fff', 
            padding: '8px 16px', 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            position: 'absolute',
            top: '20px',
            left: '20px',
            borderRadius: '50px',
            zIndex: 1
          }}>
            <span>✨</span> Founder Listener
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '0' }}>
            
            {/* Visual Side */}
            <div style={{ 
              background: 'var(--surface2)', 
              minHeight: '300px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '40px',
              position: 'relative',
              borderRight: '1px solid var(--border)'
            }}>
              <div style={{ 
                width: '100%', 
                maxWidth: '240px', 
                aspectRatio: '1', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--surface) 100%)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 4px 20px rgba(81, 124, 113, 0.1)'
              }}>
                <span style={{ fontSize: 'clamp(60px, 10vw, 100px)' }}>👨‍💻</span>
              </div>
            </div>

            {/* Content Side */}
            <div style={{ padding: 'clamp(30px, 5vw, 60px) clamp(20px, 4vw, 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 4vw, 36px)', color: 'var(--text)', marginBottom: '8px' }}>
                Vaibhav Bariyar
              </h2>
              <p style={{ color: 'var(--text3)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', fontWeight: '500' }}>
                B.Tech Student • Founder of Solace
              </p>

              <blockquote style={{ 
                fontSize: 'clamp(16px, 2vw, 18px)', 
                fontStyle: 'italic', 
                color: 'var(--text2)', 
                lineHeight: '1.6', 
                paddingLeft: '20px',
                borderLeft: '4px solid var(--accent)',
                margin: '0 0 32px 0'
              }}>
                "I built Solace because students often carry emotional pressure silently. Sometimes people don't need advice — they just need space to breathe and talk honestly."
              </blockquote>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
                <div>
                  <h3 style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', fontWeight: '600' }}>
                    Comfort Areas
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Academic Burnout', 'Overthinking', 'Loneliness', 'Career Pressure'].map(area => (
                      <span key={area} style={{ 
                        background: 'var(--bg)', 
                        border: '1px solid var(--border)', 
                        padding: '6px 14px', 
                        borderRadius: '50px', 
                        fontSize: '12px', 
                        color: 'var(--text2)' 
                      }}>
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', fontWeight: '600' }}>
                    Conversation Style
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Calm', 'Reflective', 'Non-judgmental'].map(style => (
                      <span key={style} style={{ 
                        background: 'var(--accent-light)', 
                        color: 'var(--accent)',
                        border: '1px solid rgba(81, 124, 113, 0.2)', 
                        padding: '6px 14px', 
                        borderRadius: '50px', 
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '40px' }}>
                <Link href="/booking">
                  <button style={{ 
                    background: 'var(--text)', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '14px 28px', 
                    borderRadius: '50px', 
                    fontSize: '15px', 
                    fontWeight: '500',
                    cursor: 'pointer',
                    width: '100%',
                    maxWidth: '300px',
                    transition: 'transform 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Book a session with Vaibhav
                  </button>
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* INFORMATIONAL SEGMENTS */}
        <div style={{ marginTop: '80px', display: 'flex', flexDirection: 'column', gap: '60px' }}>
          
          {/* Why Solace Exists */}
          <div className="responsive-segment" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px, 4vw, 32px)', color: 'var(--text)', borderBottom: '2px solid var(--accent)', paddingBottom: '12px', display: 'inline-block' }}>
                Why Solace Exists
              </h2>
            </div>
            <div style={{ color: 'var(--text2)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                College life can become emotionally overwhelming in ways people rarely talk about openly.
              </p>
              <p style={{ marginBottom: '16px' }}>
                Between academics, placements, loneliness, burnout, relationships, and constant pressure to “keep going,” many students end up carrying everything silently.
              </p>
              <p style={{ marginBottom: '16px' }}>
                Solace was built by a student who understands that feeling personally.
              </p>
              <p style={{ marginBottom: '16px' }}>
                Not everyone needs therapy or advice all the time. Sometimes, people simply need a calm space to talk honestly, reflect, and feel heard without judgment.
              </p>
              <p style={{ fontWeight: '500', color: 'var(--text)' }}>
                Solace exists to make those conversations more accessible, private, and human.
              </p>
            </div>
          </div>

          {/* How Listening Works */}
          <div className="responsive-segment" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px, 4vw, 32px)', color: 'var(--text)', borderBottom: '2px solid var(--accent)', paddingBottom: '12px', display: 'inline-block' }}>
                How Listening Works
              </h2>
            </div>
            <div style={{ color: 'var(--text2)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px', fontWeight: '500', color: 'var(--text)' }}>
                Solace is a peer support platform — not a therapy or medical service.
              </p>
              <p style={{ marginBottom: '20px' }}>
                Our conversations are designed to provide students with a safe, respectful, and non-judgmental space to talk through what they’re feeling.
              </p>
              <p style={{ marginBottom: '12px', color: 'var(--text)', fontWeight: '600' }}>Here’s what you can expect:</p>
              <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 20px 0' }}>
                {[
                  'Calm, structured conversations with student peer listeners',
                  'No diagnosing, treatment, or medical advice',
                  'Confidential and respectful interactions',
                  'Public-space guidelines for all in-person conversations',
                  'Flexible formats including chat, Google Meet, and campus conversations'
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--accent)', fontSize: '18px', lineHeight: '1.4' }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontWeight: '500', color: 'var(--text)', fontStyle: 'italic' }}>
                The goal is simple: help students feel heard, lighter, and less alone.
              </p>
            </div>
          </div>

          {/* What We Value */}
          <div className="responsive-segment" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px, 4vw, 32px)', color: 'var(--text)', borderBottom: '2px solid var(--accent)', paddingBottom: '12px', display: 'inline-block' }}>
                What We Value
              </h2>
            </div>
            <div style={{ color: 'var(--text2)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '20px' }}>
                Every conversation on Solace should feel emotionally safe and respectful. Our listeners are expected to approach conversations with:
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {[
                  'Empathy', 'Active listening', 'Calmness and patience',
                  'Confidentiality', 'Non-judgment', 'Respect for boundaries'
                ].map(value => (
                  <div key={value} style={{ 
                    background: 'var(--surface)', 
                    border: '1px solid var(--border)', 
                    padding: '12px 16px', 
                    borderRadius: '12px',
                    fontWeight: '500',
                    color: 'var(--text)',
                    fontSize: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}>
                    {value}
                  </div>
                ))}
              </div>

              <p style={{ fontWeight: '600', color: 'var(--accent)', fontSize: 'clamp(17px, 3vw, 20px)', fontFamily: 'var(--serif)' }}>
                We believe meaningful support starts with simply being present and listening well.
              </p>
            </div>
          </div>

        </div>

      </section>
      
      <Footer />

      <style jsx>{`
        @media (max-width: 768px) {
          .responsive-segment {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
