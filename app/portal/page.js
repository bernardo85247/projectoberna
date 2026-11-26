'use client';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../lib/useProfile';
import { descargar } from '../../lib/api';

// MÓDULO 1 — Buscar y descargar. Paciente: ve lo suyo. Admin/superadmin: buscan por cédula.
export default function Buscar() {
  const { profile, modules, denied } = useProfile('buscar');
  const staff = profile && profile.role !== 'patient';
  const [cedula, setCedula] = useState('');
  const [patient, setPatient] = useState(null);
  const [results, setResults] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState('');

  async function cargar(p) {
    const { data, error } = await supabase.from('lab_results').select('id, title, created_at')
      .eq('patient_id', p.id).order('created_at', { ascending: false });
    if (error) return setMsg('No pudimos cargar los resultados.');
    setPatient(p); setResults(data);
  }

  useEffect(() => { if (profile && !staff && !denied) cargar(profile); }, [profile]); // eslint-disable-line

  async function buscar(e) {
    e.preventDefault();
    setMsg(null); setResults(null); setPatient(null);
    const { data } = await supabase.from('profiles').select('id, full_name, document_id')
      .eq('document_id', cedula).eq('role', 'patient').maybeSingle();
    if (!data) return setMsg('No encontramos un paciente con esa cédula.');
    cargar(data);
  }

  async function bajar(r) {
    setBusy(r.id); setMsg(null);
    try { await descargar(r.id, r.title); } catch { setMsg('No pudimos descargar el archivo. Intenta de nuevo.'); }
    setBusy('');
  }

  if (!profile) return <p className="loading">Cargando…</p>;
  return (
    <>
      <Header profile={profile} modules={modules} />
      <main className="page">
        {denied ? <div className="empty"><p>No tienes acceso a este módulo.</p></div> : (
          <>
            <h2>{staff ? 'Buscar resultados' : 'Mis resultados'}</h2>
            <p className="sub">{staff ? 'Escribe la cédula del paciente para ver sus exámenes.' : `Cédula ${profile.document_id || ''}`}</p>
            {staff && (
              <form className="card search" onSubmit={buscar}>
                <input required inputMode="numeric" minLength={5} maxLength={15} placeholder="Número de cédula"
                  value={cedula} onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))} />
                <button className="btn">Buscar</button>
              </form>
            )}
            {msg && <p className="msg error">{msg}</p>}
            {patient && staff && <p className="sub"><strong>{patient.full_name}</strong> · {patient.document_id}</p>}
            {results && results.length === 0 && <div className="empty"><p>No hay resultados publicados todavía.</p></div>}
            <ul className="list">
              {(results || []).map((r) => (
                <li key={r.id} className="row">
                  <div>
                    <strong>{r.title}</strong>
                    <span>{new Date(r.created_at).toLocaleDateString('es-CO', { dateStyle: 'long' })}</span>
                  </div>
                  <button className="btn btn-sm" disabled={busy === r.id} onClick={() => bajar(r)}>
                    {busy === r.id ? 'Descargando…' : 'Descargar PDF'}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
