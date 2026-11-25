'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Esta página tiene dos modos:
// 1) Sin sesión de recuperación: pide el correo y envía el enlace.
// 2) Con sesión de recuperación (el usuario llegó desde el correo): pide la nueva contraseña.
export default function ResetPassword() {
  const router = useRouter();
  const [recovery, setRecovery] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function sendLink(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return setMsg({ type: 'error', text: 'No pudimos enviar el correo. Intenta de nuevo en unos minutos.' });
    // Mensaje neutro: no revela si el correo existe o no.
    setMsg({ type: 'ok', text: 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.' });
  }

  async function savePassword(e) {
    e.preventDefault();
    if (password.length < 8) return setMsg({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres.' });
    if (password !== confirm) return setMsg({ type: 'error', text: 'Las contraseñas no coinciden.' });
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setBusy(false);
      return setMsg({ type: 'error', text: 'No pudimos cambiar la contraseña. El enlace pudo haber vencido; solicita uno nuevo.' });
    }
    await supabase.auth.signOut();
    setMsg({ type: 'ok', text: 'Contraseña actualizada. Ya puedes ingresar con la nueva.' });
    setTimeout(() => router.replace('/'), 1800);
  }

  return (
    <main className="page">
      <form className="card" onSubmit={recovery ? savePassword : sendLink}>
        <h2>{recovery ? 'Crea tu nueva contraseña' : 'Recuperar contraseña'}</h2>

        {!recovery && (
          <>
            <p>Escribe tu correo y te enviaremos un enlace para crear una contraseña nueva.</p>
            <label>Correo electrónico
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
          </>
        )}

        {recovery && (
          <>
            <label>Nueva contraseña
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </label>
            <label>Confirmar contraseña
              <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </label>
          </>
        )}

        {msg && <p className={`msg ${msg.type}`} role="alert">{msg.text}</p>}

        <button className="btn" disabled={busy}>
          {busy ? 'Enviando…' : recovery ? 'Guardar contraseña' : 'Enviar enlace'}
        </button>
        <p><Link href="/">Volver a ingresar</Link></p>
      </form>
    </main>
  );
}
