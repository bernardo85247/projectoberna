import { NextResponse } from 'next/server';
import { getAccess, equipoConfigurado, equipoGuardar } from '../../../lib/server';

export const dynamic = 'force-dynamic';
const MAX = 4 * 1024 * 1024; // Vercel limita el cuerpo de una petición a ~4.5 MB
const err = (m, s) => NextResponse.json({ error: m }, { status: s });

// Subir un resultado: valida rol y módulo, guarda el PDF en el equipo y registra el vínculo.
export async function POST(request) {
  const a = await getAccess(request);
  if (!a || a.role === 'patient' || !a.modules.includes('subir')) return err('No tienes permiso para subir resultados.', 403);
  if (!equipoConfigurado()) return err('El equipo del laboratorio no está configurado.', 503);

  const form = await request.formData().catch(() => null);
  const patient_id = String(form?.get('patient_id') || '');
  const title = String(form?.get('title') || '').trim();
  const file = form?.get('file');
  if (!patient_id || title.length < 3 || title.length > 120) return err('Revisa el paciente y el nombre del examen.', 400);
  if (!file || typeof file === 'string' || file.size === 0) return err('Selecciona un archivo PDF.', 400);
  if (file.size > MAX) return err('El PDF supera el máximo de 4 MB.', 413);

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 4).toString() !== '%PDF') return err('El archivo no es un PDF válido.', 400);

  const { data: patient } = await a.db.from('profiles').select('id').eq('id', patient_id).eq('role', 'patient').maybeSingle();
  if (!patient) return err('El paciente no existe.', 404);

  const name = `${patient_id}_${Date.now()}.pdf`;
  const up = await equipoGuardar(name, buffer).catch(() => null);
  if (!up || !up.ok) return err('No se pudo guardar en el equipo del laboratorio. ¿Está encendido?', 502);

  const { error } = await a.db.from('lab_results')
    .insert({ patient_id, title, file_path: name, storage: 'equipo', uploaded_by: a.user.id });
  if (error) return err('El archivo se guardó, pero no se pudo registrar.', 500);
  return NextResponse.json({ ok: true });
}
