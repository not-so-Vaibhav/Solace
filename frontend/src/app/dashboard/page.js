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

const sidebarVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ sessions: 0, credits: 0, mood: 84 });
  const [sessions, setSessions] = useState([]);
  const [journals, setJournals] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [newJournal, setNewJournal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingJournalId, setEditingJournalId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { user, userRole, loading, logout } = useAuth(); // Added logout
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchDashboardData();
      }
    }
  }, [user, userRole, loading]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    console.log('🚀 Starting parallel dashboard data fetch...');
    console.time('DashboardLoadTime');

    try {
      // Fetch profile first as it's critical for the greeting
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) setProfile(profileData);
      if (profileError) console.warn('Profile fetch note:', profileError.message);

      // Fetch everything else in parallel to maximize speed
      const results = await Promise.allSettled([
        supabase.from('sessions').select(`*, listener:listener_id (users (full_name))`).eq('student_id', user.id).order('scheduled_at', { ascending: false }),
        supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('ai_reflections').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('payments').select('amount').eq('user_id', user.id).eq('status', 'completed')
      ]);

      // Handle parallel results
      if (results[0].status === 'fulfilled' && results[0].value.data) {
        const sessionData = results[0].value.data;
        setSessions(sessionData);
        const completed = sessionData.filter(s => s.status === 'completed').length;
        setStats(prev => ({ ...prev, sessions: completed }));
      }

      if (results[1].status === 'fulfilled' && results[1].value.data) {
        setJournals(results[1].value.data);
      }

      if (results[2].status === 'fulfilled' && results[2].value.data) {
        setReflections(results[2].value.data);
      }

      if (results[3].status === 'fulfilled' && results[3].value.data) {
        const payments = results[3].value.data;
        const totalCredits = payments.reduce((acc, curr) => acc + Number(curr.amount), 0);
        setStats(prev => ({ ...prev, credits: totalCredits }));
      }

      // Log errors for failed parallel requests
      results.forEach((res, i) => {
        if (res.status === 'rejected') console.error(`Table ${i} fetch failed:`, res.reason);
      });

    } catch (error) {
      console.error('Critical dashboard fetch error:', error);
    } finally {
      console.timeEnd('DashboardLoadTime');
    }
  };

  const handleSaveJournal = async () => {
    if (!supabase) {
      alert("Supabase client not initialized. Check your environment variables.");
      return;
    }
    if (!user?.id) {
      alert("User session not found. Please log in again.");
      return;
    }
    if (!newJournal.trim()) return;
    
    setIsSaving(true);
    console.log('Initiating journal save for user:', user.id);
    
    // Safety timeout to prevent button getting stuck
    const timeout = setTimeout(() => {
      setIsSaving(false);
      console.error('Journal save timed out after 10s');
      alert('Save operation timed out. Please check your internet connection or if the table exists.');
    }, 10000);

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{ 
          user_id: user.id, 
          content: newJournal, 
          mood: 'Normal' 
        }])
        .select();

      clearTimeout(timeout);

      if (error) {
        console.error('Supabase Save Error:', error);
        alert(`Database Error (${error.code}): ${error.message}\n\nPlease ensure you have run the SQL query in Supabase.`);
      } else {
        console.log('Journal saved successfully:', data);
        setNewJournal('');
        await fetchDashboardData(); 
      }
    } catch (err) {
      clearTimeout(timeout);
      console.error('Unexpected Exception during save:', err);
      alert(`Unexpected Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size too large. Please choose an image under 2MB.');
      return;
    }

    // OPTIMISTIC UI: Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    const originalAvatar = profile?.avatar_url;
    setProfile(prev => ({ ...prev, avatar_url: previewUrl }));

    try {
      setIsSaving(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Final state update with permanent URL
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (error) {
      console.error('Avatar upload error:', error);
      // Rollback on error
      setProfile(prev => ({ ...prev, avatar_url: originalAvatar }));
    } finally {
      setIsSaving(false);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleDeleteJournal = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      const { error } = await supabase.from('journal_entries').delete().eq('id', id);
      if (error) throw error;
      await fetchDashboardData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleUpdateJournal = async (id) => {
    if (!editingContent.trim()) return;
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({ content: editingContent })
        .eq('id', id);
      if (error) throw error;
      setEditingJournalId(null);
      await fetchDashboardData();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleExportData = () => {
    console.log('📦 Generating data export...');
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Header for Journals
      csvContent += "--- WELLNESS JOURNALS ---\n";
      csvContent += "Date,Content\n";
      journals.forEach(j => {
        const date = new Date(j.created_at).toLocaleDateString();
        const cleanContent = j.content.replace(/,/g, " ").replace(/\n/g, " ");
        csvContent += `${date},"${cleanContent}"\n`;
      });

      // Header for Sessions
      csvContent += "\n--- MY SESSIONS ---\n";
      csvContent += "Date,Status,Listener\n";
      sessions.forEach(s => {
        const date = new Date(s.scheduled_at).toLocaleDateString();
        const listenerName = s.listener?.users?.full_name || 'Assigned Listener';
        csvContent += `${date},${s.status},"${listenerName}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `solace_data_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('✅ Export successful');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate export file.');
    }
  };

  console.log('Dashboard Auth State:', { loading, user: !!user, userRole, mounted });

  if (loading || !user) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#F7F5F2',
        gap: '20px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div className="loader"></div>
        <div style={{ color: 'var(--accent)', fontWeight: '600', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {loading ? 'Initializing Solace...' : 'Finalizing Session...'}
        </div>
        {!loading && !user && (
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => router.push('/login')}
            style={{ 
              marginTop: '10px',
              padding: '12px 24px',
              borderRadius: '50px',
              border: '1px solid var(--accent)',
              background: 'transparent',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Go to Login
          </motion.button>
        )}
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'sessions', label: 'My Sessions', icon: '💬' },
    { id: 'journal', label: 'Wellness Journal', icon: '📔' },
    { id: 'reflections', label: 'AI Reflections', icon: '✨' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <main>
      <Navbar />
      <div className="dash-layout">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                cursor: 'pointer',
                display: isMobile ? 'block' : 'none'
              }}
            />
          )}
        </AnimatePresence>

        {/* Mobile Toggle */}
        <div 
          className="mobile-toggle" 
          onClick={() => {
            console.log('Mobile menu toggled:', !isSidebarOpen);
            setIsSidebarOpen(!isSidebarOpen);
          }}
          style={{ pointerEvents: 'all' }}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </div>

        <motion.aside 
          className={`dash-sidebar ${isSidebarOpen ? 'open' : ''}`}
          initial={false}
          animate={{ 
            left: isMobile 
              ? (isSidebarOpen ? 0 : -280) 
              : 0 
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ 
            zIndex: 1001,
            background: '#fff',
            position: isMobile ? 'fixed' : 'sticky',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div className="sidebar-header mobile-only" style={{ padding: '24px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '28px', color: 'var(--text)', fontWeight: '700', fontFamily: 'var(--serif)' }}>Solace</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {tabs.map(tab => (
                <motion.div 
                  key={tab.id} 
                  className={`dash-nav-item ${activeTab === tab.id ? 'active' : ''}`} 
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  whileHover={{ background: activeTab === tab.id ? '#F9FAFB' : '#f3f4f6' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '16px 28px',
                    fontSize: '16px',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    color: activeTab === tab.id ? 'var(--accent)' : '#4B5563',
                    borderLeft: activeTab === tab.id ? '5px solid var(--accent)' : '5px solid transparent',
                    background: activeTab === tab.id ? '#F9FAFB' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderRadius: activeTab === tab.id ? '0 12px 12px 0' : '0',
                    pointerEvents: 'all'
                  }}
                >
                  <span style={{ fontSize: '22px', display: 'flex', alignItems: 'center' }}>{tab.icon}</span> 
                  <span>{tab.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
            <button 
              onClick={logout}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'transparent',
                border: '1px solid var(--border)',
                color: '#EF4444',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </motion.aside>

        <section className="dash-main">
          <motion.div 
            className="dash-greeting"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} />
              ) : (
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                  {(profile?.full_name || user?.email)?.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '32px' }}>Welcome back, {(profile?.full_name || user?.user_metadata?.full_name || 'Student').split(' ')[0]}</h2>
            </div>
          </motion.div>
          
          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                className="tab-content" 
                style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={staggerContainer}
              >
                {/* STATS ROW */}
                <motion.div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                  {[
                    { val: stats.sessions, label: 'Sessions Completed' },
                    { val: `${stats.mood}%`, label: 'Mood Stability' },
                    { val: `₹${stats.credits}`, label: 'Credits Remaining' }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      variants={fadeInUp}
                      style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}
                      whileHover={{ y: -5, boxShadow: 'var(--card-shadow-hover)' }}
                    >
                      <div style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'var(--serif)', color: 'var(--text)', marginBottom: '4px' }}>{stat.val}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '500' }}>{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* MAIN DASHBOARD GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', alignItems: 'start' }}>
                  
                  {/* LEFT COLUMN */}
                  <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} variants={staggerContainer}>
                    {/* Upcoming Session */}
                    <motion.div variants={fadeInUp} style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>Active Session Status</h3>
                        <motion.span 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          style={{ 
                            fontSize: '11px', 
                            padding: '6px 12px', 
                            borderRadius: '50px', 
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            background: sessions.find(s => ['booked', 'confirmed', 'assigned', 'started'].includes(s.status))?.status === 'booked' ? '#E0F2FE' : 
                                        sessions.find(s => ['booked', 'confirmed', 'assigned', 'started'].includes(s.status))?.status === 'confirmed' ? '#FEF3C7' :
                                        sessions.find(s => ['booked', 'confirmed', 'assigned', 'started'].includes(s.status))?.status === 'assigned' ? '#F3E8FF' :
                                        sessions.find(s => ['booked', 'confirmed', 'assigned', 'started'].includes(s.status))?.status === 'started' ? '#DBEAFE' : '#F3F4F6',
                            color:      sessions.find(s => ['booked', 'confirmed', 'assigned', 'started'].includes(s.status))?.status === 'booked' ? '#0369A1' : 
                                        sessions.find(s => ['booked', 'confirmed', 'assigned', 'started'].includes(s.status))?.status === 'confirmed' ? '#92400E' :
                                        sessions.find(s => ['booked', 'confirmed', 'assigned', 'started'].includes(s.status))?.status === 'assigned' ? '#6B21A8' :
                                        sessions.find(s => ['booked', 'confirmed', 'assigned', 'started'].includes(s.status))?.status === 'started' ? '#1E40AF' : '#374151'
                          }}>
                          {sessions.find(s => ['booked', 'confirmed', 'assigned', 'started'].includes(s.status))?.status.replace('_', ' ') || 'NONE'}
                        </motion.span>
                      </div>
                      {sessions.find(s => ['booked', 'confirmed', 'assigned', 'started'].includes(s.status)) ? (() => {
                        const upcoming = sessions.find(s => ['booked', 'confirmed', 'assigned', 'started'].includes(s.status));
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--surface) 100%)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '1px solid var(--border)' }}>
                                {upcoming.listener?.users?.full_name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '18px', color: 'var(--text)', marginBottom: '4px' }}>{upcoming.listener?.users?.full_name || 'Listener Pending'}</div>
                                <div style={{ fontSize: '14px', color: 'var(--text2)' }}>{new Date(upcoming.scheduled_at).toLocaleDateString()} at {new Date(upcoming.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </div>
                            </div>
                            {upcoming.status === 'started' && (
                              <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={() => window.open('https://meet.google.com/new', '_blank')}
                              >
                                Join Session Now 📹
                              </motion.button>
                            )}
                          </div>
                        );
                      })() : (
                        <p style={{ color: 'var(--text3)', fontSize: '15px' }}>No upcoming sessions. Book one when you're ready to talk.</p>
                      )}
                    </motion.div>

                    {/* Past Sessions */}
                    <motion.div variants={fadeInUp} style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>Recent Past Sessions</h3>
                        <span onClick={()=>setActiveTab('sessions')} style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600', cursor: 'pointer' }}>View All →</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {sessions.filter(s => s.status === 'completed').slice(0, 2).length > 0 ? 
                          sessions.filter(s => s.status === 'completed').slice(0, 2).map(s => (
                            <motion.div key={s.id} whileHover={{ x: 5 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                              <div>
                                <div style={{ fontWeight: '500', fontSize: '15px', color: 'var(--text)' }}>{s.listener?.users?.full_name || 'Peer Listener'}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>{new Date(s.scheduled_at).toLocaleDateString()}</div>
                              </div>
                              <span style={{ fontSize: '11px', background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '50px', fontWeight: '600' }}>Completed</span>
                            </motion.div>
                          )) : <p style={{ color: 'var(--text3)', fontSize: '14px' }}>No past sessions found.</p>
                        }
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* RIGHT COLUMN */}
                  <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} variants={staggerContainer}>
                    {/* AI Reflections */}
                    <motion.div variants={fadeInUp} style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #3A6B5E 100%)', color: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(81, 124, 113, 0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Latest AI Reflection</h3>
                        <motion.span 
                          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1.2, 1] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          style={{ fontSize: '24px' }}
                        >✨</motion.span>
                      </div>
                      {reflections.length > 0 ? (
                        <div>
                          <p style={{ fontSize: '15px', lineHeight: '1.7', opacity: 0.95, marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            "{reflections[0].reflection_text}"
                          </p>
                          <div style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>From {new Date(reflections[0].created_at).toLocaleDateString()}</div>
                        </div>
                      ) : (
                        <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.6' }}>Complete a session to receive your first personalized, private reflection.</p>
                      )}
                    </motion.div>

                    {/* Journal Entries */}
                    <motion.div variants={fadeInUp} style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>Recent Journal Entries</h3>
                        <span onClick={()=>setActiveTab('journal')} style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600', cursor: 'pointer' }}>Write New →</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {journals.slice(0, 2).length > 0 ? 
                          journals.slice(0, 2).map(j => (
                            <motion.div key={j.id} whileHover={{ x: 5 }} style={{ background: 'var(--bg)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                              <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '500' }}>{new Date(j.created_at).toLocaleDateString()}</div>
                              <div style={{ fontSize: '14px', color: 'var(--text2)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>{j.content}</div>
                            </motion.div>
                          )) : <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Your journal is currently empty.</p>
                        }
                      </div>
                    </motion.div>

                    {/* Mood Chart */}
                    <motion.div variants={fadeInUp} style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '24px' }}>Daily Mood Log</h3>
                      <div style={{ display: 'flex', gap: '12px', height: '100px', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        {[50, 70, 40, 90, 60, 80, 70].map((h, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            style={{ flex: 1, background: 'linear-gradient(to top, var(--accent-light), var(--accent))', borderRadius: '6px 6px 0 0', opacity: i === 6 ? 1 : 0.4 }}
                          ></motion.div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '11px', color: 'var(--text3)', fontWeight: '500' }}>
                        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span style={{ color: 'var(--accent)', fontWeight: '700' }}>S</span>
                      </div>
                    </motion.div>

                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* SESSIONS TAB */}
            {activeTab === 'sessions' && (
              <motion.div 
                key="sessions"
                className="tab-content"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={staggerContainer}
              >
                <h3 style={{ marginBottom: '24px', fontFamily: 'var(--serif)' }}>Your Session History</h3>
                {sessions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {sessions.map(s => (
                      <motion.div key={s.id} variants={fadeInUp} className="session-card" style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text)' }}>Session with {s.listener?.users?.full_name || 'Peer Listener (Pending)'}</div>
                          <div style={{ fontSize: '14px', color: 'var(--text3)' }}>{new Date(s.scheduled_at).toLocaleDateString()} • {s.format}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          {s.status === 'started' && (
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => window.open('https://meet.google.com/new', '_blank')}
                              style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Join 📹
                            </motion.button>
                          )}
                          <div style={{ 
                            textTransform: 'uppercase', 
                            fontSize: '10px', 
                            fontWeight: '700',
                            padding: '6px 12px', 
                            borderRadius: '50px', 
                            background: s.status === 'booked' ? '#E0F2FE' : 
                                        s.status === 'confirmed' ? '#FEF3C7' :
                                        s.status === 'assigned' ? '#F3E8FF' :
                                        s.status === 'started' ? '#DBEAFE' :
                                        s.status === 'completed' ? '#D1FAE5' : 
                                        s.status === 'reflected' ? '#ECFDF5' : '#F3F4F6', 
                            color:      s.status === 'booked' ? '#0369A1' : 
                                        s.status === 'confirmed' ? '#92400E' :
                                        s.status === 'assigned' ? '#6B21A8' :
                                        s.status === 'started' ? '#1E40AF' :
                                        s.status === 'completed' ? '#065F46' : 
                                        s.status === 'reflected' ? '#059669' : '#374151' 
                          }}>
                            {s.status.replace('_', ' ')}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    variants={fadeInUp}
                    style={{ 
                      textAlign: 'center', 
                      padding: '80px 40px', 
                      background: '#fff', 
                      borderRadius: '24px', 
                      border: '1px dashed var(--border)' 
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '24px' }}>🌱</div>
                    <h4 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>You haven’t had your first session yet.</h4>
                    <p style={{ color: 'var(--text3)', fontSize: '16px', marginBottom: '32px', maxWidth: '300px', margin: '0 auto 32px' }}>
                      Start with a calm conversation whenever you're ready.
                    </p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary"
                      onClick={() => router.push('/booking')}
                      style={{ padding: '12px 32px' }}
                    >
                      Book a Session
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* JOURNAL TAB */}
            {activeTab === 'journal' && (
              <motion.div 
                key="journal"
                className="tab-content"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={staggerContainer}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                  <h3 style={{ fontFamily: 'var(--serif)', margin: 0 }}>Wellness Journal</h3>
                  <div style={{ fontSize: '14px', color: 'var(--text3)', fontWeight: '500' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                <motion.div variants={fadeInUp} style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', marginBottom: '40px' }}>
                  <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text2)', marginBottom: '8px' }}>Try writing about:</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', color: 'var(--text3)', lineHeight: '1.6' }}>
                      <li>• What’s been mentally heavy lately?</li>
                      <li>• What made you feel good today?</li>
                      <li>• What are you avoiding emotionally?</li>
                    </ul>
                  </div>

                  <textarea 
                    placeholder="How are you feeling right now? Write it down..." 
                    value={newJournal}
                    onChange={(e) => setNewJournal(e.target.value.slice(0, 1000))}
                    style={{ width: '100%', minHeight: '160px', border: 'none', resize: 'none', fontSize: '16px', outline: 'none', color: 'var(--text)', lineHeight: '1.6' }}
                  />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '13px', color: newJournal.length >= 1000 ? 'var(--error)' : 'var(--text3)' }}>
                      {newJournal.length} / 1000
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary" 
                      onClick={handleSaveJournal} 
                      disabled={isSaving || !newJournal.trim()} 
                      style={{ padding: '12px 32px' }}
                    >
                      {isSaving ? 'Saving...' : 'Save Entry'}
                    </motion.button>
                  </div>
                </motion.div>
                <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} variants={staggerContainer}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>Past Entries</h4>
                  {journals.length > 0 ? (
                    journals.map(j => (
                      <motion.div 
                        key={j.id} 
                        variants={fadeInUp} 
                        style={{ padding: '24px', background: 'rgba(255,255,255,0.6)', borderRadius: '20px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)', position: 'relative' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button 
                              onClick={() => { setEditingJournalId(j.id); setEditingContent(j.content); }}
                              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                            >Edit</button>
                            <button 
                              onClick={() => handleDeleteJournal(j.id)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                            >Delete</button>
                          </div>
                        </div>

                        {editingJournalId === j.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <textarea 
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '12px', border: '1px solid var(--accent)', outline: 'none', fontSize: '15px', background: '#fff' }}
                            />
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                              <button onClick={() => setEditingJournalId(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                              <button 
                                onClick={() => handleUpdateJournal(j.id)}
                                style={{ padding: '6px 16px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                              >Update</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--text2)' }}>{j.content}</div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                      <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Your journal is currently empty. Start by writing your first reflection above.</p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* REFLECTIONS TAB */}
            {activeTab === 'reflections' && (
              <motion.div 
                key="reflections"
                className="tab-content"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={staggerContainer}
              >
                <h3 style={{ marginBottom: '24px', fontFamily: 'var(--serif)' }}>AI Insights & Reflections</h3>
                {reflections.length > 0 ? (
                  <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }} variants={staggerContainer}>
                    {reflections.map(r => (
                      <motion.div key={r.id} variants={fadeInUp} style={{ padding: '24px', background: 'var(--accent-light)', borderRadius: '20px', border: '1px solid var(--accent)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600', marginBottom: '12px' }}>SESSION REFLECTION</div>
                        <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text)' }}>{r.reflection_text}</p>
                        <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text3)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    variants={fadeInUp} 
                    style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center', 
                      padding: '100px 40px', 
                      background: 'linear-gradient(135deg, #fff 0%, var(--bg) 100%)', 
                      borderRadius: '32px', 
                      border: '1px solid var(--border)',
                      minHeight: '60vh',
                      width: '100%',
                      marginTop: '20px',
                      boxShadow: 'var(--card-shadow)'
                    }}
                  >
                    <motion.div 
                      animate={{ y: [0, -15, 0], scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      style={{ fontSize: '64px', marginBottom: '32px' }}
                    >✨</motion.div>
                    
                    <h4 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text)', marginBottom: '32px', fontFamily: 'var(--serif)' }}>
                      After your first session, Solace AI will generate:
                    </h4>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                      gap: '16px', 
                      width: '100%', 
                      maxWidth: '600px', 
                      margin: '0 auto 48px' 
                    }}>
                      {[
                        'emotional pattern reflections',
                        'calming observations',
                        'gentle self-awareness prompts',
                        'personal growth insights'
                      ].map((item, i) => (
                        <motion.div 
                          key={i}
                          whileHover={{ scale: 1.05, background: '#fff', borderColor: 'var(--accent)' }}
                          style={{ 
                            padding: '16px 24px', 
                            borderRadius: '16px', 
                            background: 'rgba(255,255,255,0.5)', 
                            border: '1px solid var(--border)', 
                            fontSize: '14px', 
                            color: 'var(--text2)', 
                            fontWeight: '500',
                            minHeight: '80px',
                            height: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                          }}
                        >
                          {item}
                        </motion.div>
                      ))}
                    </div>
                    
                    <div style={{ padding: '20px 60px', background: 'var(--surface)', borderRadius: '50px', color: 'var(--text3)', fontSize: '15px', fontStyle: 'italic', border: '1px solid var(--border)' }}>
                      Private. Non-judgmental. Just for you.
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                className="tab-content" 
                style={{ width: '100%' }}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={staggerContainer}
              >
                <h3 style={{ marginBottom: '32px', fontFamily: 'var(--serif)' }}>Settings</h3>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
                  gap: '32px',
                  alignItems: 'start'
                }}>
                  {/* PROFILE SECTION */}
                  <motion.div variants={fadeInUp} style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px', color: 'var(--text)' }}>Profile</h4>
                    
                    {/* AVATAR UPLOAD */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                      <div style={{ position: 'relative' }}>
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-light)' }} />
                        ) : (
                          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                            {(profile?.full_name || user?.email)?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <label htmlFor="avatar-upload" style={{ 
                          position: 'absolute', bottom: '0', right: '0', 
                          background: 'var(--accent)', color: '#fff', 
                          width: '28px', height: '28px', borderRadius: '50%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          cursor: 'pointer', border: '2px solid #fff', fontSize: '14px' 
                        }}>
                          📷
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={isSaving} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>Profile Photo</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{isSaving ? 'Uploading...' : 'Max size 2MB. JPG or PNG.'}</div>
                      </div>
                    </div>

                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: 'var(--text3)' }}>FULL NAME</label>
                      <input type="text" className="login-input" defaultValue={profile?.full_name || user?.user_metadata?.full_name} style={{ background: '#fff' }} />
                    </div>
                    <div className="input-group" style={{ marginTop: '20px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: 'var(--text3)' }}>EMAIL ADDRESS</label>
                      <input type="email" className="login-input" defaultValue={profile?.email || user?.email} disabled style={{ background: '#f5f5f5' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary" 
                        style={{ padding: '12px 24px', width: 'auto' }}
                      >Update Profile</motion.button>
                      
                      {userRole === 'admin' && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => router.push('/admin/dashboard')}
                          className="btn-secondary" 
                          style={{ padding: '12px 24px', width: 'auto', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                        >Admin Console</motion.button>
                      )}
                    </div>
                  </motion.div>

                  {/* NOTIFICATIONS SECTION */}
                  <motion.div variants={fadeInUp} style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px', color: 'var(--text)' }}>Notifications</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>Session Reminders</div>
                          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Get notified 15 minutes before your sessions.</div>
                        </div>
                        <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }} />
                      </label>
                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>Reflection Emails</div>
                          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Receive your AI reflections via email.</div>
                        </div>
                        <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }} />
                      </label>
                    </div>
                  </motion.div>

                  {/* PRIVACY SECTION */}
                  <motion.div variants={fadeInUp} style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', gridColumn: '1 / -1' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px', color: 'var(--text)' }}>Privacy & Data</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'var(--bg)', borderRadius: '16px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>Delete Journal History</div>
                          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Permanently remove all entries.</div>
                        </div>
                        <button 
                          onClick={() => {
                            if(confirm('Are you sure you want to delete ALL journal entries? This cannot be undone.')) {
                              supabase.from('journal_entries').delete().eq('user_id', user.id).then(() => fetchDashboardData());
                            }
                          }}
                          style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#EF4444', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        >Clear Journal</button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'var(--bg)', borderRadius: '16px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>Export My Data</div>
                          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Download a copy of your records.</div>
                        </div>
                        <button 
                          onClick={handleExportData}
                          style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--text2)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        >Export CSV</button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <style jsx>{`
        .dash-layout { display: flex; min-height: calc(100vh - 72px); background: var(--bg); position: relative; }
        .dash-sidebar { width: 280px; border-right: 1px solid var(--border); padding: 40px 0; background: #fff; position: sticky; top: 72px; height: calc(100vh - 72px); z-index: 100; transition: transform 0.3s ease; }
        .sidebar-header { margin-bottom: 40px; padding: 0 24px; }
        .dash-nav-item { transition: all 0.2s; position: relative; }
        .dash-main { flex: 1; padding: 60px 5%; overflow-y: auto; max-width: 1400px; margin: 0 auto; }
        .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin: 40px 0; }
        .dash-stat { background: #fff; padding: 32px; border-radius: 24px; border: 1px solid var(--border); box-shadow: var(--card-shadow); }
        .ds-val { font-size: 32px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .ds-label { color: var(--text3); font-size: 14px; }
        .mood-chart { background: #fff; padding: 32px; border-radius: 24px; border: 1px solid var(--border); }
        .mc-title { font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: var(--text3); marginBottom: 20px; }
        .btn-primary { background: #517C71; color: white; border: none; border-radius: 50px; cursor: pointer; transition: all 0.3s; }
        .btn-primary:hover { background: #3D5F57; }
        .btn-primary:disabled { background: #A8C4BC; cursor: not-allowed; }
        .login-input { width: 100%; padding: 14px 20px; border-radius: 12px; border: 1px solid var(--border); outline: none; transition: border-color 0.2s; }
        .login-input:focus { border-color: var(--accent); }
        
        .mobile-toggle { display: none; position: fixed; bottom: 30px; right: 30px; width: 64px; height: 64px; border-radius: 32px; background: var(--accent); color: white; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 8px 30px rgba(81, 124, 113, 0.4); z-index: 200; cursor: pointer; }
        .mobile-only { display: none; }

        .loader {
          width: 48px;
          height: 48px;
          border: 3px solid var(--accent-light);
          border-radius: 50%;
          display: inline-block;
          position: relative;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;
        }
        .loader::after {
          content: '';  
          box-sizing: border-box;
          position: absolute;
          left: 0;
          top: 0;
          background: var(--accent);
          width: 12px;
          height: 12px;
          transform: translate(-50%, 50%);
          border-radius: 50%;
        }
            
        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        } 

        @media (max-width: 1024px) {
          .dash-sidebar { position: fixed; left: 0; width: 280px; box-shadow: 20px 0 60px rgba(0,0,0,0.1); height: 100vh; top: 0; z-index: 1000; }
          .dash-sidebar.open { display: block; }
          .mobile-toggle { display: flex; }
          .mobile-only { display: block; }
          .dash-main { padding: 40px 20px; }
        }

        @media (max-width: 768px) {
          .dash-grid { grid-template-columns: 1fr; }
          .ds-val { font-size: 28px; }
          .dash-stat { padding: 24px; }
          .tab-content h3 { font-size: 24px; }
        }
      `}</style>
      <Footer />
    </main>
  );
}
