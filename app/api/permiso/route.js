import { NextResponse } from 'next/server';
import { getAccess } from '../../../lib/server';
import { ROLES, PERMITIDOS } from '../../../lib/roles';

export const dynamic = 'force-dynamic';
const err = (m, s) => NextResponse.json({ error: m }, { status: s });

// Solo el superadmin: cambiar el rol de un usuario o activar/desactivar un módulo para un rol.
export async function POST(request) {
  const a = await getAccess(request);
  if (!a || a.role !== 'superadmin') return err('Sin permiso.', 403);
  const b = await request.json().catch(() => ({}));

  if (b.type === 'role') {
    if (!ROLES[b.role]) return err('Rol no válido.', 400);
    if (b.user_id === a.user.id) return err('No puedes cambiar tu propio rol.', 400);
    const { error } = await a.db.from('profiles').update({ role: b.role }).eq('id', b.user_id);
    return error ? err('No se pudo cambiar el rol.', 500) : NextResponse.json({ ok: true });
  }

  if (b.type === 'module') {
    if (b.role === 'superadmin' || !(PERMITIDOS[b.role] || []).includes(b.module)) return err('Combinación no permitida.', 400);
    const q = b.enabled
      ? a.db.from('role_modules').upsert({ role: b.role, module: b.module })
      : a.db.from('role_modules').delete().eq('role', b.role).eq('module', b.module);
    const { error } = await q;
    return error ? err('No se pudo guardar.', 500) : NextResponse.json({ ok: true });
  }
  return err('Solicitud no válida.', 400);
}
