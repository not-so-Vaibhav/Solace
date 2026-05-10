'use client';
import { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function ListenerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

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
        </section>
      </div>
      <Footer />
    </main>
  );
}
