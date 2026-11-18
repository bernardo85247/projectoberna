'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', full_name: '', document_id: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function goToPortal() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    router.replace(data?.role === 'admin' ? '/admin' : '/portal');
  }

  useEffect(() => { goToPortal(); }, []); // eslint-disable-line

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) setMsg({ type: 'error', text: 'Correo o contraseña incorrectos.' });
      else await goToPortal();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name, document_id: form.document_id } },
      });
      if (error) setMsg({ type: 'error', text: error.message });
      else if (data.session) await goToPortal();
      else setMsg({ type: 'ok', text: 'Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.' });
    }
    setBusy(false);
  }

  return (
    <main className="auth">
      <section className="auth-side">
        <Logo size={46} />
        <h1>Tus resultados, claros y a un clic.</h1>
        <p>Consulta y descarga tus exámenes de laboratorio en PDF, desde cualquier dispositivo.</p>
      </section>
      <section className="auth-card">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={mode === 'login'} onClick={() => setMode('login')}>Ingresar</button>
          <button role="tab" aria-selected={mode === 'signup'} onClick={() => setMode('signup')}>Crear cuenta</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <label>Nombre completo<input required value={form.full_name} onChange={set('full_name')} autoComplete="name" /></label>
              <label>Documento de identidad<input required value={form.document_id} onChange={set('document_id')} inputMode="numeric" /></label>
            </>
          )}
          <label>Correo electrónico<input type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></label>
          <label>Contraseña<input type="password" required minLength={8} value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
          {msg && <p className={`msg ${msg.type}`} role="alert">{msg.text}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Un momento…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</button>
        </form>
      </section>
    </main>
  );
}
