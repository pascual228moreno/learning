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
├── data.ts                    # Re-exporta el JSON generado a src/content/
├── types.ts                   # Tipos compartidos (Course, Session, Step, UserProfile, ...)
├── index.css                  # Tailwind + tema Golive + estilos .markdown-content
├── vite-env.d.ts              # Tipos de import.meta.env
├── content/
│   └── courses.json           # GENERADO por scripts/build-content.ts — no editar a mano
├── lib/
│   ├── supabase.ts            # Cliente Supabase + helper cliente aislado
│   ├── utils.ts               # cn() (clsx + tailwind-merge)
│   └── admin-actions.ts       # createUser, updateUserCourses, setUserPassword, generatePassword
├── contexts/
│   └── AuthContext.tsx        # Sesión Supabase + perfil + suscripción realtime
├── components/
│   ├── Navigation.tsx
│   ├── LogoutConfirmModal.tsx
│   ├── CommentsSection.tsx
│   └── MarkdownContent.tsx    # Render de contenido Markdown de los módulos
└── pages/
    ├── Landing.tsx            # /
    ├── Login.tsx              # /login — email/password (Google botón deshabilitado)
    ├── Portal.tsx             # /portal — lista cursos asignados
    ├── CourseViewer.tsx       # /course/:id — sesiones, pasos, progreso
    ├── Admin.tsx              # /admin — crear usuarios, asignar cursos, cambiar pwd
    ├── ChangePassword.tsx     # /account/password — self-service
    └── NoAccess.tsx           # /no-access — pantalla de bloqueo

content/                       # FUENTE de cursos en Markdown — ver content/CONTENT_GUIDE.md
├── CONTENT_GUIDE.md
└── <course-id>/
    ├── _course.md
    └── sesion-<id>-<slug>.md

scripts/
└── build-content.ts           # Parser .md → src/content/courses.json

supabase/
├── schema.sql                 # Tablas + triggers + RLS — referencia, ya aplicado al proyecto
└── functions/
    └── admin-set-password/    # Edge Function (Deno) para cambiar passwords desde /admin

.claude/skills/
└── content/SKILL.md           # Skill /content para validar y desplegar contenido nuevo
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

**Modelo actual**: el contenido vive en `content/` como Markdown. Un script lo parsea y `src/data.ts` lo importa.

```
content/
├── CONTENT_GUIDE.md                 ← guía completa de formato
├── <course-id>/
│   ├── _course.md                   ← frontmatter del curso (title, instructor, image…)
│   └── sesion-<id>-<slug>.md        ← una sesión = un archivo
```

**Flujo:**
1. Crea/edita el `.md` que toque dentro de `content/` (sintaxis en `content/CONTENT_GUIDE.md`)
2. `npm run build:content` regenera `src/content/courses.json`
3. `npm run dev` para verificar visualmente
4. Commit + push → Vercel desplega (el `npm run build` ya ejecuta `build:content` por dentro, así que producción nunca se queda con JSON viejo)

**O usa la skill**: si trabajas con Claude Code en este repo, invoca `/content` y se encarga de validar, parsear, lint y proponer commit. La skill vive en `.claude/skills/content/SKILL.md`.

**No edites NUNCA** `src/content/courses.json` ni `src/data.ts` para añadir contenido. Son archivos generados / wrappers, no fuentes.

### IDs de módulos y progreso

El parser deriva el ID de cada módulo como `s<sessionId>-<slug-del-titulo>` (ej. `s1-introduccion-a-la-consola-de-anthropic`). Renombrar el título cambia el slug → el progreso del usuario para ese módulo se queda huérfano en Supabase (no rompe nada, pero el alumno tiene que volver a marcarlo). Renombra solo cuando reescribas significativamente el módulo.

### Renderizado en la UI

Cuando un step tiene `content` (Markdown), `CourseViewer` lo renderiza vía `MarkdownContent` (`react-markdown` + `remark-gfm`). Estilos en `src/index.css` bajo `.markdown-content`. Sin syntax highlighting todavía (los bloques de código se ven monoespaciados sobre fondo oscuro pero sin colores por lenguaje).

## Variables de entorno

`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. La clave es formato nuevo `sb_publishable_*` (compatible con el SDK).

- Local: `.env.local` (gitignored). Ver `.env.example` para el formato.
- Vercel: las mismas dos en Production + Preview + Development.

## Deploy

`git push origin main` → Vercel construye y publica solo. `vercel.json` añade rewrite SPA para que `/portal`, `/course/*`, etc. sirvan `index.html` y deje a React Router resolver.

Bundle actual: ~650 KB raw / ~190 KB gzip. Si crece mucho, partir con `manualChunks` o `import()` dinámicos.

## Edge Functions (Supabase)

Vive en `supabase/functions/*/index.ts`. Cada función es una carpeta con su `index.ts` (runtime Deno).

**Funciones desplegadas:**

- **`admin-set-password`** — permite a un superadmin definir directamente la contraseña de cualquier usuario, sin enviar emails (esquiva el rate limit de Supabase free). Verifica el role del caller server-side antes de usar `service_role` para llamar `auth.admin.updateUserById`. Se invoca desde `src/lib/admin-actions.ts:setUserPassword()` con `supabase.functions.invoke('admin-set-password', { body: { userId, newPassword } })`.

**Despliegue (sin CLI, vía Dashboard):**

1. https://supabase.com/dashboard/project/kphzcfxelqyxfiohyhnk/functions
2. **Deploy a new function** → nombre exacto = nombre de la carpeta en `supabase/functions/`
3. Pegar el contenido de `index.ts` en el editor → Deploy

⚠️ **El nombre debe coincidir exactamente** con el string que pasa `supabase.functions.invoke()`. Si renombras la función en Dashboard, hay que actualizar el código.

**Env vars auto-inyectadas (no configurar a mano):** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. El `service_role` JAMÁS sale del entorno de la Edge Function — por eso este patrón es seguro.

**Patrón para añadir más funciones admin:**
1. Crear `supabase/functions/admin-X/index.ts` con código Deno
2. Validar Authorization header → recuperar caller con anon client
3. Comprobar `profiles.role === 'superadmin'`
4. Solo entonces, crear admin client con `SUPABASE_SERVICE_ROLE_KEY` y hacer la operación privilegiada
5. Deploy desde Dashboard con el mismo nombre que la carpeta
6. Llamar desde `src/lib/admin-actions.ts`

Candidata clara siguiente: `admin-create-user` para crear usuarios desde `/admin` sin disparar emails (`auth.admin.createUser({ email_confirm: true })`), resolviendo el rate limit.

## Gotchas activos

- **Rate limit de email en Supabase Free** al CREAR usuarios desde `/admin`: si "Confirm email" está ON en Auth → Providers → Email, cada signUp() intenta mandar email → 4 emails/h máximo y se bloquea. Workaround actual: crear usuarios desde Supabase Dashboard → Authentication → Users con ✅ Auto Confirm. Solución definitiva: implementar `admin-create-user` Edge Function (ver sección Edge Functions arriba).
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
