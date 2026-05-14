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

- **Superadmin**: hardcoded en el trigger SQL `handle_new_user`. El email `1.del.198333@gmail.com` siempre se promociona a `role='superadmin'` la primera vez que aparece en `auth.users`. Si cambiase, hay que actualizar el trigger en `supabase/schema.sql` y reaplicar el SQL.
- **Bootstrap**: cuando un usuario nuevo se crea en `auth.users` (por signUp del lado cliente, por Add user en Dashboard o por el Edge Function `admin-create-user` que está pendiente), el trigger crea su fila en `profiles` con `role='student'` (o `superadmin` si coincide email).
- **Trigger de protección**: `enforce_profile_protection` impide que un alumno cambie su `role` o `course_ids` aunque RLS lo dejase pasar. Solo `is_superadmin()` puede modificar esos campos.

### Cambio de contraseña — tres flujos distintos

| Flujo | Quién | Página/acción | Implementación |
|-------|-------|---------------|----------------|
| **Usuario cambia la suya** | cualquier user logado | `/account/password` (link en dropdown del nav) | `supabase.auth.updateUser({ password })` en cliente directo |
| **Admin define la de otro usuario** | superadmin | botón "cambiar pwd" en cada fila de `/admin` | Edge Function `admin-set-password` (usa `service_role`) |
| **Reset por email** | (deshabilitado) | — | Existía via `resetPasswordForEmail` pero la retiramos: hit del rate limit de email de Supabase Free. Si vuelve a hacer falta, hay que rehacer la pantalla `/reset-password` y el link "Olvidaste tu contraseña" en `Login.tsx` que fue eliminado. |

El flujo del admin (segunda fila) es el patrón canónico para operaciones privilegiadas: cliente invoca Edge Function → función verifica `profile.role === 'superadmin'` server-side → solo entonces usa `service_role` para llamar `auth.admin.updateUserById`. Replicar este patrón para cualquier futura acción admin sensible.

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

El build de Vercel ejecuta primero `npm run build:content` (parsea `content/*.md` → `src/content/courses.json`) y luego `vite build`, así que producción nunca queda con JSON viejo.

Bundle actual: ~850 KB raw / ~250 KB gzip. Subió desde ~650 KB cuando añadimos `react-markdown` + `remark-gfm` para el render del contenido de los módulos. Por encima del warning de Vite (500 KB). Cuando moleste, opciones:
- `import()` dinámico de `MarkdownContent` y `CourseViewer` (la mayoría del bundle es para esa ruta)
- `manualChunks` para separar vendor de app

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

- Sin servidor propio: todo cliente + Supabase como BaaS. Si se necesita lógica protegida (creación admin de usuarios sin email, cambio de password forzado por admin), usar Supabase Edge Functions, NO un backend custom.
- Snake_case en TS para evitar capas de mapeo entre DB y app.
- Realtime via `supabase.channel().on('postgres_changes', ...)`, NO polling. Solo una suscripción por recurso para evitar bucles de escritura tipo "lastLoginAt loop" que tuvimos con Firebase (el síntoma: la UI re-renderiza constantemente, los clicks parecen no hacer nada).
- Login persiste rutas: `<Navigate to="/login" state={{ from: location.pathname }} replace />` para que tras login vuelva a donde el usuario quería.
- Contenido del curso en Markdown, no en DB: cambios versionados en git, fácil de revisar y revertir. La trade-off es que cada cambio requiere un commit + push (Vercel desplega en ~1 min). Si en algún momento se necesita edición en vivo desde la propia app, ver "Decisiones pendientes".
- Skill `/content` en `.claude/skills/content/SKILL.md` para el workflow de editado: valida, parsea, lint y propone commit. NO automatiza el push sin confirmación. El script `build-content.ts` es el motor; la skill es el operador inteligente encima.

## Decisiones pendientes

Cosas planteadas y discutidas con el usuario, sin decisión firme todavía. Cuando una se materialice, mover de aquí a la sección que corresponda.

