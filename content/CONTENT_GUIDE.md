# Guía de contenido — Golive Academy

Esta carpeta es la **fuente de verdad** del contenido de los cursos. Cada vez que añadas o modifiques un curso, sesión o módulo aquí, el script `npm run build:content` regenera `src/content/courses.json` y la app lo recoge en el siguiente build.

> Reglas de oro
> 1. NUNCA edites `src/content/courses.json` a mano. Es un archivo generado.
> 2. NUNCA edites `src/data.ts` para añadir contenido. Solo importa el JSON.
> 3. SIEMPRE edita el Markdown aquí y deja al parser hacer su trabajo.

---

## Estructura de carpetas

```
content/
├── CONTENT_GUIDE.md                 ← este documento
└── <course-id>/                     ← un curso = una carpeta. El nombre es el courseId.
    ├── _course.md                   ← metadata del curso (obligatorio)
    └── sesion-<id>-<slug>.md        ← una sesión = un archivo (obligatorio el formato del nombre)
```

- **`<course-id>`** es lo que aparece en la URL: `/course/agentes-ia-2025`
- **`<id>`** de la sesión es un número (`1`, `2`, `3`…). Debe coincidir con el `id` del frontmatter.
- **`<slug>`** descriptivo en kebab-case, ej. `claude-managed-agents-i`. Solo es etiqueta humana, el parser no lo lee.

---

## Anatomía de `_course.md`

```markdown
---
title: Especialista en Agentes de IA
description: Domina la construcción de sistemas autónomos con Claude, AG2 y más.
instructor: Golive Team
category: Inteligencia Artificial
image: https://images.unsplash.com/photo-XYZ?auto=format&fit=crop&q=80&w=800
---
```

Campos:
| Campo         | Obligatorio | Notas |
|---------------|-------------|-------|
| `title`       | sí          | Se ve grande en el portal |
| `description` | recomendado | Subtítulo en el card del portal |
| `instructor`  | sí          | Texto libre |
| `category`    | sí          | Aparece como tag pequeño |
| `image`       | sí          | URL pública. Usa Unsplash o tu propio CDN |
| `published`   | opcional    | `false` para esconder el curso del portal sin borrarlo. Por defecto se considera publicado. |

El cuerpo del archivo puede estar vacío. Si lo rellenas, no se usa por ahora.

> **Tip — esconder un curso temporalmente**: añade `published: false` al frontmatter. El parser lo omite del JSON generado y el portal no lo muestra. La carpeta y los `.md` se quedan donde están para cuando quieras volver a publicarlo: cambias a `published: true` y vuelve a aparecer en el siguiente build.

---

## Anatomía de una sesión

```markdown
---
id: 1
title: Claude + Managed Agents I
date: Viernes 15 mayo · 10:00–12:00
objectives:
  - Conocer la consola de Anthropic
  - Crear los agentes Researcher, Archivist y Coordinator
---

## Modulo 1 — Introducción a la consola

**Descripcion breve:** Una frase corta que se ve cuando el módulo está cerrado.

### Contexto

Texto explicativo en prosa.

### Pasos

1. Primero esto
2. Después aquello
   - Sub-punto
   - Otro
3. Y finalmente esto otro

### Resultado esperado

Texto explicativo del estado final tras completar el módulo.

---

## Modulo 2 — Otro módulo

**Descripcion breve:** ...
```

### Frontmatter de la sesión

| Campo        | Obligatorio | Notas |
|--------------|-------------|-------|
| `id`         | sí          | Número entero único dentro del curso |
| `title`      | sí          | Aparece como título de la sesión |
| `date`       | recomendado | Texto libre, ej. "Viernes 15 mayo · 10:00–12:00" |
| `objectives` | opcional    | Lista YAML, aparece como sección "Objetivos" en la sesión |
| `takeaways`  | opcional    | Lista YAML, marca la sesión con badge "Material Disponible" |
| `exercises`  | opcional    | Lista YAML de objetos `{id, title, description}` |

### Módulos (los `## H2`)

Cada `## Modulo N — Título` se convierte en un paso de la sesión.

