'use client';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../lib/useProfile';

export default function Portal() {
  const profile = useProfile('patient');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profile) return;
    supabase.from('lab_results').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => (error ? setError('No pudimos cargar tus resultados.') : setResults(data)));
  }, [profile]);

  async function download(r) {
    const name = `${r.title.replace(/[^\w\-]+/g, '_')}.pdf`;
    const { data, error } = await supabase.storage.from('lab-results').createSignedUrl(r.file_path, 60, { download: name });
    if (error) return setError('No pudimos descargar el archivo. Intenta de nuevo.');
    window.location.href = data.signedUrl;
  }

  if (!profile) return <p className="loading">Cargando…</p>;

  return (
    <>
      <Header profile={profile} />
      <main className="page">
        <h2>Mis resultados</h2>
        {error && <p className="msg error">{error}</p>}
        {results && results.length === 0 && (
          <div className="empty"><p>Aún no tienes resultados disponibles. Cuando el laboratorio los publique, aparecerán aquí.</p></div>
        )}
        <ul className="list">
          {(results || []).map((r) => (
            <li key={r.id} className="row">
              <div>
                <strong>{r.title}</strong>
                <span>{new Date(r.created_at).toLocaleDateString('es-CO', { dateStyle: 'long' })}</span>
              </div>
              <button className="btn" onClick={() => download(r)}>Descargar PDF</button>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
