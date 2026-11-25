'use client';
import { useCallback, useEffect, useState } from 'react';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../lib/useProfile';
import { authFetch } from '../../lib/api';

// Lista de exámenes sugeridos. Edita, agrega o quita nombres aquí.
const EXAMENES = [
  'Hemograma completo', 'Glucosa en ayunas', 'Perfil lipídico', 'Colesterol total', 'Triglicéridos',
  'Creatinina', 'Uroanálisis (orina)', 'Coprológico (heces)', 'Perfil hepático', 'Perfil tiroideo (TSH)',
  'Hemoglobina glicosilada (HbA1c)', 'Ácido úrico', 'Prueba de embarazo (hCG)', 'Tiempo de protrombina (PT)',
  'Proteína C reactiva (PCR)', 'Vitamina D',
];

// MÓDULO 2 — Subir un resultado y asignarlo a un paciente (admin y superadmin).
export default function Subir() {
  const { profile, modules, denied } = useProfile('subir');
  const [cedula, setCedula] = useState('');
  const [patient, setPatient] = useState(null);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [recent, setRecent] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('lab_results')
      .select('id, title, created_at, patient:profiles!lab_results_patient_id_fkey(full_name)')
      .order('created_at', { ascending: false }).limit(8);
    setRecent(data || []);
  }, []);
  useEffect(() => { if (profile && !denied) load(); }, [profile, denied, load]);

  async function buscarPaciente() {
    setMsg(null); setPatient(null);
    const { data } = await supabase.from('profiles').select('id, full_name, document_id')
      .eq('document_id', cedula).eq('role', 'patient').maybeSingle();
    if (!data) return setMsg({ type: 'error', text: 'No existe un paciente con esa cédula.' });
    setPatient(data);
  }

  async function upload(e) {
    e.preventDefault();
    if (!patient) return setMsg({ type: 'error', text: 'Primero busca y confirma al paciente.' });
    if (!file || file.type !== 'application/pdf') return setMsg({ type: 'error', text: 'Selecciona un archivo PDF.' });
    setBusy(true); setMsg(null);
    const fd = new FormData();
    fd.append('patient_id', patient.id); fd.append('title', title); fd.append('file', file);
    const res = await authFetch('/api/archivos', { method: 'POST', body: fd });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) setMsg({ type: 'error', text: out.error || 'No se pudo publicar el resultado.' });
    else {
      setMsg({ type: 'ok', text: `Resultado publicado para ${patient.full_name}.` });
      setTitle(''); setFile(null); setPatient(null); setCedula(''); e.target.reset(); load();
    }
    setBusy(false);
  }

  if (!profile) return <p className="loading">Cargando…</p>;
  return (
    <>
      <Header profile={profile} modules={modules} />
      <main className="page">
        {denied ? <div className="empty"><p>No tienes acceso a este módulo.</p></div> : (
          <>
            <h2>Subir resultado</h2>
            <p className="sub">El PDF se guarda en el equipo del laboratorio y queda asignado al paciente.</p>
            <form className="card" onSubmit={upload}>
              <label>Cédula del paciente
                <div className="search">
                  <input required inputMode="numeric" minLength={5} maxLength={15} value={cedula}
                    onChange={(e) => { setCedula(e.target.value.replace(/\D/g, '')); setPatient(null); }} />
                  <button type="button" className="btn btn-ghost" onClick={buscarPaciente} disabled={cedula.length < 5}>Buscar</button>
                </div>
              </label>
              {patient && <p className="msg ok">Paciente: <strong>{patient.full_name}</strong></p>}
              <label>Nombre del examen
                <input required list="lista-examenes" autoComplete="off" value={title}
                  onChange={(e) => setTitle(e.target.value)} placeholder="Elige de la lista o escribe el examen" />
                <datalist id="lista-examenes">{EXAMENES.map((n) => <option key={n} value={n} />)}</datalist>
              </label>
              <label>Archivo PDF (máx. 4 MB)
                <input type="file" accept="application/pdf" required onChange={(e) => setFile(e.target.files[0])} />
              </label>
              {msg && <p className={`msg ${msg.type}`} role="alert">{msg.text}</p>}
              <button className="btn" disabled={busy}>{busy ? 'Subiendo…' : 'Publicar resultado'}</button>
            </form>

            <h2>Últimos publicados</h2>
            {recent.length === 0 && <div className="empty"><p>Todavía no hay resultados publicados.</p></div>}
            <ul className="list">
              {recent.map((r) => (
                <li key={r.id} className="row">
                  <div><strong>{r.title}</strong>
                    <span>{r.patient?.full_name} · {new Date(r.created_at).toLocaleDateString('es-CO', { dateStyle: 'medium' })}</span></div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
