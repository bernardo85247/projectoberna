import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Ingreso con cédula (solo pacientes).
// Corre en el servidor: busca el correo asociado a la cédula y valida la contraseña
// sin exponer nunca el correo al navegador.
export async function POST(request) {
  const invalid = () =>
    NextResponse.json({ error: 'Cédula o contraseña incorrectas.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const doc = String(body.document_id || '').replace(/\D/g, '');
  const password = String(body.password || '');
  if (!/^[0-9]{5,15}$/.test(doc) || !password) return invalid();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'Servicio no disponible. Intenta con tu correo.' }, { status: 500 });
  }

  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: profile } = await admin
    .from('profiles')
    .select('email, role')
    .eq('document_id', doc)
    .maybeSingle();

  // Solo los pacientes pueden ingresar con cédula; admin y superadmin usan su correo.
  if (!profile || profile.role !== 'patient' || !profile.email) return invalid();

  const { data, error } = await admin.auth.signInWithPassword({ email: profile.email, password });
  if (error || !data?.session) return invalid();

  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
}
