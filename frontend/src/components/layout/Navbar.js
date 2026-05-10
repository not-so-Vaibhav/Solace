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
              { id: '01', label: 'Home', href: '/' },
              { id: '02', label: 'Meet Listeners', href: '/listeners' },
              { id: '03', label: 'Book Session', href: '/booking' },
              { id: '04', label: 'My Space', href: '/dashboard' },
              user ? { id: '05', label: 'Logout', href: '#', onClick: logout } : { id: '05', label: 'Login', href: '/login' },
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
                <span className="menu-idx">{item.id}</span>
                <span className="menu-txt">{item.label}</span>
                <div className="menu-line"></div>
              </Link>
            ))}
          </div>
          
          <div className="menu-bottom">
            <p className="menu-tagline">Peer support for students, by students.</p>
            <div className="menu-socials">
              <a href="#">Instagram</a>
              <a href="#">Twitter</a>
              <a href="#">LinkedIn</a>
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
          gap: 32px;
        }

        .nav-links :global(a) {
          text-decoration: none;
          color: var(--text2);
          font-weight: 500;
          font-size: 17px;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-links :global(a.active) {
          color: var(--accent);
        }

        .nav-links :global(a.active::after) {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--accent);
          border-radius: 2px;
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
          padding: 0 10%;
        }

        .menu-nav {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .menu-link {
          text-decoration: none;
          display: flex;
          align-items: baseline;
          gap: 24px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s ease;
          position: relative;
          padding: 10px 0;
        }

        .premium-menu.is-open .menu-link {
          opacity: 1;
          transform: translateY(0);
        }

        .menu-idx {
          font-size: 16px;
          color: var(--accent);
          font-weight: 600;
          font-family: var(--sans);
          opacity: 0.6;
        }

        .menu-txt {
          font-family: var(--serif);
          font-size: clamp(40px, 10vw, 64px);
          color: var(--text);
          transition: transform 0.3s ease;
        }

        .menu-link:hover .menu-txt, .menu-link.active .menu-txt {
          transform: translateX(10px);
          color: var(--accent);
        }

        .menu-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--accent);
          transition: width 0.4s ease;
          opacity: 0.3;
        }

        .menu-link:hover .menu-line, .menu-link.active .menu-line {
          width: 100%;
        }

        .menu-bottom {
          position: absolute;
          bottom: 60px;
          left: 10%;
          right: 10%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 1px solid var(--border);
          padding-top: 40px;
          opacity: 0;
          transition: all 1s ease 0.5s;
        }

        .premium-menu.is-open .menu-bottom {
          opacity: 1;
        }

        .menu-tagline {
          font-size: 15px;
          color: var(--text3);
          max-width: 200px;
        }

        .menu-socials {
          display: flex;
          gap: 24px;
        }

        .menu-socials a {
          text-decoration: none;
          color: var(--text2);
          font-size: 14px;
          font-weight: 500;
          transition: color 0.3s;
        }

        .menu-socials a:hover { color: var(--accent); }

        @media (max-width: 900px) {
          .nav-links, .desktop-login, .role-btn { display: none !important; }
          .mobile-toggle-btn { display: block !important; }
          .menu-inner { padding: 0 8%; }
          .menu-bottom { flex-direction: column; align-items: flex-start; gap: 24px; }
        }
      `}</style>
    </nav>
  );
}
