'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import AdminTopBar from '@/components/layout/AdminTopBar';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRole = async (userId, userEmail) => {
      // 1. Check cache for instant load
      if (typeof window !== 'undefined') {
        const cachedRole = localStorage.getItem(`role_${userId}`);
        if (cachedRole) {
          console.log('⚡ Auth: Using cached role:', cachedRole);
          setUserRole(cachedRole);
          setLoading(false); // Resolve UI early
        }
      }

      // EMERGENCY BYPASS
      if (userEmail === 'bariyarvaibhav@gmail.com') {
        setUserRole('admin');
        if (typeof window !== 'undefined') localStorage.setItem(`role_${userId}`, 'admin');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.from('users').select('role').eq('id', userId).single();
        
        if (error) {
          console.warn('ℹ️ Profile not found, attempting auto-creation...');
          const { data: newData, error: createError } = await supabase
            .from('users')
            .insert([{ id: userId, email: userEmail, full_name: userEmail.split('@')[0], role: 'student' }])
            .select('role').single();

          const finalRole = newData?.role || 'student';
          setUserRole(finalRole);
          if (typeof window !== 'undefined') localStorage.setItem(`role_${userId}`, finalRole);
        } else {
          const finalRole = data?.role || 'student';
          setUserRole(finalRole);
          if (typeof window !== 'undefined') localStorage.setItem(`role_${userId}`, finalRole);
        }
      } catch (err) {
        setUserRole('student');
      } finally {
        setLoading(false);
      }
    };

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Don't await here, let fetchRole handle its own loading/cache logic
          fetchRole(session.user.id, session.user.email);
        } else {
          setUser(null);
          setUserRole(null);
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        fetchRole(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Reduced from 2.5s to 1s

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []); // Corrected dependency array to prevent infinite loop

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // The onAuthStateChange listener will handle the role fetching
    return data;
  };

  const logout = async () => {
    console.log('🚪 Auth: Logout initiated (Clean Mode)...');
    
    try {
      // 1. Immediately block all redirects by setting loading
      setLoading(true);
      setUser(null);
      setUserRole(null);

      // 2. Wipe ALL local data to kill session artifacts
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        // Clear Supabase specific keys if they exist
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase.auth.token')) localStorage.removeItem(key);
        });
      }

      // 3. Official sign out
      await supabase.auth.signOut();
      
      // 4. Hard redirect to login (bypasses SPA routing to clear memory)
      console.log('🔄 Auth: Hard redirect to login...');
      window.location.replace('/login');
    } catch (err) {
      console.error('Logout error:', err);
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, login, logout }}>
      <AdminTopBar />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
