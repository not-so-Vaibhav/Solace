'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminTopBar() {
  const { user, userRole } = useAuth();
  const pathname = usePathname();

  // Only show if user is admin and not already on the admin dashboard
  if (!user || userRole !== 'admin') return null;

  return (
    <div style={{ 
      background: '#1A1714', 
      color: '#fff', 
      padding: '8px 5%', 
      fontSize: '11px', 
      fontWeight: '700', 
      letterSpacing: '1px',
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      position: 'relative', 
      zIndex: 2000,
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ 
          width: '6px', 
          height: '6px', 
          borderRadius: '50%', 
          background: '#10B981', 
          display: 'inline-block',
          boxShadow: '0 0 8px #10B981'
        }}></span>
        ADMINISTRATION MODE
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        {pathname !== '/admin/dashboard' ? (
          <Link href="/admin/dashboard" style={{ color: '#7BAF9E', textDecoration: 'none', transition: 'all 0.2s' }}>
            OPEN ADMIN CONSOLE →
          </Link>
        ) : (
          <Link href="/dashboard" style={{ color: 'var(--text3)', textDecoration: 'none' }}>
            VIEW STUDENT DASHBOARD
          </Link>
        )}
      </div>
    </div>
  );
}
