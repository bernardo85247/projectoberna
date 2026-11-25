'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from './Logo';
import { supabase } from '../lib/supabase';
import { ROLES, MODULOS } from '../lib/roles';

export default function Header({ profile, modules = [] }) {
  const router = useRouter();
  const path = usePathname();
  async function logout() {
    await supabase.auth.signOut();
    router.replace('/');
  }
  return (
    <header className="topbar">
      <Logo size={40} />
      <nav className="nav" aria-label="Módulos">
        {Object.entries(MODULOS).filter(([k]) => modules.includes(k)).map(([k, m]) => (
          <Link key={k} href={m.href} className={path === m.href ? 'active' : ''}>{m.label}</Link>
        ))}
      </nav>
      <div className="topbar-user">
        <div className="who">
          <span>{profile.full_name || 'Mi cuenta'}</span>
          {ROLES[profile.role] && <small className={`badge role-${profile.role}`}>{ROLES[profile.role]}</small>}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Cerrar sesión</button>
      </div>
    </header>
  );
}
