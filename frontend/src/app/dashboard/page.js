'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ sessions: 0, credits: 0, mood: 84 });
  const [sessions, setSessions] = useState([]);
  const [journals, setJournals] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [newJournal, setNewJournal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userRole === 'admin') {
        router.push('/admin/dashboard');
      } else {
        // Fallback for students or unknown roles
        fetchDashboardData();
      }
    }
  }, [user, userRole, loading]);

  const fetchDashboardData = async () => {
    try {
      // 1. Profile
      const { data: profileData } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);

      // 2. All Sessions
      const { data: sessionData } = await supabase
        .from('sessions')
        .select(`*, listener:listener_id (users (full_name))`)
        .eq('student_id', user.id)
        .order('scheduled_at', { ascending: false });
      if (sessionData) setSessions(sessionData);

      // 3. Journal Entries
      const { data: journalData } = await supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (journalData) setJournals(journalData);

      // 4. AI Reflections
      const { data: reflectionData } = await supabase.from('ai_reflections').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (reflectionData) setReflections(reflectionData);

      // 5. Stats
      const completed = sessionData?.filter(s => s.status === 'completed').length || 0;
      const { data: payments } = await supabase.from('payments').select('amount').eq('user_id', user.id).eq('status', 'completed');
      const totalCredits = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
      setStats({ sessions: completed, credits: totalCredits, mood: 84 });

    } catch (error) { console.error('Error:', error); }
  };

  const handleSaveJournal = async () => {
    if (!newJournal.trim()) return;
    setIsSaving(true);
    const { error } = await supabase.from('journal_entries').insert([{ user_id: user.id, content: newJournal, mood: 'Good' }]);
    if (!error) {
      setNewJournal('');
      fetchDashboardData();
    }
    setIsSaving(false);
  };

  if (loading || !user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="loader"></div></div>;

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
        <aside className="dash-sidebar">
          {tabs.map(tab => (
            <div key={tab.id} className={`dash-nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <span className="dash-nav-icon">{tab.icon}</span> {tab.label}
            </div>
          ))}
        </aside>

        <section className="dash-main">
          <div className="dash-greeting">
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '32px' }}>Welcome back, {profile?.full_name?.split(' ')[0]}</h2>
          </div>
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="tab-content fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* STATS ROW */}
              <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'var(--serif)', color: 'var(--text)', marginBottom: '4px' }}>{stats.sessions}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '500' }}>Sessions Completed</div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'var(--serif)', color: 'var(--text)', marginBottom: '4px' }}>{stats.mood}%</div>
                  <div style={{ fontSize: '13px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '500' }}>Mood Stability</div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'var(--serif)', color: 'var(--text)', marginBottom: '4px' }}>₹{stats.credits}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '500' }}>Credits Remaining</div>
                </div>
              </div>

              {/* MAIN DASHBOARD GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', alignItems: 'start' }}>
                
                {/* LEFT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Upcoming Session */}
                  <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>Active Session Status</h3>
                      <span style={{ 
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
                      </span>
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
                            <button 
                              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                              onClick={() => window.open('https://meet.google.com/new', '_blank')}
                            >
                              Join Session Now 📹
                            </button>
                          )}
                        </div>
                      );
                    })() : (
                      <p style={{ color: 'var(--text3)', fontSize: '15px' }}>No upcoming sessions. Book one when you're ready to talk.</p>
                    )}
                  </div>

                  {/* Past Sessions */}
                  <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>Recent Past Sessions</h3>
                      <span onClick={()=>setActiveTab('sessions')} style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600', cursor: 'pointer' }}>View All →</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {sessions.filter(s => s.status === 'completed').slice(0, 2).length > 0 ? 
                        sessions.filter(s => s.status === 'completed').slice(0, 2).map(s => (
                          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                            <div>
                              <div style={{ fontWeight: '500', fontSize: '15px', color: 'var(--text)' }}>{s.listener?.users?.full_name || 'Peer Listener'}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>{new Date(s.scheduled_at).toLocaleDateString()}</div>
                            </div>
                            <span style={{ fontSize: '11px', background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '50px', fontWeight: '600' }}>Completed</span>
                          </div>
                        )) : <p style={{ color: 'var(--text3)', fontSize: '14px' }}>No past sessions found.</p>
                      }
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* AI Reflections */}
                  <div style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #3A6B5E 100%)', color: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(81, 124, 113, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Latest AI Reflection</h3>
                      <span style={{ fontSize: '24px' }}>✨</span>
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
                  </div>

                  {/* Journal Entries */}
                  <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>Recent Journal Entries</h3>
                      <span onClick={()=>setActiveTab('journal')} style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600', cursor: 'pointer' }}>Write New →</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {journals.slice(0, 2).length > 0 ? 
                        journals.slice(0, 2).map(j => (
                          <div key={j.id} style={{ background: 'var(--bg)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '500' }}>{new Date(j.created_at).toLocaleDateString()}</div>
                            <div style={{ fontSize: '14px', color: 'var(--text2)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>{j.content}</div>
                          </div>
                        )) : <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Your journal is currently empty.</p>
                      }
                    </div>
                  </div>

                  {/* Mood Chart */}
                  <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '24px' }}>Daily Mood Log</h3>
                    <div style={{ display: 'flex', gap: '12px', height: '100px', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                      {[50, 70, 40, 90, 60, 80, 70].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, var(--accent-light), var(--accent))', borderRadius: '6px 6px 0 0', opacity: i === 6 ? 1 : 0.4, transition: 'all 0.3s' }}></div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '11px', color: 'var(--text3)', fontWeight: '500' }}>
                      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span style={{ color: 'var(--accent)', fontWeight: '700' }}>S</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* SESSIONS TAB */}
          {activeTab === 'sessions' && (
            <div className="tab-content fadeIn">
              <h3 style={{ marginBottom: '24px', fontFamily: 'var(--serif)' }}>Your Session History</h3>
              {sessions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sessions.map(s => (
                    <div key={s.id} className="session-card" style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text)' }}>Session with {s.listener?.users?.full_name || 'Peer Listener (Pending)'}</div>
                        <div style={{ fontSize: '14px', color: 'var(--text3)' }}>{new Date(s.scheduled_at).toLocaleDateString()} • {s.format}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {s.status === 'started' && (
                          <button 
                            onClick={() => window.open('https://meet.google.com/new', '_blank')}
                            style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Join 📹
                          </button>
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
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text3)' }}>No sessions found. Book your first one!</p>
              )}
            </div>
          )}

          {/* JOURNAL TAB */}
          {activeTab === 'journal' && (
            <div className="tab-content fadeIn">
              <h3 style={{ marginBottom: '24px', fontFamily: 'var(--serif)' }}>Wellness Journal</h3>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px' }}>
                <textarea 
                  placeholder="How are you feeling right now? Write it down..." 
                  value={newJournal}
                  onChange={(e) => setNewJournal(e.target.value)}
                  style={{ width: '100%', minHeight: '120px', border: 'none', resize: 'none', fontSize: '16px', outline: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button className="btn-primary" onClick={handleSaveJournal} disabled={isSaving || !newJournal.trim()} style={{ padding: '10px 24px' }}>
                    {isSaving ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {journals.map(j => (
                  <div key={j.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>{new Date(j.created_at).toLocaleDateString()}</div>
                    <div style={{ fontSize: '15px', lineHeight: '1.6' }}>{j.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REFLECTIONS TAB */}
          {activeTab === 'reflections' && (
            <div className="tab-content fadeIn">
              <h3 style={{ marginBottom: '24px', fontFamily: 'var(--serif)' }}>AI Insights & Reflections</h3>
              {reflections.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {reflections.map(r => (
                    <div key={r.id} style={{ padding: '24px', background: 'var(--accent-light)', borderRadius: '20px', border: '1px solid var(--accent)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600', marginBottom: '12px' }}>SESSION REFLECTION</div>
                      <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text)' }}>{r.reflection_text}</p>
                      <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text3)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '20px' }}>✨</div>
                  <p style={{ color: 'var(--text3)' }}>Your AI insights will appear here after your first session.</p>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="tab-content fadeIn" style={{ maxWidth: '500px' }}>
              <h3 style={{ marginBottom: '32px', fontFamily: 'var(--serif)' }}>Account Settings</h3>
              <div className="input-group">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: 'var(--text3)' }}>FULL NAME</label>
                <input type="text" className="login-input" defaultValue={profile?.full_name} style={{ background: '#fff' }} />
              </div>
              <div className="input-group" style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: 'var(--text3)' }}>EMAIL ADDRESS</label>
                <input type="email" className="login-input" defaultValue={profile?.email} disabled style={{ background: '#f5f5f5' }} />
              </div>
              <button className="btn-primary" style={{ marginTop: '32px', width: '100%' }}>Update Profile</button>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .dash-layout { display: flex; min-height: calc(100vh - 72px); background: var(--bg); }
        .dash-sidebar { width: 260px; border-right: 1px solid var(--border); padding: 40px 20px; background: #fff; }
        .dash-nav-item { padding: 14px 20px; border-radius: 12px; cursor: pointer; color: var(--text2); display: flex; align-items: center; gap: 12px; font-size: 15px; margin-bottom: 8px; transition: all 0.2s; }
        .dash-nav-item:hover { background: var(--bg); }
        .dash-nav-item.active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
        .dash-main { flex: 1; padding: 60px 5%; overflow-y: auto; }
        .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin: 40px 0; }
        .dash-stat { background: #fff; padding: 32px; border-radius: 24px; border: 1px solid var(--border); box-shadow: var(--card-shadow); }
        .ds-val { font-size: 32px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .ds-label { color: var(--text3); font-size: 14px; }
        .mood-chart { background: #fff; padding: 32px; border-radius: 24px; border: 1px solid var(--border); }
        .mc-title { font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: var(--text3); marginBottom: 20px; }
        .fadeIn { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <Footer />
    </main>
  );
}
