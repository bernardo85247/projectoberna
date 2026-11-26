import { NextResponse } from 'next/server';
import { getAccess, equipoObtener } from '../../../../lib/server';

export const dynamic = 'force-dynamic';
const err = (m, s) => NextResponse.json({ error: m }, { status: s });

// Descargar un resultado. El paciente solo puede bajar los suyos.
export async function GET(request, { params }) {
  const { id } = await params;
  const a = await getAccess(request);
  if (!a || !a.modules.includes('buscar')) return err('Sin permiso.', 403);

  const { data: r } = await a.db.from('lab_results').select('patient_id, file_path, storage').eq('id', id).maybeSingle();
  if (!r || (a.role === 'patient' && r.patient_id !== a.user.id)) return err('No encontrado.', 404);

  let up;
  if (r.storage === 'supabase') { // resultados antiguos, guardados en Supabase Storage
    const { data } = await a.db.storage.from('lab-results').createSignedUrl(r.file_path, 60);
    up = data ? await fetch(data.signedUrl) : null;
  } else {
    up = await equipoObtener(r.file_path).catch(() => null);
  }
  if (!up || !up.ok) return err('No pudimos obtener el archivo. Intenta más tarde.', 502);

  return new Response(up.body, { headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store' } });
}
