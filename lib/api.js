import { supabase } from './supabase';

// fetch que envía el token de la sesión para que el servidor sepa quién es el usuario.
export async function authFetch(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${session?.access_token || ''}` },
  });
}

export async function descargar(id, title) {
  const res = await authFetch(`/api/archivos/${id}`);
  if (!res.ok) throw new Error('descarga');
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^\w\-]+/g, '_')}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
