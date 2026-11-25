'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [method, setMethod] = useState('email'); // 'email' | 'cedula'
  const [form, setForm] = useState({ email: '', password: '', full_name: '', document_id: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setDigits = (k) => (e) => setForm({ ...form, [k]: e.target.value.replace(/\D/g, '') });

  async function goToPortal() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    const isAdmin = data?.role === 'admin' || data?.role === 'superadmin';
    router.replace(isAdmin ? '/admin' : '/portal');
  }

  useEffect(() => { goToPortal(); }, []); // eslint-disable-line

  async function loginWithCedula() {
    const res = await fetch('/api/login-cedula', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: form.document_id, password: form.password }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg({ type: 'error', text: out.error || 'Cédula o contraseña incorrectas.' });
    const { error } = await supabase.auth.setSession({
      access_token: out.access_token,
      refresh_token: out.refresh_token,
    });
    if (error) return setMsg({ type: 'error', text: 'No pudimos iniciar la sesión. Intenta de nuevo.' });
    await goToPortal();
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (mode === 'login') {
      if (method === 'cedula') {
        await loginWithCedula();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) setMsg({ type: 'error', text: 'Correo o contraseña incorrectos.' });
        else await goToPortal();
      }
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

  const small = { padding: '8px 14px', fontSize: 14 };

  return (
    <main className="auth">
      <section className="auth-side">
        <Logo size={46} />
        <h1>Tus resultados, claros y a un clic.</h1>
        <p>Consulta y descarga tus exámenes de laboratorio en PDF, desde cualquier dispositivo.</p>
      </section>
      <section className="auth-card">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={mode === 'login'} onClick={() => { setMode('login'); setMsg(null); }}>Ingresar</button>
          <button role="tab" aria-selected={mode === 'signup'} onClick={() => { setMode('signup'); setMsg(null); }}>Crear cuenta</button>
        </div>

        {mode === 'login' && (
          <div style={{ display: 'flex', gap: 8, margin: '16px 0 4px' }}>
            <button type="button" className={method === 'email' ? 'btn' : 'btn btn-ghost'} style={small} onClick={() => { setMethod('email'); setMsg(null); }}>Con correo</button>
            <button type="button" className={method === 'cedula' ? 'btn' : 'btn btn-ghost'} style={small} onClick={() => { setMethod('cedula'); setMsg(null); }}>Con cédula</button>
          </div>
        )}

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <label>Nombre completo<input required value={form.full_name} onChange={set('full_name')} autoComplete="name" /></label>
              <label>Documento de identidad<input required value={form.document_id} onChange={setDigits('document_id')} inputMode="numeric" minLength={5} maxLength={15} pattern="[0-9]{5,15}" title="Solo números, entre 5 y 15 dígitos" /></label>
            </>
          )}

          {mode === 'login' && method === 'cedula' ? (
            <label>Número de cédula<input required value={form.document_id} onChange={setDigits('document_id')} inputMode="numeric" minLength={5} maxLength={15} autoComplete="username" placeholder="Solo números" /></label>
          ) : (
            <label>Correo electrónico<input type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></label>
          )}

          <label>Contraseña<input type="password" required minLength={8} value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
          {msg && <p className={`msg ${msg.type}`} role="alert">{msg.text}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Un momento…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</button>
          {mode === 'login' && (
            <p style={{ marginTop: 14, fontSize: 14 }}>
              <Link href="/reset-password">¿Olvidaste tu contraseña?</Link>
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
