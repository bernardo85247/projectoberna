'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase';
import { PERMITIDOS } from './roles';

// Devuelve { profile, modules, denied }.
// - Sin sesión: redirige al login.
// - Sin acceso al módulo: denied = true (la página muestra un aviso; nunca redirige en bucle).
export function useProfile(moduleKey) {
  const router = useRouter();
  const [state, setState] = useState({ profile: null, modules: [], denied: false });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace('/');
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!profile) { await supabase.auth.signOut(); return router.replace('/'); }
      let modules = PERMITIDOS.superadmin;
      if (profile.role !== 'superadmin') {
        const { data } = await supabase.from('role_modules').select('module').eq('role', profile.role);
        modules = (data || []).map((r) => r.module);
      }
      setState({ profile, modules, denied: moduleKey ? !modules.includes(moduleKey) : false });
    })();
  }, [router, moduleKey]);

  return state;
}
