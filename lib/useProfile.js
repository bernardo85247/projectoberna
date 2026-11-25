'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase';

// Devuelve el perfil del usuario con sesión; si no hay sesión, redirige al login.
export function useProfile(requiredRole) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace('/');
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!data) return router.replace('/');

      const isAdmin = data.role === 'admin' || data.role === 'superadmin';

      if (requiredRole === 'patient' && data.role !== 'patient') {
        return router.replace('/admin');
      }
      if (requiredRole === 'admin' && !isAdmin) {
        return router.replace('/portal');
      }

      setProfile(data);
    })();
  }, [router, requiredRole]);

  return profile;
}
