'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ 
    users: 0, 
    sessions: 0, 
    revenue: 0,
    commission: 0,
    payouts: 0,
    pending: 0,
    refunds: 0
  });
  const [bookings, setBookings] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockTime, setNewBlockTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [listeners, setListeners] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userRole === 'admin') {
        fetchAdminData();
      } else if (userRole === 'student') {
        router.push('/dashboard');
      }
    }
  }, [user, userRole, loading]);

  const fetchAdminData = async () => {
    console.log('📡 Admin: Fetching data...');
    setIsLoading(true);
    try {
      const [
        u,
        sCount,
        pRes,
        bRes,
        blRes,
        lRes,
        rRes,
        aRes
      ] = await Promise.allSettled([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('sessions').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*'),
        supabase.from('sessions').select(`*, student:student_id(full_name, email), listener:listener_id(users(full_name))`).order('scheduled_at', { ascending: false }),
        supabase.from('blocked_slots').select('*').order('date', { ascending: true }),
        supabase.from('users').select('id, full_name').eq('role', 'admin'),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('admin_activity_log').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      console.log('📊 Admin: Fetch complete, processing results...');

      // Stats processing with explicit null/undefined handling
      const userCount = u.status === 'fulfilled' ? (u.value.count ?? 0) : 0;
      const sessionCount = sCount.status === 'fulfilled' ? (sCount.value.count ?? 0) : 0;
      
      const payments = pRes.status === 'fulfilled' ? (pRes.value.data || []) : [];
      const totalRevenue = payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
      const totalCommission = payments.reduce((acc, curr) => acc + Number(curr.commission_amount || (curr.amount * 0.1)), 0);
      const totalPayouts = payments.filter(p => p.payout_status === 'paid').reduce((acc, curr) => acc + Number(curr.amount - (curr.commission_amount || curr.amount * 0.1)), 0);
      const pendingSettlements = payments.filter(p => p.payout_status === 'pending').reduce((acc, curr) => acc + Number(curr.amount - (curr.commission_amount || curr.amount * 0.1)), 0);
      const refunds = payments.filter(p => p.status === 'refunded').reduce((acc, curr) => acc + Number(curr.amount), 0);

      setStats({ 
        users: Number(userCount), 
        sessions: Number(sessionCount), 
        revenue: Number(totalRevenue),
        commission: Number(totalCommission),
        payouts: Number(totalPayouts),
        pending: Number(pendingSettlements),
        refunds: Number(refunds)
      });

      // Table data
      if (bRes.status === 'fulfilled') setBookings(bRes.value.data || []);
      if (blRes.status === 'fulfilled') setBlockedSlots(blRes.value.data || []);
      if (lRes.status === 'fulfilled') setListeners(lRes.value.data || []);
      if (rRes.status === 'fulfilled') setReviews(rRes.value.data || []);
      if (aRes.status === 'fulfilled') setActivityLogs(aRes.value.data || []);

      const resultsArray = [u, sCount, pRes, bRes, blRes, lRes, rRes, aRes];
      if (resultsArray.some(r => r.status === 'rejected')) {
        console.warn('⚠️ Admin: Some data failed to load');
      }

    } catch (error) {
      console.error('❌ Admin: Critical Fetch Error:', error);
    } finally {
      setIsLoading(false);
      console.log('🏁 Admin: Loading complete');
    }
  };

  const handleUpdateStatus = async (sessionId, newStatus) => {
    const { error } = await supabase.from('sessions').update({ status: newStatus }).eq('id', sessionId);
    if (!error) {
      fetchAdminData();
    } else {
      alert('Error updating status: ' + error.message);
    }
  };

  const handleAssignListener = async (session, listenerId) => {
    const { error } = await supabase.from('sessions').update({ 
      listener_id: listenerId,
      status: 'assigned' 
    }).eq('id', session.id);
    
    if (!error) {
      fetchAdminData();
      
      // Send Assignment Email
      try {
        const { sendEmail } = await import('@/lib/email-client');
        const { getListenerAssignedTemplate } = await import('@/lib/email-templates');
        const assignedListener = listeners.find(l => l.id === listenerId);
        
        sendEmail({
          to: session.student?.email || '',
          subject: 'Your Solace Listener has been Assigned!',
          html: getListenerAssignedTemplate(
            session.student?.full_name || 'Student',
            assignedListener?.full_name || 'Peer Listener',
            new Date(session.scheduled_at).toLocaleDateString(),
            new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          )
        });
      } catch (e) {
        console.error('Assignment Email Error:', e);
      }
    } else {
      alert('Error assigning listener: ' + error.message);
    }
  };

  const generateReflection = async (sessionId, studentId) => {
    const reflectionText = "You showed great resilience today. We discussed your academic pressures and explored some grounding techniques. Remember to take small breaks.";
    const { error } = await supabase.from('ai_reflections').insert([{
      user_id: studentId,
      session_id: sessionId,
      reflection_text: reflectionText
    }]);

    if (!error) {
      await handleUpdateStatus(sessionId, 'reflected');
      alert('AI Reflection generated and sent to student!');
    }
  };

  const handleCancelSession = async (session) => {
    if (!window.confirm('Are you sure you want to cancel this session? This will notify the student.')) return;
    
    const { error } = await supabase.from('sessions').update({ status: 'cancelled' }).eq('id', session.id);
    if (!error) {
      fetchAdminData();
      
      // Send Cancellation Email
      try {
        const { sendEmail } = await import('@/lib/email-client');
        const { getCancellationTemplate } = await import('@/lib/email-templates');
        
        sendEmail({
          to: session.student?.email || '',
          subject: 'Session Cancellation Notice - Solace',
          html: getCancellationTemplate(session.student?.full_name || 'Student', new Date(session.scheduled_at).toLocaleDateString())
        });
      } catch (e) { 
        console.error('Cancellation Email Error:', e); 
      }
    } else {
      alert('Error cancelling session: ' + error.message);
    }
  };

  const handleBlockSlot = async () => {
    if (!newBlockDate || !newBlockTime) return;
    const { error } = await supabase.from('blocked_slots').insert([{ date: newBlockDate, time: newBlockTime }]);
    if (!error) {
      setNewBlockDate('');
      setNewBlockTime('');
      fetchAdminData();
    }
  };

  const handleUnblockSlot = async (id) => {
    const { error } = await supabase.from('blocked_slots').delete().eq('id', id);
    if (!error) fetchAdminData();
  };

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Admin Panel...</div>;

  const tabs = [
    { id: 'overview', label: 'Platform Overview', icon: '📈' },
    { id: 'bookings', label: 'All Bookings', icon: '🗓️' },
    { id: 'finances', label: 'Financial Hub', icon: '💰' },
    { id: 'activity', label: 'Live Activity', icon: '⚡' },
{ id: 'availability', label: 'Manage Slots', icon: '🚫' },
    { id: 'reviews', label: 'Student Reviews', icon: '⭐' },
  ];

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      {/* MOBILE HAMBURGER */}
      {isMobile && (
        <div 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ 
            position: 'fixed', 
            bottom: '30px', 
            right: '30px', 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'var(--accent)', 
            color: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '24px', 
            boxShadow: '0 8px 32px rgba(81, 124, 113, 0.4)',
            zIndex: 1000,
            cursor: 'pointer'
          }}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </div>
      )}

      <div className="admin-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 72px)', maxWidth: '1600px', margin: '0 auto', position: 'relative' }}>
        
        {/* SIDEBAR */}
        <motion.aside 
          initial={false}
          animate={{ 
            x: isMobile ? (isSidebarOpen ? 0 : -300) : 0,
            opacity: 1
          }}
          style={{ 
            width: '300px', 
            minWidth: '300px', 
            flexShrink: 0, 
            background: 'var(--surface)', 
            borderRight: '1px solid var(--border)', 
            padding: '40px 24px', 
            display: 'flex', 
            flexDirection: 'column',
            position: isMobile ? 'fixed' : 'sticky',
            top: '72px',
            height: 'calc(100vh - 72px)',
            zIndex: 900,
            boxShadow: isMobile ? '20px 0 60px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          <div style={{ padding: '0 12px', marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>
              Solace <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Pro</span>
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Operational Dashboard
            </p>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tabs.map(tab => (
              <motion.div 
                key={tab.id} 
                whileHover={{ x: 4 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                style={{ 
                  padding: '14px 20px', 
                  borderRadius: '16px', 
                  cursor: 'pointer', 
                  background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : 'var(--text2)',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: activeTab === tab.id ? '0 8px 16px rgba(81, 124, 113, 0.2)' : 'none'
                }}
              >
                <span style={{ fontSize: '20px', opacity: activeTab === tab.id ? 1 : 0.7 }}>{tab.icon}</span> 
                {tab.label}
              </motion.div>
            ))}
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
            System Live • v2.5.0
          </div>
        </motion.aside>

        {/* MOBILE OVERLAY */}
        {isMobile && isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 850 }}
          ></div>
        )}
        {/* MAIN CONTENT */}
        <section style={{ 
          flex: 1, 
          padding: isMobile ? '30px 20px' : '50px 80px', 
          overflowY: 'auto',
          width: '100%'
        }}>
          {activeTab === 'overview' && (
            <div className="fadeIn">
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: '36px', marginBottom: '40px', color: 'var(--text)' }}>Platform Performance</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                  <div style={{ color: 'var(--text3)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Total Users</div>
                  <div style={{ fontSize: '40px', fontWeight: '700', color: 'var(--text)', fontFamily: 'var(--serif)' }}>{stats.users}</div>
                  <div style={{ fontSize: '12px', color: '#10B981', marginTop: '8px' }}>↑ 3 new today</div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                  <div style={{ color: 'var(--text3)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Sessions Booked</div>
                  <div style={{ fontSize: '40px', fontWeight: '700', color: 'var(--text)', fontFamily: 'var(--serif)' }}>{stats.sessions}</div>
                  <div style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '8px' }}>5 upcoming this week</div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                  <div style={{ color: 'var(--text3)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Gross Revenue</div>
                  <div style={{ fontSize: '40px', fontWeight: '700', color: 'var(--text)', fontFamily: 'var(--serif)' }}>₹{stats.revenue}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '8px' }}>Net: ₹{stats.revenue - stats.refunds}</div>
                </div>
              </div>

              {/* RECENT ACTIVITY PREVIEW */}
              <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', fontFamily: 'var(--serif)' }}>Live Operational Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activityLogs.slice(0, 5).map(log => (
                    <div key={log.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{log.action}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{log.details}</div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{new Date(log.created_at).toLocaleTimeString()}</div>
                    </div>
                  ))}
                  {activityLogs.length === 0 && <p style={{ color: 'var(--text3)', textAlign: 'center' }}>No recent activity.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finances' && (
            <div className="fadeIn">
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: '36px', marginBottom: '40px', color: 'var(--text)' }}>Financial Command</h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <div style={{ background: 'var(--accent)', color: '#fff', padding: '32px', borderRadius: '24px' }}>
                  <div style={{ opacity: 0.8, fontSize: '12px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', marginBottom: '12px' }}>Platform Commission</div>
                  <div style={{ fontSize: '40px', fontWeight: '700', fontFamily: 'var(--serif)' }}>₹{stats.commission}</div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--text3)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', marginBottom: '12px' }}>Total Payouts</div>
                  <div style={{ fontSize: '40px', fontWeight: '700', color: 'var(--text)', fontFamily: 'var(--serif)' }}>₹{stats.payouts}</div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--text3)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', marginBottom: '12px' }}>Pending Settlements</div>
                  <div style={{ fontSize: '40px', fontWeight: '700', color: 'var(--text)', fontFamily: 'var(--serif)' }}>₹{stats.pending}</div>
                </div>
              </div>

              <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Revenue Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#fff', borderRadius: '12px' }}>
                    <span>Gross Sales</span>
                    <span style={{ fontWeight: '700' }}>₹{stats.revenue}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#fff', borderRadius: '12px' }}>
                    <span>Total Refunds</span>
                    <span style={{ fontWeight: '700', color: '#DC2626' }}>-₹{stats.refunds}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="fadeIn">
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: '36px', marginBottom: '40px', color: 'var(--text)' }}>System Activity Log</h1>
              <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {activityLogs.map((log, index) => (
                  <div key={log.id} style={{ 
                    padding: '20px 32px', 
                    borderBottom: index === activityLogs.length - 1 ? 'none' : '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      {log.action.includes('User') ? '👤' : log.action.includes('Payment') ? '💰' : '⚡'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: 'var(--text)' }}>{log.action}</div>
                      <div style={{ color: 'var(--text3)', fontSize: '13px' }}>{log.details}</div>
                    </div>
                    <div style={{ color: 'var(--text3)', fontSize: '12px' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="fadeIn">
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: '36px', marginBottom: '40px', color: 'var(--text)' }}>Global Bookings</h1>
              <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', overflowX: 'auto', boxShadow: 'var(--card-shadow)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead style={{ background: 'var(--surface2)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <tr>
                      <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Student</th>
                      <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Listener</th>
                      <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Date / Time</th>
                      <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No bookings found.</td></tr>
                    ) : (
                      bookings.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '20px 24px', color: 'var(--text)', fontWeight: '500' }}>
                            {b.student?.full_name}
                            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '400' }}>{b.format} • {b.duration}m</div>
                          </td>
                          <td style={{ padding: '20px 24px', color: 'var(--text2)' }}>
                            {b.status === 'confirmed' ? (
                              <select 
                                onChange={(e) => handleAssignListener(b, e.target.value)}
                                style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                                defaultValue=""
                              >
                                <option value="" disabled>Assign Listener...</option>
                                {listeners.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
                              </select>
                            ) : (
                              b.listener?.users?.full_name || <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Pending...</span>
                            )}
                          </td>
                          <td style={{ padding: '20px 24px', color: 'var(--text2)' }}>
                            <div style={{ fontSize: '13px' }}>{new Date(b.scheduled_at).toLocaleDateString()}</div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>{new Date(b.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ 
                                padding: '6px 12px', 
                                borderRadius: '50px', 
                                fontSize: '11px', 
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                background: b.status === 'booked' ? '#E0F2FE' : 
                                            b.status === 'confirmed' ? '#FEF3C7' :
                                            b.status === 'assigned' ? '#F3E8FF' :
                                            b.status === 'started' ? '#DBEAFE' :
                                            b.status === 'completed' ? '#D1FAE5' : 
                                            b.status === 'reflected' ? '#ECFDF5' : '#F3F4F6', 
                                color:      b.status === 'booked' ? '#0369A1' : 
                                            b.status === 'confirmed' ? '#92400E' :
                                            b.status === 'assigned' ? '#6B21A8' :
                                            b.status === 'started' ? '#1E40AF' :
                                            b.status === 'completed' ? '#065F46' : 
                                            b.status === 'reflected' ? '#059669' : '#374151' 
                              }}>
                                {b.status.replace('_', ' ')}
                              </span>

                              {/* Action Buttons based on status */}
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {b.status === 'booked' && (
                                  <button onClick={() => handleUpdateStatus(b.id, 'confirmed')} style={{ padding: '4px 8px', fontSize: '10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Confirm</button>
                                )}
                                {b.status === 'assigned' && (
                                  <button onClick={() => handleUpdateStatus(b.id, 'started')} style={{ padding: '4px 8px', fontSize: '10px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Start</button>
                                )}
                                {b.status === 'started' && (
                                  <button onClick={() => handleUpdateStatus(b.id, 'completed')} style={{ padding: '4px 8px', fontSize: '10px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Complete</button>
                                )}
                                {b.status === 'completed' && (
                                  <button onClick={() => generateReflection(b.id, b.student_id)} style={{ padding: '4px 8px', fontSize: '10px', background: 'var(--text)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reflect ✨</button>
                                )}
                                {['booked', 'confirmed', 'assigned'].includes(b.status) && (
                                  <button onClick={() => handleCancelSession(b)} style={{ padding: '4px 8px', fontSize: '10px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="fadeIn">
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: '36px', marginBottom: '40px', color: 'var(--text)' }}>Manage Slot Availability</h1>
              
              <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', marginBottom: '40px', boxShadow: 'var(--card-shadow)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: 'var(--text)' }}>Block a New Time Slot</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <input type="date" value={newBlockDate} onChange={e => setNewBlockDate(e.target.value)} style={{ flex: 1, minWidth: '200px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#fff', fontSize: '15px' }} />
                  <select value={newBlockTime} onChange={e => setNewBlockTime(e.target.value)} style={{ flex: 1, minWidth: '200px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#fff', fontSize: '15px' }}>
                    <option value="">Select Time</option>
                    {['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '4:30 PM', '6:00 PM', '7:30 PM', '9:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button 
                    onClick={handleBlockSlot} 
                    style={{ 
                      background: 'var(--accent)', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '0 32px', 
                      borderRadius: '12px', 
                      cursor: 'pointer', 
                      fontWeight: '600',
                      fontSize: '15px',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Block Slot
                  </button>
                </div>
              </div>

              <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', overflowX: 'auto', boxShadow: 'var(--card-shadow)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead style={{ background: 'var(--surface2)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <tr>
                      <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
                      <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Time</th>
                      <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedSlots.length === 0 ? (
                      <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No slots are currently blocked.</td></tr>
                    ) : (
                      blockedSlots.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '20px 24px', color: 'var(--text)', fontWeight: '500' }}>{new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td style={{ padding: '20px 24px', color: 'var(--text2)' }}>{s.time}</td>
                          <td style={{ padding: '20px 24px' }}>
                            <button 
                              onClick={() => handleUnblockSlot(s.id)} 
                              style={{ color: '#DC2626', background: '#FEE2E2', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', transition: 'all 0.2s' }}
                              onMouseOver={e => e.currentTarget.style.background = '#FCA5A5'}
                              onMouseOut={e => e.currentTarget.style.background = '#FEE2E2'}
                            >
                              Unblock
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="fadeIn">
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: '36px', marginBottom: '40px', color: 'var(--text)' }}>Student Feedback</h1>
              <div style={{ display: 'grid', gap: '20px' }}>
                {reviews.length === 0 ? (
                  <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text3)' }}>No reviews yet.</div>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '16px' }}>{r.full_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                        <div style={{ fontSize: '20px' }}>
                          {'⭐'.repeat(r.rating)}
                        </div>
                      </div>
                      <p style={{ color: 'var(--text2)', fontSize: '14px', lineHeight: '1.6' }}>"{r.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}
