'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const [selectedMood, setSelectedMood] = useState('😐');
  const [stats, setStats] = useState({
    sessions: '2,400+',
    rating: '98%',
    listeners: '48'
  });
  const { user } = useAuth();
  const router = useRouter();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_platform_stats');
      if (error) throw error;
      
      const percentage = Math.round((data.average_rating || 5.0) * 20);
      
      setStats({
        sessions: `${data.session_count || 0}`,
        rating: `${percentage}%`,
        listeners: `${data.listener_count || 0}`
      });
    } catch (err) {
      console.error('Error fetching live stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    
    const reviewToSubmit = { ...newReview };
    setShowReviewForm(false);
    setShowSuccess(true); // Immediate assurance
    setNewReview({ rating: 5, comment: '' });

    try {
      const { error } = await supabase.from('reviews').insert([{
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Solace Student',
        rating: reviewToSubmit.rating,
        comment: reviewToSubmit.comment
      }]);
      if (error) throw error;
      await fetchStats();
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      console.error('Review submit error:', err);
      setShowSuccess(false);
      alert('Could not save review. Please try again.');
    }
  };

  const StarIcon = ({ filled, onClick }) => (
    <svg 
      onClick={onClick}
      width="24" height="24" viewBox="0 0 24 24" fill={filled ? "var(--accent)" : "none"} 
      stroke={filled ? "var(--accent)" : "var(--text3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  const scrollToHow = () => {
    const el = document.getElementById('how-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMoodClick = async (mood) => {
    setSelectedMood(mood);
    if (user) {
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
        <motion.div 
          style={{ position: 'relative', zIndex: 1 }}
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="hero-badge">Peer Support, Not Therapy</motion.div>
          <motion.h1 variants={fadeInUp}>You don't have to carry <em>everything</em> alone.</motion.h1>
          <motion.p variants={fadeInUp} className="hero-sub">A calm, private space to talk with trained student listeners — whenever you're feeling overwhelmed, burnt out, or just need to be heard.</motion.p>
          <motion.div variants={fadeInUp} className="hero-btns">
            <Link href="/booking" className="btn-primary" style={{ textDecoration: 'none' }}>Book a Session</Link>
            <button className="btn-secondary" onClick={scrollToHow}>How it works ↓</button>
          </motion.div>
          <motion.div variants={fadeInUp} className="hero-disclaimer" style={{ marginTop: '24px' }}>
            Solace is not a licensed therapy service. We are peer supporters, not medical or mental health professionals.
          </motion.div>
        </motion.div>

        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="hero-card-stack">
            <motion.div 
              className="hero-card featured"
              animate={{ 
                y: [0, -10, 0],
                rotate: [1, -1, 1]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
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
            </motion.div>

            <motion.div 
              className="hero-stat-row"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { num: stats.sessions, label: 'Sessions' },
                { num: stats.rating, label: 'Rating' },
                { num: stats.listeners, label: 'Listeners' }
              ].map((stat, i) => (
                <motion.div 
                   key={i} 
                   className="stat-pill"
                   variants={fadeInUp}
                   whileHover={{ y: -5, boxShadow: 'var(--card-shadow-hover)' }}
                >
                   <span className="stat-num">{stat.num}</span>
                   <div className="stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.button 
              variants={fadeInUp}
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn-primary"
              style={{ width: '100%', marginTop: '12px', fontSize: '14px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              Rate your experience
            </motion.button>

            {showReviewForm && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  background: 'var(--surface)', 
                  padding: '24px', 
                  borderRadius: '24px', 
                  border: '1px solid var(--border)',
                  marginTop: '20px',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                <form onSubmit={handleReviewSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', marginBottom: '12px', fontWeight: '600' }}>Your Rating</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <StarIcon 
                          key={star}
                          filled={newReview.rating >= star}
                          onClick={() => setNewReview({...newReview, rating: star})}
                        />
                      ))}
                    </div>
                  </div>
                  <textarea 
                    placeholder="Tell us about your experience..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface2)', minHeight: '80px', marginBottom: '16px', fontSize: '14px' }}
                    required
                  />
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
                      Post Review
                    </button>
                    <button type="button" onClick={() => setShowReviewForm(false)} style={{ background: 'none', border: 'none', fontSize: '14px', color: 'var(--text3)', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              </motion.div>
            )}

            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ 
                  background: '#ECFDF5', 
                  color: '#059669', 
                  padding: '12px 20px', 
                  borderRadius: '12px', 
                  marginTop: '16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid #10B98133'
                }}
              >
                ✨ Thank you! Your review has been submitted and the live rating updated.
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Trust Section */}
      <motion.section 
        style={{ background: 'var(--surface2)', padding: '40px 5%', textAlign: 'center', borderY: '1px solid var(--border)' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <p style={{ fontSize: '13px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>Trusted by students from across campus</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', opacity: 0.5, flexWrap: 'wrap' }}>
          {['UNIVERSITY MEDICAL', 'PSYCH SOCIETY', 'STUDENT COUNCIL', 'WELLNESS HUB'].map((logo, i) => (
            <motion.div 
              key={i} 
              style={{ fontWeight: '600', fontSize: '18px' }}
              whileHover={{ opacity: 1, scale: 1.1 }}
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works Section */}
      <section className="section" id="how-section">
        <motion.div 
          className="section-header"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="section-label">The Process</motion.div>
          <motion.div variants={fadeInUp} className="section-title">Simple, safe, and built for students</motion.div>
          <motion.div variants={fadeInUp} className="section-sub">From booking to session in under 2 minutes. No long waitlists or complex forms.</motion.div>
        </motion.div>
        
        <motion.div 
          className="steps-grid"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {[
            { num: 1, title: 'Choose your session', desc: 'Pick the type of conversation that feels right — a quick vent, a deeper talk, or a guided reflection.' },
            { num: 2, title: 'Pick a time that works', desc: 'Browse real-time availability. Sessions happen on Google Meet — no extra downloads needed.' },
            { num: 3, title: 'Talk. Reflect. Continue.', desc: 'After your session, receive a private AI reflection to help you process your thoughts. Everything stays private.' }
          ].map((step, i) => (
            <motion.div 
              key={i} 
              className="step-card"
              variants={fadeInUp}
              whileHover={{ y: -8, borderColor: 'var(--accent)' }}
            >
              <div className="step-num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="wellness-grid">
          <motion.div 
            className="wellness-features"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="section-label" style={{ textAlign: 'left' }}>Why Solace?</motion.div>
            <motion.h2 variants={fadeInUp} className="section-title" style={{ textAlign: 'left', marginBottom: '40px' }}>Designed for your peace of mind</motion.h2>
            
            {[
              { icon: '🔒', title: 'Complete Anonymity', desc: "We don't need your full name or ID. Use an alias if it makes you feel more comfortable." },
              { icon: '🎓', title: 'Peer Expertise', desc: "Our listeners are students too. They understand the pressure because they're living it." },
              { icon: '✨', title: 'AI Insights', desc: "Receive a private, automated summary of your session to help you track your emotional growth." }
            ].map((f, i) => (
              <motion.div key={i} className="wf-item" variants={fadeInUp}>
                <div className="wf-icon">{f.icon}</div>
                <div className="wf-text">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="wellness-visual"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mood-tracker">
              <div className="mood-label">How are you feeling right now?</div>
              <div className="mood-row">
                {['😔', '😕', '😐', '🙂', '✨'].map(mood => (
                  <motion.div 
                    key={mood} 
                    className={`mood-dot ${selectedMood === mood ? 'selected' : ''}`}
                    onClick={() => handleMoodClick(mood)}
                    style={{ cursor: 'pointer' }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {mood}
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div 
              className="journal-preview"
              key={selectedMood}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        style={{ 
          padding: '100px 5%', 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, var(--accent) 0%, #3A6B5E 100%)', 
          color: '#fff',
          margin: '80px 5%',
          borderRadius: '32px'
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '42px', marginBottom: '20px' }}>Ready to be heard?</h2>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
          Take the first step towards a calmer mind. Join 2,000+ students who use Solace every month.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/booking" className="btn-primary" style={{ 
            background: '#fff', 
            color: 'var(--accent)', 
            textDecoration: 'none',
            padding: '18px 40px',
            fontSize: '16px',
            display: 'inline-block'
          }}>
            Book your first session
          </Link>
        </motion.div>
      </motion.section>

      <Footer />
    </main>
  );
}