### Pantallazos en el contenido (planteado 2026-05-14)
El usuario quiere insertar screenshots dentro de los módulos. Tres opciones evaluadas:
- **A) URL externa libre** (Imgur, CDN): pegas URL en el `.md`. Cero código, máxima fricción operativa.
- **B) Supabase Storage manual**: bucket en Supabase, subes drag-and-drop desde Dashboard, copias URL pública, pegas en MD. Sin código de app.
- **C) Widget de upload en `/admin`** (⭐ recomendado): bucket en Supabase + componente que sube + devuelve snippet de markdown listo para copiar. ~40 min de código.

El usuario dijo "me lo pienso". Si elige C, los pasos son:
1. SQL en Supabase Editor para crear bucket `course-content` (public) + policies que permiten INSERT/UPDATE/DELETE solo a superadmin
2. Componente en `/admin` que sube via `supabase.storage.from('course-content').upload(...)` y muestra el snippet `![alt](publicUrl)` con botón "Copiar"
3. Actualizar `content/CONTENT_GUIDE.md` con la convención para imágenes

### Editor de contenido in-app (planteado 2026-05-14)
El usuario preguntó si compensa construir un editor en la app para modificar el contenido sin tener que tocar git localmente. Mi recomendación: **NO TODAVÍA**. Mientras sea un único admin, GitHub web (botón ✏️ en cualquier `.md`) le da editor con preview de Markdown + commit one-click + Vercel desplega solo. Coste cero, suficiente.

Si más adelante el usuario reporta fricción real con github.com edit, las opciones son (de menos a más esfuerzo):
- Editor in-app que escribe al repo via GitHub API (necesita Edge Function que guarde un PAT)
- Migrar el contenido a tablas Supabase (`courses_db`, `sessions_db`, `modules_db`) + CMS en `/admin`. Pierde versionado en git, gana edición real-time sin deploys.

### Otros pendientes menores
- **Syntax highlighting** en bloques de código de los módulos. `MarkdownContent` los renderiza monoespaciados sobre fondo oscuro pero sin colores. Candidatos: `shiki` (mejor pero pesado), `prism-react-renderer` (más ligero). Lazy-load para no engordar bundle inicial.
- **Recordar última sesión vista** en `CourseViewer` (ahora siempre arranca en sesión 1).
- **Edge Function `admin-create-user`** para crear users desde `/admin` sin email confirmation, resolviendo el rate limit de Supabase Free. Ver sección Edge Functions arriba.
- **Google OAuth** en Login. Necesita OAuth credentials en Google Cloud Console (cuenta personal del usuario) y configurarlas en Supabase Auth → Providers → Google.

## Cuando algo va mal

- **Usuario logado pero no entra**: verificar que existe su fila en `public.profiles` y que `email_confirmed_at` no es null en `auth.users`. Si falta el confirmed: `update auth.users set email_confirmed_at = now() where email = '...'`.
- **"permission denied" en queries Supabase**: revisar policies en `supabase/schema.sql` y que `public.is_superadmin()` devuelve lo esperado para el usuario en cuestión. Las policies se aplican client-side por Supabase, así que un fallo se ve como respuesta vacía (no como excepción).
- **Build de Vercel rompe pero local OK**: comprobar que las env vars `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están en Vercel para los 3 entornos (Production, Preview, Development).
- **`/admin → cambiar pwd` da "Failed to send a request to the Edge Function"**: la función `admin-set-password` no está deployada en Supabase, o está deployada con otro nombre. El nombre exacto en Dashboard tiene que ser `admin-set-password` (con guiones, minúscula). Ver sección Edge Functions.
- **"email rate limit exceeded" al crear usuarios desde `/admin`**: el toggle "Confirm email" sigue ON en Supabase. Apagar en Auth → Providers → Email. Mientras, crear via Dashboard → Users → Add user → ✅ Auto Confirm.
- **Módulo no aparece en la web tras editar `.md`**: no se ejecutó `npm run build:content`. El build de prod lo lanza solo, pero `npm run dev` lee el JSON estáticamente — hay que regenerarlo y refrescar.
- **Edge Function devuelve `Forbidden: caller is not superadmin`**: la fila de `public.profiles` del caller no tiene `role='superadmin'`. Si el caller es el bootstrap superadmin (`1.del.198333@gmail.com`), comprobar que el trigger `handle_new_user` aplicó correctamente — debería pasar automáticamente en su primer signup.
