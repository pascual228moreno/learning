# Golive Academy — guía rápida para Claude

Plataforma de formación generalista de Golive. Las asistentes a un curso se logan con email + password, ven los cursos que el superadmin les ha asignado, marcan progreso paso a paso y dejan comentarios por sesión.

## Stack

- **Frontend**: React 19 + TypeScript + Vite 6, Tailwind v4 con tema `golive` rojo `#E3000F`, Motion para animaciones, lucide-react, react-router-dom v7.
- **Backend**: Supabase (Auth + Postgres + Realtime + RLS). NO Firebase (descartado).
- **Hosting**: Vercel (auto-deploy en cada push a `main`).
- **Repo**: https://github.com/pascual228moreno/learning
- **URL prod**: https://learning-vert-delta.vercel.app

## Comandos

```bash
npm install        # primera vez
npm run dev        # servidor local en :3000
npm run build      # build producción → dist/
npm run lint       # tsc --noEmit (solo type-check)
```

Sin tests automatizados todavía.

## Estructura

```
src/
├── App.tsx                    # Router + AuthProvider; mínimo
├── main.tsx                   # Entry point (StrictMode)
├── data.ts                    # FUENTE DE CONTENIDO: cursos, sesiones, pasos, ejercicios
├── types.ts                   # Tipos compartidos (Course, Session, Step, UserProfile, ...)
├── index.css                  # Tailwind + tema Golive
├── vite-env.d.ts              # Tipos de import.meta.env
├── lib/
│   ├── supabase.ts            # Cliente Supabase + helper cliente aislado
│   ├── utils.ts               # cn() (clsx + tailwind-merge)
│   └── admin-actions.ts       # createUser, updateUserCourses, generatePassword
├── contexts/
│   └── AuthContext.tsx        # Sesión Supabase + perfil + suscripción realtime
├── components/
│   ├── Navigation.tsx
│   ├── LogoutConfirmModal.tsx
│   └── CommentsSection.tsx
└── pages/
    ├── Landing.tsx            # /
    ├── Login.tsx              # /login — email/password + botón Google (deshabilitado por ahora)
    ├── Portal.tsx             # /portal — lista cursos asignados
    ├── CourseViewer.tsx       # /course/:id — sesiones, pasos, progreso
    ├── Admin.tsx              # /admin — crear usuarios, asignar cursos (solo superadmin)
    └── NoAccess.tsx           # /no-access — pantalla de bloqueo

supabase/
└── schema.sql                 # Tablas + triggers + RLS — referencia, ya está aplicado en el proyecto
```

## Modelo de datos en Supabase

3 tablas en `public/`, todas con RLS habilitada y publicadas a Realtime:

- **`profiles`** (extiende `auth.users`): `id` (uuid), `email`, `display_name`, `photo_url`, `role` (`student` | `superadmin`), `course_ids` (text[]), timestamps.
- **`progress`**: `user_id`, `course_id`, `step_id`, `completed`. Único por `(user_id, step_id)`.
- **`comments`**: `user_id`, `user_name`, `user_photo`, `course_id`, `session_id`, `text`, `created_at`.

Snake_case en DB y en TS, sin capa de mapeo.

## Auth y roles

- **Superadmin**: hardcoded en `firestore.rules`-style en el trigger SQL `handle_new_user`. El email `1.del.198333@gmail.com` siempre se promociona a `role='superadmin'` la primera vez que firma. Si cambiase, hay que actualizar el trigger en `supabase/schema.sql:65` y reaplicar el SQL.
- **Bootstrap**: cuando un usuario nuevo se crea en `auth.users` (por signUp del lado cliente o por Add user en Dashboard), el trigger crea su fila en `profiles` con `role='student'` (o `superadmin` si coincide email).
- **Trigger de protección**: `enforce_profile_protection` impide que un alumno cambie su `role` o `course_ids` aunque RLS lo dejase pasar. Solo `is_superadmin()` puede modificar esos campos.

## Cómo añadir un curso o sesión nuevos (contenido)

**Modelo actual**: contenido estático en `src/data.ts` (typed por `Course[]` de `types.ts`). Para añadir contenido:

1. Abrir `src/data.ts`
2. Añadir un objeto al array `courses`:
   ```ts
   {
     id: 'curso-id-unico',          // usado en URLs y en course_ids del perfil
     title: '...',
     description: '...',
     instructor: 'Golive Team',
     category: '...',
     image: 'https://...',
     sessions: [
       {
         id: 1,
         title: '...',
         date: 'Viernes 15 mayo',
         objectives: [...],
         script: [
           { id: 's1-1', title: '...', duration: '30 min', description: '...', resources: [...] }
         ],
         exercises: [...],
         takeaways: [...]
       }
     ]
   }
   ```
3. Asignar acceso al curso desde `/admin` (`course_ids` del perfil de cada alumno).

**A futuro** (no implementado): migrar a un sistema de archivos Markdown en `content/`, parseados por un script que regenere `data.ts` (o se sirva on-demand desde Supabase Storage). Diseño pendiente.

## Variables de entorno

`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. La clave es formato nuevo `sb_publishable_*` (compatible con el SDK).

- Local: `.env.local` (gitignored). Ver `.env.example` para el formato.
- Vercel: las mismas dos en Production + Preview + Development.

## Deploy

`git push origin main` → Vercel construye y publica solo. `vercel.json` añade rewrite SPA para que `/portal`, `/course/*`, etc. sirvan `index.html` y deje a React Router resolver.

Bundle actual: ~650 KB raw / ~190 KB gzip. Si crece mucho, partir con `manualChunks` o `import()` dinámicos.

## Gotchas activos

- **Rate limit de email en Supabase Free**: si "Confirm email" está ON en Auth → Providers → Email, cada signUp() desde `/admin` intenta mandar email → 4 emails/h máximo y se bloquea. Workaround: crear usuarios desde Supabase Dashboard → Authentication → Users con ✅ Auto Confirm. Plan a futuro: Edge Function con `service_role` que use `auth.admin.createUser({ email_confirm: true })`.
- **Botón Google en Login**: el provider Google no está activado en Supabase. Click muestra `400 Unsupported provider`. Pendiente: configurar OAuth credentials en Google Cloud Console (cuenta personal) y conectar en Supabase.
- **CourseViewer fija session 1 al entrar**: si quieres recordar última sesión vista, hay que persistirla.

## Decisiones de diseño

- Sin servidor propio: todo cliente + Supabase como BaaS. Si se necesita lógica protegida (creación admin de usuarios sin email), usar Supabase Edge Functions, NO un backend custom.
- Snake_case en TS para evitar capas de mapeo entre DB y app.
- Realtime via `supabase.channel().on('postgres_changes', ...)`, NO polling. Solo una suscripción por recurso para evitar bucles de escritura tipo "lastLoginAt loop" que tuvimos con Firebase (el síntoma: la UI re-renderiza constantemente, los clicks parecen no hacer nada).
- Login persiste rutas: `<Navigate to="/login" state={{ from: location.pathname }} replace />` para que tras login vuelva a donde el usuario quería.

## Cuando algo va mal

- **Usuario logado pero no entra**: verificar que existe su fila en `public.profiles` y que `email_confirmed_at` no es null en `auth.users`. Si falta el confirmed: `update auth.users set email_confirmed_at = now() where email = '...'`.
- **"permission denied" en Firestore/queries**: revisar policies en `supabase/schema.sql` y que `public.is_superadmin()` devuelve lo esperado para el usuario en cuestión.
- **Build de Vercel rompe pero local OK**: comprobar que las env vars `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están en Vercel para los 3 entornos.
