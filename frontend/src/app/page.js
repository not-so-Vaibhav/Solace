'use client';
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LandingPage() {
  const [selectedMood, setSelectedMood] = useState('😐');
  const { user } = useAuth();
  const router = useRouter();

  const scrollToHow = () => {
    const el = document.getElementById('how-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMoodClick = async (mood) => {
    setSelectedMood(mood);
    if (user) {
      // Proactively save mood to journal if logged in
      try {
        await supabase.from('journal_entries').insert([{
          user_id: user.id,
          content: `Feeling ${mood} today.`,
          mood: mood
        }]);
      } catch (err) {
        console.error('Mood save error:', err);
      }
    }
  };

  const handleContinueWriting = () => {
    if (user) {
      router.push('/dashboard?tab=journal');
    } else {
      router.push('/login');
    }
  };

  return (
    <main>
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-badge">Peer Support, Not Therapy</div>
          <h1>You don't have to carry <em>everything</em> alone.</h1>
          <p className="hero-sub">A calm, private space to talk with trained student listeners — whenever you're feeling overwhelmed, burnt out, or just need to be heard.</p>
          <div className="hero-btns">
            <Link href="/booking" className="btn-primary" style={{ textDecoration: 'none' }}>Book a Session</Link>
            <button className="btn-secondary" onClick={scrollToHow}>How it works ↓</button>
          </div>
          <div className="hero-disclaimer" style={{ marginTop: '24px' }}>
            Solace is not a licensed therapy service. We are peer supporters, not medical or mental health professionals.
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card-stack">
            <div className="hero-card featured">
              <div className="hc-top">
                <div className="avatar av-teal">V</div>
                <div>
                  <div className="hc-name">Vaibhav Bariyar</div>
                  <div className="hc-tag">B.Tech Student • Founder Listener</div>
                </div>
              </div>
              <div className="hc-quote">"I built Solace because students often carry emotional pressure silently. Sometimes people don't need advice — they just need space to breathe and talk honestly."</div>
              <div className="hc-meta">
                <div className="hc-chip">Academic burnout</div>
                <div className="hc-chip">Overthinking</div>
                <div className="hc-chip">Loneliness</div>
              </div>
            </div>

            <div className="hero-stat-row">
              <div className="stat-pill">
                <span className="stat-num">2,400+</span>
                <div className="stat-label">Sessions</div>
              </div>
              <div className="stat-pill">
                <span className="stat-num">98%</span>
                <div className="stat-label">Rating</div>
              </div>
              <div className="stat-pill">
                <span className="stat-num">48</span>
                <div className="stat-label">Listeners</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section style={{ background: 'var(--surface2)', padding: '40px 5%', textAlign: 'center', borderY: '1px solid var(--border)' }}>
        <p style={{ fontSize: '13px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>Trusted by students from across campus</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', opacity: 0.5, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: '600', fontSize: '18px' }}>UNIVERSITY MEDICAL</div>
          <div style={{ fontWeight: '600', fontSize: '18px' }}>PSYCH SOCIETY</div>
          <div style={{ fontWeight: '600', fontSize: '18px' }}>STUDENT COUNCIL</div>
          <div style={{ fontWeight: '600', fontSize: '18px' }}>WELLNESS HUB</div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section" id="how-section">
        <div className="section-header">
          <div className="section-label">The Process</div>
          <div className="section-title">Simple, safe, and built for students</div>
          <div className="section-sub">From booking to session in under 2 minutes. No long waitlists or complex forms.</div>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">1</div>
            <h3>Choose your session</h3>
            <p>Pick the type of conversation that feels right — a quick vent, a deeper talk, or a guided reflection.</p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <h3>Pick a time that works</h3>
            <p>Browse real-time availability. Sessions happen on Google Meet — no extra downloads needed.</p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <h3>Talk. Reflect. Continue.</h3>
            <p>After your session, receive a private AI reflection to help you process your thoughts. Everything stays private.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="wellness-grid">
          <div className="wellness-features">
            <div className="section-label" style={{ textAlign: 'left' }}>Why Solace?</div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '40px' }}>Designed for your peace of mind</h2>
            
            <div className="wf-item">
              <div className="wf-icon">🔒</div>
              <div className="wf-text">
                <h4>Complete Anonymity</h4>
                <p>We don't need your full name or ID. Use an alias if it makes you feel more comfortable.</p>
              </div>
            </div>

            <div className="wf-item">
              <div className="wf-icon">🎓</div>
              <div className="wf-text">
                <h4>Peer Expertise</h4>
                <p>Our listeners are students too. They understand the pressure because they're living it.</p>
              </div>
            </div>

            <div className="wf-item">
              <div className="wf-icon">✨</div>
              <div className="wf-text">
                <h4>AI Insights</h4>
                <p>Receive a private, automated summary of your session to help you track your emotional growth.</p>
              </div>
            </div>
          </div>

          <div className="wellness-visual">
            <div className="mood-tracker">
              <div className="mood-label">How are you feeling right now?</div>
              <div className="mood-row">
                {['😔', '😕', '😐', '🙂', '✨'].map(mood => (
                  <div 
                    key={mood} 
                    className={`mood-dot ${selectedMood === mood ? 'selected' : ''}`}
                    onClick={() => handleMoodClick(mood)}
                    style={{ cursor: 'pointer' }}
                  >
                    {mood}
                  </div>
                ))}
              </div>
            </div>
            <div className="journal-preview">
              <div className="jp-title">Quick wellness log</div>
              <div className="jp-text">
                {selectedMood === '😔' ? "It's okay to have rough days. Sharing your thoughts can help lighten the load." :
                 selectedMood === '😐' ? "Steady and calm. A good time to reflect on your small wins today." :
                 selectedMood === '✨' ? "You're glowing! Capture this energy in your journal to look back on later." :
                 "Your thoughts matter. Taking a moment to check in with yourself is a win."}
              </div>
              <div 
                className="jp-prompt" 
                onClick={handleContinueWriting}
                style={{ cursor: 'pointer', display: 'inline-block' }}
              >
                Continue writing in journal →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '100px 5%', 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, var(--accent) 0%, #3A6B5E 100%)', 
        color: '#fff',
        margin: '80px 5%',
        borderRadius: '32px'
      }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '42px', marginBottom: '20px' }}>Ready to be heard?</h2>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
          Take the first step towards a calmer mind. Join 2,000+ students who use Solace every month.
        </p>
        <Link href="/booking" className="btn-primary" style={{ 
          background: '#fff', 
          color: 'var(--accent)', 
          textDecoration: 'none',
          padding: '18px 40px',
          fontSize: '16px'
        }}>
          Book your first session
        </Link>
      </section>

      <Footer />
    </main>
  );
}
