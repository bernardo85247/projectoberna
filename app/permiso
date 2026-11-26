'use client';
import { useCallback, useEffect, useState } from 'react';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../lib/useProfile';
import { authFetch } from '../../lib/api';
import { ROLES, MODULOS, PERMITIDOS } from '../../lib/roles';

// MÓDULO 3 — Permisos (solo superadmin): rol de cada usuario y módulos de cada rol.
export default function Permisos() {
  const { profile, modules, denied } = useProfile('permisos');
  const [users, setUsers] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [filter, setFilter] = useState('');
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    const u = await supabase.from('profiles').select('id, full_name, document_id, email, role').order('full_name');
    const m = await supabase.from('role_modules').select('role, module');
    setUsers(u.data || []);
    setMatrix((m.data || []).map((x) => `${x.role}:${x.module}`));
  }, []);
  useEffect(() => { if (profile && !denied) load(); }, [profile, denied, load]);

  async function send(body, okText) {
    setMsg(null);
    const res = await authFetch('/api/permisos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const out = await res.json().catch(() => ({}));
    setMsg(res.ok ? { type: 'ok', text: okText } : { type: 'error', text: out.error || 'No se pudo guardar.' });
    load();
  }

  if (!profile) return <p className="loading">Cargando…</p>;
  const shown = users.filter((u) => `${u.full_name} ${u.document_id || ''} ${u.email || ''}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <Header profile={profile} modules={modules} />
      <main className="page">
        {denied ? <div className="empty"><p>Solo el superadmin puede entrar aquí.</p></div> : (
          <>
            <h2>Permisos por rol</h2>
            <p className="sub">Activa o desactiva qué módulos puede usar cada rol. El superadmin siempre tiene acceso a todo.</p>
            <div className="card table-wrap">
              <table className="table">
                <thead><tr><th>Módulo</th>{Object.keys(ROLES).map((r) => <th key={r}>{ROLES[r]}</th>)}</tr></thead>
                <tbody>
                  {Object.entries(MODULOS).map(([k, m]) => (
                    <tr key={k}>
                      <td>{m.label}</td>
                      {Object.keys(ROLES).map((r) => {
                        const fijo = r === 'superadmin';
                        const posible = fijo || PERMITIDOS[r].includes(k);
                        const on = fijo || matrix.includes(`${r}:${k}`);
                        return (
                          <td key={r}>
                            {posible ? (
                              <input type="checkbox" className="switch" checked={on} disabled={fijo}
                                onChange={(e) => send({ type: 'module', role: r, module: k, enabled: e.target.checked }, 'Permiso actualizado.')} />
                            ) : <span className="muted">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Usuarios</h2>
            <input className="filter" placeholder="Buscar por nombre, cédula o correo" value={filter} onChange={(e) => setFilter(e.target.value)} />
            {msg && <p className={`msg ${msg.type}`} role="alert">{msg.text}</p>}
            <div className="card table-wrap">
              <table className="table">
                <thead><tr><th>Nombre</th><th>Cédula</th><th>Correo</th><th>Rol</th></tr></thead>
                <tbody>
                  {shown.map((u) => (
                    <tr key={u.id}>
                      <td>{u.full_name}</td><td>{u.document_id || '—'}</td><td>{u.email}</td>
                      <td>
                        <select value={u.role} disabled={u.id === profile.id}
                          onChange={(e) => send({ type: 'role', user_id: u.id, role: e.target.value }, `Rol de ${u.full_name} actualizado.`)}>
                          {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </>
  );
}
