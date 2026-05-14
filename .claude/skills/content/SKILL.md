---
name: content
description: Validates, parses and ships changes to Golive Academy course content. Use whenever the user adds or edits Markdown files under content/, says "actualiza el contenido", "lanza el parser", "valida el contenido", "publica el curso", or refers to dropping a new session/module file. Runs the build, lints, and offers to commit + push.
---

# /content — Golive Academy content workflow

Golive Academy's course copy lives in Markdown under `content/`. A script (`scripts/build-content.ts`) parses it into `src/content/courses.json`, which the app imports. Your job when this skill is invoked is to (1) make sure the content is healthy, (2) regenerate the JSON, (3) verify types and bundle, and (4) hand the user a clean commit ready to push.

Read `content/CONTENT_GUIDE.md` for the format spec — it is the source of truth. Do not invent fields.

## Steps

1. **Diff the surface area.** Run `git status content/` to see which course/session files are new or modified. If nothing changed under `content/`, ask the user whether they intended to invoke the skill — they may have meant something else.

2. **Validate the Markdown.** For each touched session file:
   - Frontmatter must have `id` (number) and `title` (string). Without them the parser errors out.
   - Each `## Modulo N — ...` block should have a `**Descripcion breve:** ...` line. If missing, the parser falls back to "Módulo N" which looks placeholder-y in the UI — surface this as a warning, not a hard fail.
   - Each module should ideally include `### Contexto`, `### Pasos`, `### Resultado esperado`. Flag missing ones but don't block on them — some modules legitimately don't fit that shape.
   - Code blocks should declare a language after the backticks (`python`, `yaml`, `bash`, etc.).
   - Watch for unmatched fences (odd number of ``` lines in a block).
   For each touched `_course.md`: must have `title`, `instructor`, `category`, and an `image` URL.

3. **If you find issues, report them BEFORE running the parser.** Group them by file with line numbers if useful. Ask the user whether to fix them now (offer concrete edits) or proceed as-is.

4. **Run the parser.** `npm run build:content`. The script prints a per-course summary. Verify it doesn't crash. If it does, the error usually points at a malformed file — go fix and re-run.

5. **Type-check.** `npm run lint` (which is `tsc --noEmit`). This catches drift between the JSON shape and `Course` / `Session` / `Step` types.

6. **Vite build (only if the diff touches more than trivial copy).** `npm run build`. Optional but cheap. If the bundle grows oddly (>50% bigger), flag it.

7. **Summarize.** Tell the user:
   - Which sessions/modules were added, modified or removed (by title, not just file name).
   - The total step count per course before/after.
   - Any warnings you surfaced in step 2 that they chose to leave.

8. **Offer commit + push.** Suggest a commit message that names the affected courses and the kind of change ("add session 2 modules for AG2", "refine descriptions in agentes-ia-2025 session 1", etc.). Ask explicit confirmation before running `git commit && git push`. Use HEREDOC for the commit body. Always include the standard `Co-Authored-By` trailer.

## Things to remember

- **Never edit `src/content/courses.json` directly.** It is generated. If something looks wrong in the JSON, the source Markdown is what needs fixing.
- **Step IDs are slug-based** (`s<sessionId>-<slug-from-title>`). Renaming a module title invalidates the old ID and orphans existing user progress in Supabase. Surface this risk to the user when they rename titles.
- The Vite `build` step already runs `build:content` first, so production deploys can't ship stale JSON. But running `build:content` explicitly is still useful during development because Vite's dev server reads the JSON statically.
- The `.md` files use snake-style filenames (`sesion-1-claude-managed-agents.md`). The numeric prefix matters because the parser sorts sessions by the `id` in the frontmatter — keep them aligned for human readability.
- If the user dropped a brand new course folder, double-check `_course.md` exists and points at a real `image` URL. Broken images break the portal grid silently.

## When NOT to use this skill

- The user is editing app code (React components, Supabase, auth). That's outside content scope.
- The user asks "what courses do we have?" — just read the data, don't run the parser.
- The user wants to migrate content TO a different storage (Supabase Storage, CMS). That's a separate design discussion.
