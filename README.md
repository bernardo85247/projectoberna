# LabClaro

1. `npm install`
2. Copia `.env.example` a `.env.local` y pega tu publishable (anon) key de Supabase.
3. `npm run dev`
4. En Vercel: importa el repo y agrega las dos variables de entorno `NEXT_PUBLIC_*`.

## Crear un usuario administrativo
Registra la cuenta desde la página y luego, en el SQL Editor de Supabase:

    update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'correo@del.admin');
