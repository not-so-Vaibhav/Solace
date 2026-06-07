'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import ChatWindow from '@/components/chat/ChatWindow';

export default function ListenerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sessions, setSessions] = useState([]);
  const [activeChatSessionId, setActiveChatSessionId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      supabase.from('sessions').select(`*, student:student_id(full_name)`).eq('listener_id', user.id).order('scheduled_at', { ascending: false }).then(({data}) => {
        if(data) setSessions(data);
      });
    }
  }, [user]);

  const handleStartSession = async (session) => {
    await supabase.from('sessions').update({ status: 'started' }).eq('id', session.id);
    if (session.format?.toLowerCase().includes('chat')) {
      setActiveChatSessionId(session.id);
    } else {
      window.open(`https://meet.jit.si/Solace-Session-${session.id}`, '_blank');
    }
    const { data } = await supabase.from('sessions').select(`*, student:student_id(full_name)`).eq('listener_id', user.id).order('scheduled_at', { ascending: false });
    if(data) setSessions(data);
  };

  return (
    <main>
      <Navbar />
      <div className="dash-layout">
        <aside className="dash-sidebar" style={{ display: 'block' }}>
          <div className={`dash-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Earnings</div>
          <div className={`dash-nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>📅 Schedule</div>
          <div className={`dash-nav-item ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>💬 Sessions</div>
        </aside>
        <section className="dash-main">
          <div className="dash-greeting">
            <h2>Listener Console</h2>
            <p>Managing your sessions and availability</p>
          </div>

          {activeTab === 'overview' && (
            <div className="earnings-card">
              <div className="ec-amount">₹4,250</div>
              <div className="ec-period">Earned this month</div>
              <div className="ec-row">
                <div className="ec-stat">
                  <div className="ec-stat-val">28</div>
                  <div className="ec-stat-label">Hours Logged</div>
                </div>
                <div className="ec-stat">
                  <div className="ec-stat-val">4.9</div>
                  <div className="ec-stat-label">Avg. Rating</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '20px' }}>Your Assigned Sessions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sessions.length === 0 ? <p>No sessions assigned yet.</p> : sessions.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#fff', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{s.student?.full_name || 'Student'}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text3)' }}>{new Date(s.scheduled_at).toLocaleDateString()} at {new Date(s.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {s.status === 'started' && (
                        <button onClick={() => setActiveChatSessionId(s.id)} style={{ padding: '8px 16px', background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Chat 💬</button>
                      )}
                      {s.status === 'assigned' && (
                        <button onClick={() => handleStartSession(s)} style={{ padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Start Session</button>
                      )}
                      {s.status === 'started' && !s.format?.toLowerCase().includes('chat') && (
                        <button onClick={() => window.open(`https://meet.jit.si/Solace-Session-${s.id}`, '_blank')} style={{ padding: '8px 16px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Join Meeting</button>
                      )}
                      {s.status === 'completed' && <span style={{ color: '#10B981', fontWeight: '600' }}>Completed</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {activeChatSessionId && (
        <ChatWindow 
          sessionId={activeChatSessionId} 
          currentUserId={user?.id} 
          onClose={() => setActiveChatSessionId(null)} 
        />
      )}

      <Footer />
    </main>
  );
}
