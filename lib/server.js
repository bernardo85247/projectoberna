// SOLO para rutas del servidor (app/api/*). Nunca importar desde componentes del navegador.
import { createClient } from '@supabase/supabase-js';
import { PERMITIDOS } from './roles';

export function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Identifica al usuario por su token y devuelve su rol y módulos. null si no es válido.
export async function getAccess(request) {
  const token = (request.headers.get('authorization') || '').replace('Bearer ', '').trim();
  if (!token) return null;
  const db = adminClient();
  const { data: { user } } = await db.auth.getUser(token);
  if (!user) return null;
  const { data: profile } = await db.from('profiles').select('id, role').eq('id', user.id).single();
  if (!profile) return null;
  let modules = PERMITIDOS.superadmin;
  if (profile.role !== 'superadmin') {
    const { data } = await db.from('role_modules').select('module').eq('role', profile.role);
    modules = (data || []).map((r) => r.module);
  }
  return { db, user, role: profile.role, modules };
}

// Comunicación con el equipo del laboratorio (ver equipo-servidor/server.js).
const base = () => (process.env.LAB_FILES_URL || '').replace(/\/$/, '');
const auth = () => ({ Authorization: `Bearer ${process.env.LAB_FILES_TOKEN}` });
export const equipoConfigurado = () => Boolean(process.env.LAB_FILES_URL && process.env.LAB_FILES_TOKEN);
export const equipoGuardar = (name, buffer) =>
  fetch(`${base()}/files/${name}`, { method: 'PUT', headers: { ...auth(), 'Content-Type': 'application/pdf' }, body: buffer });
export const equipoObtener = (name) => fetch(`${base()}/files/${name}`, { headers: auth() });
