'use client';
import { useCallback, useEffect, useState } from 'react';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../lib/useProfile';

export default function Admin() {
  const profile = useProfile('admin');
  const [patients, setPatients] = useState([]);
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({ patient_id: '', title: '', file: null });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const p = await supabase.from('profiles').select('id, full_name, document_id').eq('role', 'patient').order('full_name');
    const r = await supabase.from('lab_results')
      .select('id, title, created_at, patient:profiles!lab_results_patient_id_fkey(full_name, document_id)')
      .order('created_at', { ascending: false }).limit(20);
    setPatients(p.data || []);
    setResults(r.data || []);
  }, []);

  useEffect(() => { if (profile) load(); }, [profile, load]);

  async function upload(e) {
    e.preventDefault();
    const { patient_id, title, file } = form;
    if (!file || file.type !== 'application/pdf') return setMsg({ type: 'error', text: 'Selecciona un archivo PDF.' });
    setBusy(true); setMsg(null);
    const path = `${patient_id}/${Date.now()}.pdf`;
    const up = await supabase.storage.from('lab-results').upload(path, file, { contentType: 'application/pdf' });
    if (up.error) { setBusy(false); return setMsg({ type: 'error', text: 'No se pudo subir el archivo (máx. 10 MB).' }); }
    const ins = await supabase.from('lab_results').insert({ patient_id, title, file_path: path, uploaded_by: profile.id });
    if (ins.error) {
      await supabase.storage.from('lab-results').remove([path]);
      setMsg({ type: 'error', text: 'No se pudo registrar el resultado.' });
    } else {
      setMsg({ type: 'ok', text: 'Resultado publicado.' });
      setForm({ patient_id: '', title: '', file: null });
      e.target.reset();
      load();
    }
    setBusy(false);
  }

  if (!profile) return <p className="loading">Cargando…</p>;

  return (
    <>
      <Header profile={profile} />
      <main className="page">
        <h2>Subir resultado</h2>
        <form className="card" onSubmit={upload}>
          <label>Paciente
            <select required value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
              <option value="">Selecciona un paciente</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name} · {p.document_id || 'sin documento'}</option>)}
            </select>
          </label>
          <label>Nombre del examen<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Hemograma completo" /></label>
          <label>Archivo PDF<input type="file" accept="application/pdf" required onChange={(e) => setForm({ ...form, file: e.target.files[0] })} /></label>
          {msg && <p className={`msg ${msg.type}`} role="alert">{msg.text}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Subiendo…' : 'Publicar resultado'}</button>
        </form>

        <h2>Últimos publicados</h2>
        {results.length === 0 && <div className="empty"><p>Todavía no has publicado resultados.</p></div>}
        <ul className="list">
          {results.map((r) => (
            <li key={r.id} className="row">
              <div>
                <strong>{r.title}</strong>
                <span>{r.patient?.full_name} · {new Date(r.created_at).toLocaleDateString('es-CO', { dateStyle: 'medium' })}</span>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
