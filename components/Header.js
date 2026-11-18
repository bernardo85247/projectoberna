'use client';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import { supabase } from '../lib/supabase';

export default function Header({ profile }) {
  const router = useRouter();
  async function logout() {
    await supabase.auth.signOut();
    router.replace('/');
  }
  return (
    <header className="topbar">
      <Logo size={34} />
      <div className="topbar-user">
        <span>{profile.full_name || 'Mi cuenta'}</span>
        <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
      </div>
    </header>
  );
}
