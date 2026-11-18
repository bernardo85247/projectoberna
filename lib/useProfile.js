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
      if (requiredRole && data.role !== requiredRole) {
        return router.replace(data.role === 'admin' ? '/admin' : '/portal');
      }
      setProfile(data);
    })();
  }, [router, requiredRole]);

  return profile;
}