- El parser **elimina** el prefijo `Modulo N — ` para el título del paso (queda solo "Introducción a la consola"). Es opcional ponerlo, pero ayuda a la lectura del MD.
- **`**Descripcion breve:** X`** es la única línea especial: define el resumen que ve el alumno cuando el módulo está colapsado. Si no la pones, el parser usa "Módulo N" genérico.
- **Todo lo demás dentro del módulo se renderiza como Markdown rico** cuando el alumno lo despliega: H3, H4, listas, código, tablas, enlaces, citas. Tienes todo el GitHub-Flavored Markdown disponible.

### Convención sugerida de secciones internas

Usa estos `### H3` para mantener consistencia visual entre módulos:

- `### Contexto` — por qué hacemos esto
- `### Pasos` — qué hacer, ordenado
- `### Resultado esperado` — cómo sabes que está hecho
- `### YAML de referencia — versión base` / `versión definitiva` — bloques de código grandes

No es obligatorio, pero la app estila los `### H3` con un acento Golive y se ven bien si los usas.

### Separador de módulos

El `---` entre módulos es **opcional** (mejora la legibilidad del MD pero el parser solo necesita los `## H2`). Si lo usas, ponlo después de "Resultado esperado".

---

## Bloques de código

Soportados con highlighting básico (sin syntax-highlight todavía, pero sí estilado):

```yaml
name: Mi agente
model:
  id: claude-sonnet-4-6
```

````markdown
```python
import anthropic
client = anthropic.Anthropic(api_key="...")
```
````

Indica siempre el lenguaje después de los tres backticks (`yaml`, `python`, `bash`, `typescript`, etc.). Aunque ahora no haya colores, mañana cuando añadamos syntax highlighting se pintarán solos.

---

## Tablas

```markdown
| Agente o recurso   | ID |
|--------------------|----|
| Researcher         |    |
| Archivist          |    |
```

Renderizan limpio. Si una celda está vacía, déjala vacía.

---

## Workflow para añadir contenido

1. Crea o edita el `.md` que toque dentro de `content/`
2. Ejecuta `npm run build:content` desde la raíz del proyecto
3. El script imprime un resumen y regenera `src/content/courses.json`
4. Ejecuta `npm run dev` y verifica que se ve bien
5. `git add content/ src/content/courses.json && git commit && git push`
6. Vercel desplega solo

> El `npm run build` ya ejecuta `build:content` antes del bundle, así que el deploy no se olvida.

### O simplemente pídeselo a Claude

Si trabajas con Claude Code en este repo, invoca la skill `/content` y te valida, parsea, comitea y empuja todo en un paso. Ver `.claude/skills/content.md`.

---

## Errores típicos del parser

| Error | Causa | Solución |
|-------|-------|----------|
| `Session ... is missing required frontmatter (id, title).` | Olvidaste el frontmatter al inicio | Añade `---\nid: N\ntitle: ...\n---` |
| `Course ... is missing _course.md.` | El directorio del curso no tiene su `_course.md` | Crea el archivo |
| `Course ...: _course.md must define "title" in frontmatter.` | `_course.md` está vacío o sin title | Añade frontmatter |
| Módulos que no aparecen en la web | Los IDs auto-generados cambiaron al renombrar títulos | Los progress quedan huérfanos en Supabase pero no rompen — los usuarios re-marcan |

---

## IDs de módulos y progreso de usuarios

El parser genera el ID de cada módulo como `s<sessionId>-<slug-del-titulo>`. Ej:

- `Modulo 1 — Introduccion a la consola de Anthropic` → `s1-introduccion-a-la-consola-de-anthropic`

**Si cambias el título del módulo**, el slug cambia y el progreso que tenía un alumno con el módulo anterior se pierde silenciosamente (queda huérfano en la tabla `progress` de Supabase). No es catastrófico, pero conviene saberlo: cambia títulos solo cuando reescribas significativamente el contenido.

Si quieres mantener el progreso al renombrar, puedes en su lugar editar el cuerpo del módulo sin tocar el título.
