'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, userRole, logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const isActive = (path) => pathname === path;

  return (
    <nav className="nav-main">
      <Link href="/" className="logo" style={{ textDecoration: 'none', zIndex: 1100 }}>
        Sol<span>ace</span>
      </Link>
      
      <div className="nav-links">
        <Link href="/" className={isActive('/') ? 'active' : ''}>Home</Link>
        <Link href="/listeners" className={isActive('/listeners') ? 'active' : ''}>Meet Listeners</Link>
        <Link href="/booking" className={isActive('/booking') ? 'active' : ''}>Book Session</Link>
        <Link href="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>My Space</Link>
        {userRole === 'admin' && (
          <Link href="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''}>
            Admin Console
          </Link>
        )}
      </div>

      <div className="nav-socials">
        {[
          { id: 'youtube', url: 'https://www.youtube.com/@Solacetalks', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg> },
          { id: 'instagram', url: 'https://www.instagram.com/solace.talks/', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
          { id: 'discord', url: 'https://discord.gg/5MRM53CrXG', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" /><path d="M12 2a10 10 0 0 0-9 13.5l1 2.5a1 1 0 0 0 1 1h2.5c.7 0 1.3-.4 1.7-1a10 10 0 0 1 5.6 0c.4.6 1 1 1.7 1H21a1 1 0 0 0 1-1l1-2.5A10 10 0 0 0 12 2z" /></svg> },
          { id: 'x', url: 'https://x.com/solace_talks', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg> },
          { id: 'linkedin', url: 'https://www.linkedin.com/in/solace-talks', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> }
        ].map(social => (
          <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="social-btn">
            {social.icon}
          </a>
        ))}
      </div>

      <div className="nav-role" style={{ zIndex: 1100 }}>
        {user ? (
          <button 
            onClick={logout}
            className="role-btn" 
            style={{ 
              background: 'var(--surface2)',
              color: 'var(--text)',
              borderColor: 'var(--border)'
            }}
          >
            Logout
          </button>
        ) : (
          <Link href="/login" className="desktop-login">
            <button 
              className="role-btn" 
              style={{ 
                background: isActive('/login') ? 'var(--accent)' : 'var(--surface2)',
                color: isActive('/login') ? '#fff' : 'var(--text)',
                borderColor: isActive('/login') ? 'var(--accent)' : 'var(--border)'
              }}
            >
              Login
            </button>
          </Link>
        )}
        <button 
          className={`mobile-toggle-btn ${isOpen ? 'is-active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <span className="line"></span>
          <span className="line"></span>
        </button>
      </div>

      {/* REFINED MOBILE MENU */}
      <div className={`premium-menu ${isOpen ? 'is-open' : ''}`}>
        <div className="menu-inner">
          <div className="menu-nav">
            {[
              { id: 'home', label: 'Home', href: '/' },
              { id: 'listeners', label: 'Meet Listeners', href: '/listeners' },
              { id: 'booking', label: 'Book Session', href: '/booking' },
              { id: 'dashboard', label: 'My Space', href: '/dashboard' },
              user ? { id: 'logout', label: 'Logout', href: '#', onClick: logout } : { id: 'login', label: 'Login', href: '/login' },
            ].map((item, index) => (
              <Link 
                key={item.id} 
                href={item.href} 
                className={`menu-link ${isActive(item.href) ? 'active' : ''}`}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setIsOpen(false);
                }}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <span className="menu-txt">{item.label}</span>
              </Link>
            ))}
          </div>
          
          <div className="menu-bottom">
            <p className="menu-tagline">Peer support for students, by students.</p>
            <div className="menu-socials">
              {[
                { id: 'youtube', url: 'https://www.youtube.com/@Solacetalks', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg> },
                { id: 'instagram', url: 'https://www.instagram.com/solace.talks/', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                { id: 'discord', url: 'https://discord.gg/5MRM53CrXG', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" /><path d="M12 2a10 10 0 0 0-9 13.5l1 2.5a1 1 0 0 0 1 1h2.5c.7 0 1.3-.4 1.7-1a10 10 0 0 1 5.6 0c.4.6 1 1 1.7 1H21a1 1 0 0 0 1-1l1-2.5A10 10 0 0 0 12 2z" /></svg> },
                { id: 'x', url: 'https://x.com/solace_talks', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg> },
                { id: 'linkedin', url: 'https://www.linkedin.com/in/solace-talks', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> }
              ].map(social => (
                <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="social-btn">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .nav-main {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(247,245,242,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 0 5%;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-links {
          display: flex;
          gap: 40px;
          margin-left: 60px;
        }

        .nav-socials {
          display: flex;
          gap: 12px;
          margin-left: auto;
          margin-right: 24px;
        }

        .social-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f8f9fb;
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(81, 124, 113, 0.1);
          text-decoration: none;
        }

        .social-btn :global(svg) {
          width: 18px;
          height: 18px;
        }

        .social-btn:hover {
          background: var(--accent);
          color: #fff;
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(81, 124, 113, 0.2);
        }

        .nav-links :global(a) {
          text-decoration: none;
          color: var(--text2);
          font-weight: 500;
          font-size: 17px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          padding: 4px 0;
        }

        .nav-links :global(a::after) {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2px;
          background: var(--accent);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(-50%);
          border-radius: 2px;
        }

        .nav-links :global(a:hover) {
          color: var(--accent);
        }

        .nav-links :global(a:hover::after) {
          width: 100%;
        }

        .nav-links :global(a.active) {
          color: var(--accent);
        }

        .nav-links :global(a.active::after) {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--accent);
          border-radius: 2px;
          transform: none !important;
        }

        .role-btn {
          padding: 8px 20px;
          border-radius: 50px;
          border: 1px solid var(--border);
          background: #f8f9fb;
          color: var(--text2);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .role-btn:hover {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(81, 124, 113, 0.2);
        }

        .mobile-toggle-btn {
          display: none;
          background: var(--text);
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          cursor: pointer;
          position: relative;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .mobile-toggle-btn .line {
          display: block;
          position: absolute;
          height: 2px;
          width: 20px;
          background: #fff;
          left: 12px;
          transition: all 0.3s;
        }

        .mobile-toggle-btn .line:nth-child(1) { top: 18px; }
        .mobile-toggle-btn .line:nth-child(2) { bottom: 18px; }

        .mobile-toggle-btn.is-active {
          transform: rotate(90deg);
          background: var(--accent);
        }

        .mobile-toggle-btn.is-active .line:nth-child(1) { transform: translateY(3px) rotate(45deg); }
        .mobile-toggle-btn.is-active .line:nth-child(2) { transform: translateY(-3px) rotate(-45deg); }

        .premium-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: var(--bg);
          z-index: 1050;
          visibility: hidden;
          clip-path: circle(30px at calc(95% - 22px) 36px);
          transition: all 0.7s cubic-bezier(0.77, 0, 0.175, 1);
        }

        .premium-menu.is-open {
          visibility: visible;
          clip-path: circle(150% at calc(95% - 22px) 36px);
        }

        .menu-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 0 10%;
          text-align: center;
        }

        .menu-nav {
          display: flex;
          flex-direction: column;
          gap: 32px;
          align-items: center;
          margin-bottom: 40px;
          padding-top: 40px;
        }

        .menu-link {
          text-decoration: none !important;
          display: flex;
          justify-content: center;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s ease;
          position: relative;
          padding: 5px 0;
        }

        .premium-menu.is-open .menu-link {
          opacity: 1;
          transform: translateY(0);
        }

        .menu-txt {
          font-family: var(--serif);
          font-size: clamp(40px, 12vw, 72px);
          color: var(--text);
          text-decoration: none !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .menu-link:hover .menu-txt, .menu-link.active .menu-txt {
          transform: scale(1.08);
          color: var(--accent);
        }

        .menu-bottom {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s ease 0.5s;
        }

        .premium-menu.is-open .menu-bottom {
          opacity: 1;
          transform: translateY(0);
        }

        .menu-tagline {
          font-size: 16px;
          color: var(--text3);
          font-weight: 400;
        }

        .menu-socials {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        @media (max-width: 1200px) {
          .nav-socials { display: none; }
        }

        @media (max-width: 900px) {
          .nav-links, .desktop-login, .role-btn { display: none !important; }
          .mobile-toggle-btn { display: block !important; }
          .menu-inner { padding: 0 8%; }
          .menu-bottom { position: relative; bottom: 0; left: 0; right: 0; flex-direction: column; align-items: flex-start; gap: 24px; margin-top: 60px; }
        }
      `}</style>
    </nav>
  );
}
