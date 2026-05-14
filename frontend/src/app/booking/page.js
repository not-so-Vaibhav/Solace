'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [format, setFormat] = useState(null);
  const [duration, setDuration] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState([]);

  const { user } = useAuth();
  const router = useRouter();
  const platformFee = 19;

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    fetchBlockedSlots();
  }, [selectedDate]);

  const fetchBlockedSlots = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const { data } = await supabase.from('blocked_slots').select('time').eq('date', dateStr);
    setBlockedSlots(data?.map(s => s.time) || []);
  };

  const formats = [
    { id: 'chat', label: 'Chat Session', icon: '💬', sub: 'Instant messaging support' },
    { id: 'meet', label: 'Google Meet Session', icon: '📹', sub: 'Face-to-face video call' },
    { id: 'inperson', label: 'In-Person Conversation', icon: '🤝', sub: 'Face-to-face on campus' },
  ];

  const pricing = {
    chat: { quick: 99, deep: 199 },
    meet: { quick: 149, deep: 299 },
    inperson: { quick: 199, deep: 399 },
  };

  const durations = [
    { id: 'quick', label: 'Quick Vent', time: '25 min', sub: 'Perfect for a quick vent' },
    { id: 'deep', label: 'Deep Talk', time: '50 min', sub: 'For deeper exploration' },
  ];

  const timeSlots = [
    '9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM',
    '4:30 PM', '6:00 PM', '7:30 PM', '9:00 PM'
  ];

  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const handleFormatSelect = (id) => { setFormat(id); setStep(2); };
  const handleDurationSelect = (id) => { setDuration(id); setStep(3); };
  const handleTimeSelect = (time) => { setSelectedTime(time); setStep(4); };
  const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const subtotal = format && duration ? pricing[format][duration] : 0;
  const total = subtotal + platformFee;

  const handlePayment = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });
      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Solace Platform',
        description: `${durations.find(d => d.id === duration)?.label} Session`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const scheduledAt = new Date(selectedDate);
            const [time, period] = selectedTime.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            scheduledAt.setHours(hours, minutes, 0, 0);

            const { data: session, error: sessionErr } = await supabase.from('sessions').insert([{
              student_id: user.id,
              listener_id: null,
              format: format,
              scheduled_at: scheduledAt.toISOString(),
              status: 'booked',
              duration: duration === 'quick' ? 25 : 50
            }]).select().single();

            if (sessionErr) throw sessionErr;

            await supabase.from('payments').insert([{
              user_id: user.id,
              session_id: session.id,
              amount: total,
              provider: 'razorpay',
              provider_payment_id: response.razorpay_payment_id,
              status: 'completed'
            }]);

            try {
              const { sendEmail } = await import('@/lib/email-client');
              const { getBookingConfirmationTemplate, getPaymentReceiptTemplate } = await import('@/lib/email-templates');
              
              const dateStr = new Date(scheduledAt).toLocaleDateString();
              const timeStr = new Date(scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              sendEmail({
                to: user.email,
                subject: 'Your Solace Session is Booked!',
                html: getBookingConfirmationTemplate(user.user_metadata?.full_name || 'Student', dateStr, timeStr, total)
              });

              sendEmail({
                to: user.email,
                subject: 'Payment Receipt - Solace',
                html: getPaymentReceiptTemplate(user.user_metadata?.full_name || 'Student', total, response.razorpay_payment_id)
              });
            } catch (emailErr) {
              console.error('Post-booking Email Error:', emailErr);
            }

            router.push('/dashboard');
          } catch (err) {
            console.error('CRITICAL Fulfillment Error:', err);
            alert(`Payment successful, but we encountered an error: ${err.message || 'Unknown Error'}`);
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
        },
        theme: { color: '#517C71' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main>
      <Navbar />
      <motion.div 
        className="booking-wrap" 
        style={{ minHeight: '80vh', padding: '60px 5%' }}
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* HEADER */}
        <motion.div variants={fadeInUp} className="booking-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '42px', marginBottom: '16px' }}>Book a Session</h2>
          <div className="step-indicator" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {[1, 2, 3, 4].map(s => (
              <motion.div 
                key={s} 
                animate={{ 
                  background: step >= s ? 'var(--accent)' : 'var(--border)',
                  scaleX: step === s ? 1.2 : 1
                }}
                style={{ width: '40px', height: '4px', borderRadius: '2px' }}
              ></motion.div>
            ))}
          </div>
          <p style={{ marginTop: '20px', color: 'var(--text3)', fontSize: '14px' }}>
            Step {step} of 4 — {step === 1 ? 'Choose Format' : step === 2 ? 'Choose Duration' : step === 3 ? 'Select Date & Time' : 'Review & Payment'}
          </p>
        </motion.div>

        <div className="booking-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            {/* STEP 1: FORMAT */}
            {step === 1 && (
              <motion.div 
                key="step1"
                className="format-grid"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {formats.map(f => (
                  <motion.div 
                    key={f.id} 
                    variants={fadeInUp}
                    className="booking-opt-card" 
                    onClick={() => handleFormatSelect(f.id)} 
                    style={{ 
                      background: 'var(--surface)', 
                      padding: '48px 24px', 
                      borderRadius: '24px', 
                      border: '1px solid var(--border)', 
                      cursor: 'pointer', 
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '280px',
                    }}
                    whileHover={{ y: -8, borderColor: 'var(--accent)', boxShadow: 'var(--card-shadow-hover)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div 
                      style={{ fontSize: '56px', marginBottom: '24px' }}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {f.icon}
                    </motion.div>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: '22px', marginBottom: '10px' }}>{f.label}</h3>
                    <p style={{ color: 'var(--text3)', fontSize: '15px', lineHeight: '1.6' }}>{f.sub}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* STEP 2: DURATION */}
            {step === 2 && (
              <motion.div 
                key="step2"
                className="duration-selection"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <motion.button 
                  whileHover={{ x: -5 }}
                  onClick={() => setStep(1)} 
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginBottom: '30px', fontSize: '14px', fontWeight: '500' }}
                >
                  ← Change Format
                </motion.button>
                <motion.div 
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                  variants={staggerContainer}
                >
                  {durations.map(d => (
                    <motion.div 
                      key={d.id} 
                      variants={fadeInUp}
                      className="booking-opt-wide" 
                      onClick={() => handleDurationSelect(d.id)} 
                      style={{ 
                        background: 'var(--surface)', 
                        padding: '24px 32px', 
                        borderRadius: '20px', 
                        border: '1px solid var(--border)', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}
                      whileHover={{ x: 10, borderColor: 'var(--accent)' }}
                    >
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{d.label} ({d.time})</h3>
                        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>{d.sub}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)' }}>₹{pricing[format][d.id]}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* STEP 3: DATE & TIME */}
            {step === 3 && (
              <motion.div 
                key="step3"
                className="datetime-selection" 
                style={{ background: 'var(--surface)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)' }}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginBottom: '30px', fontSize: '14px', fontWeight: '500' }}>← Back to Duration</button>
                
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px', color: 'var(--text3)' }}>Select a Date</h3>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowFullCalendar(true)} 
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      📅 Full Calendar
                    </motion.button>
                  </div>
                  <div className="date-strip" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '15px' }}>
                    {getDates().map((date, i) => (
                      <motion.div 
                        key={i} 
                        className={`date-chip ${selectedDate.toDateString() === date.toDateString() ? 'selected' : ''}`} 
                        onClick={() => setSelectedDate(date)} 
                        style={{ 
                          minWidth: '80px', 
                          padding: '16px 12px', 
                          borderRadius: '16px', 
                          border: '1px solid var(--border)', 
                          textAlign: 'center', 
                          cursor: 'pointer', 
                          background: selectedDate.toDateString() === date.toDateString() ? 'var(--accent)' : 'transparent', 
                          color: selectedDate.toDateString() === date.toDateString() ? '#fff' : 'var(--text)' 
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div style={{ fontSize: '20px', fontWeight: '700', margin: '4px 0' }}>{date.getDate()}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {showFullCalendar && (
                    <motion.div 
                      className="calendar-modal-overlay" 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <motion.div 
                        className="calendar-modal" 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        style={{ background: '#fff', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '400px' }}
                      >
                        <h4 style={{ marginBottom: '16px' }}>Pick a custom date</h4>
                        <input type="date" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} onChange={(e) => { setSelectedDate(new Date(e.target.value)); setShowFullCalendar(false); }} />
                        <button onClick={() => setShowFullCalendar(false)} style={{ width: '100%', marginTop: '16px', padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--surface2)', cursor: 'pointer' }}>Cancel</button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <h3 style={{ textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px', color: 'var(--text3)', marginBottom: '20px' }}>Select a Time Slot</h3>
                  <motion.div 
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {timeSlots.map(time => {
                      const isBlocked = blockedSlots.includes(time);
                      return (
                        <motion.div 
                          key={time} 
                          variants={fadeInUp}
                          onClick={() => !isBlocked && handleTimeSelect(time)} 
                          style={{ 
                            padding: '20px', 
                            borderRadius: '12px', 
                            border: '1px solid var(--border)', 
                            textAlign: 'center', 
                            cursor: isBlocked ? 'not-allowed' : 'pointer',
                            opacity: isBlocked ? 0.4 : 1,
                            background: isBlocked ? '#F3F4F6' : '#fff'
                          }}
                          whileHover={!isBlocked ? { y: -5, borderColor: 'var(--accent)', background: 'var(--accent-light)' } : {}}
                          whileTap={!isBlocked ? { scale: 0.95 } : {}}
                        >
                          <div style={{ fontSize: '16px', fontWeight: '600' }}>{time}</div>
                          {isBlocked && <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>UNAVAILABLE</div>}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: REVIEW & PAYMENT */}
            {step === 4 && (
              <motion.div 
                key="step4"
                className="receipt-container" 
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="receipt-card" style={{ background: '#F7F5F2', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #E5E1DA' }}>
                    <span style={{ color: 'var(--text3)' }}>Session type</span>
                    <span style={{ fontWeight: '500' }}>{durations.find(d => d.id === duration)?.label} — {pricing[format][duration] === 99 || pricing[format][duration] === 149 || pricing[format][duration] === 199 ? '25 min' : '50 min'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #E5E1DA' }}>
                    <span style={{ color: 'var(--text3)' }}>Date & time</span>
                    <span style={{ fontWeight: '500' }}>{formatDate(selectedDate)} • {selectedTime} IST</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #E5E1DA' }}>
                    <span style={{ color: 'var(--text3)' }}>Listener</span>
                    <span style={{ fontWeight: '500' }}>Auto-matched</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #E5E1DA' }}>
                    <span style={{ color: 'var(--text3)' }}>Platform fee</span>
                    <span style={{ fontWeight: '500' }}>₹{platformFee}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 0 0', marginTop: '12px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '600' }}>Total</span>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)' }}>₹{total}</span>
                  </div>
                </div>

                <div className="payment-card" style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <h4 style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', color: 'var(--text3)', marginBottom: '16px' }}>Secure Payment via Razorpay</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '32px' }}>Your payment is processed securely. Sessions are non-refundable after 2 hours of booking.</p>
                  
                  <motion.button 
                    className="btn-primary" 
                    disabled={isProcessing}
                    style={{ width: '100%', maxWidth: '500px', padding: '18px', fontSize: '16px', fontWeight: '600', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={handlePayment}
                    whileHover={{ scale: 1.02, background: '#3D5F57' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing ? (
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', width: '24px', height: '24px' }}
                      />
                    ) : `Pay ₹${total} securely →`}
                  </motion.button>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '32px' }}>
                    {['UPI', 'Cards', 'Net Banking', 'Wallets'].map(method => (
                      <div key={method} style={{ fontSize: '10px', color: 'var(--text3)', padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '6px' }}>{method}</div>
                    ))}
                  </div>
                </div>

                <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>← Back</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <Footer />
      <style jsx>{`
        .btn-primary { background: #517C71; color: white; border: none; border-radius: 50px; cursor: pointer; transition: all 0.3s; }
        .btn-primary:disabled { background: #A8C4BC; cursor: not-allowed; }
        .format-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }
        .date-strip::-webkit-scrollbar { display: none; }
        .date-strip { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
