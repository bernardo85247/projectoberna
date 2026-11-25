'use client';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import { supabase } from '../lib/supabase';

const ROLES = {
  superadmin: 'Super admin',
  admin: 'Admin',
  patient: 'Paciente',
};

export default function Header({ profile }) {
  const router = useRouter();
  async function logout() {
    await supabase.auth.signOut();
    router.replace('/');
  }
  return (
    <header className="topbar">
      <Logo size={44} />
      <div className="topbar-user">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.25 }}>
          <span>{profile.full_name || 'Mi cuenta'}</span>
          {ROLES[profile.role] && (
            <small style={{ fontSize: 12, fontWeight: 600, color: '#0B5C66', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {ROLES[profile.role]}
            </small>
          )}
        </div>
        <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
      </div>
    </header>
  );
}
