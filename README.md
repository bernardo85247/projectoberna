# LabClaro

1. `npm install`
2. Copia `.env.example` a `.env.local` y pega tu publishable (anon) key de Supabase.
3. `npm run dev`
4. En Vercel: importa el repo y agrega las dos variables de entorno `NEXT_PUBLIC_*`.

## Crear un usuario administrativo
Registra la cuenta desde la página y luego, en el SQL Editor de Supabase:

    update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'correo@del.admin');

## Servidor de archivos (en tu PC)
Los PDF se guardan en una carpeta de tu equipo, no en Supabase.

1. Instala Node.js 18+.
2. `cd server && npm install`, copia `.env.example` a `.env` y completa los valores (clave, carpeta `FILES_DIR`, dominio de Vercel en `ALLOWED_ORIGIN`).
3. `npm start` (déjalo corriendo; el PC debe estar encendido para que los pacientes descarguen).
4. Exponlo a internet con Cloudflare Tunnel: `cloudflared tunnel --url http://localhost:4000` entrega una URL https.
   (Esa URL cambia cada vez; para una fija usa un túnel con nombre y un dominio en Cloudflare.)
5. En Vercel define `NEXT_PUBLIC_FILES_URL` con esa URL y vuelve a desplegar.
6. Haz copias de seguridad periódicas de la carpeta de resultados.
