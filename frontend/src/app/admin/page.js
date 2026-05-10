'use client';
import { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <main>
      <Navbar />
      <div className="dash-layout">
        <aside className="dash-sidebar" style={{ display: 'block' }}>
          <div className={`dash-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Stats</div>
          <div className={`dash-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Users</div>
          <div className={`dash-nav-item ${activeTab === 'listeners' ? 'active' : ''}`} onClick={() => setActiveTab('listeners')}>🎧 Listeners</div>
          <div className={`dash-nav-item ${activeTab === 'safety' ? 'active' : ''}`} onClick={() => setActiveTab('safety')}>⚠️ Safety</div>
        </aside>
        <section className="dash-main">
          <div className="dash-greeting">
            <h2>Admin Console</h2>
            <p>Platform health and safety overview</p>
          </div>

          <div className="admin-grid">
            <div className="admin-stat">
              <div className="as-icon">📈</div>
              <div className="as-val">₹42,300</div>
              <div className="as-label">Total Revenue</div>
            </div>
            <div className="admin-stat">
              <div className="as-icon">✅</div>
              <div className="as-val">124</div>
              <div className="as-label">Active Sessions</div>
            </div>
            <div className="admin-stat">
              <div className="as-icon">🎧</div>
              <div className="as-val">48</div>
              <div className="as-label">Online Listeners</div>
            </div>
            <div className="admin-stat">
              <div className="as-icon">🚩</div>
              <div className="as-val">0</div>
              <div className="as-label">Safety Alerts</div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
