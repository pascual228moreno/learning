/**
 * scripts/build-content.ts
 *
 * Reads every Markdown course definition under `content/` and produces
 * `src/content/courses.json`, which `src/data.ts` re-exports as the
 * typed `Course[]` consumed by the app.
 *
 * File layout (one course per top-level folder):
 *
 *   content/
 *   └── <course-id>/
 *       ├── _course.md           ← frontmatter with course metadata
 *       └── sesion-<id>-<slug>.md  ← one per session
 *
 * Each session file may contain any number of `## Modulo N — Title` blocks.
 * Inside a module we extract:
 *   - title          (the H2 line, after stripping any "Modulo N — " prefix)
 *   - description    (the "**Descripcion breve:** ..." line, if present)
 *   - content        (everything else inside the block, kept as Markdown)
 *
 * Step IDs are derived from a slug of the H2 title, prefixed by the session
 * id (e.g. `s1-introduccion-consola-anthropic`). They stay stable across
 * minor edits so existing user progress survives.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'content');
const OUT_DIR = join(ROOT, 'src', 'content');
const OUT_FILE = join(OUT_DIR, 'courses.json');

interface Step {
  id: string;
  title: string;
  description: string;
  content?: string;
  duration?: string;
  resources?: { title: string; url: string }[];
}

interface Session {
  id: number;
  title: string;
  date: string;
  objectives: string[];
  script: Step[];
  exercises: { id: string; title: string; description: string }[];
  takeaways: string[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  image?: string;
  sessions: Session[];
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function stripModuleLabel(title: string): string {
  // Removes "Modulo 1 — " / "Módulo 3 - " prefixes for cleaner display titles.
  return title.replace(/^M[oó]dulo\s+\d+\s*[—\-:]\s*/i, '').trim();
}

function parseModules(sessionId: number, body: string): Step[] {
  const lines = body.split('\n');
  const moduleHeaderIdx: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) moduleHeaderIdx.push(i);
  }

  const steps: Step[] = [];
  for (let m = 0; m < moduleHeaderIdx.length; m++) {
    const start = moduleHeaderIdx[m];
    const end = m + 1 < moduleHeaderIdx.length ? moduleHeaderIdx[m + 1] : lines.length;
    const block = lines.slice(start, end);

    const rawTitle = block[0].replace(/^##\s+/, '').trim();
    const title = stripModuleLabel(rawTitle);

    // Description: first line matching **Descripcion breve:** X
    let description = '';
    const descIdx = block.findIndex(l => /^\*\*Descripci[oó]n breve:\*\*/i.test(l));
    if (descIdx >= 0) {
      description = block[descIdx].replace(/^\*\*Descripci[oó]n breve:\*\*\s*/i, '').trim();
    }

    // Content: everything in the block EXCEPT the H2 title and the description line.
    // We strip leading/trailing blank lines and any trailing "---" horizontal rule.
    const contentLines = block
      .filter((_, i) => i !== 0 && i !== descIdx)
      .join('\n')
      .replace(/^\s*\n+/, '')
      .replace(/\n+\s*$/, '')
      .replace(/\n+---\s*$/, '')
      .trim();

    const slug = slugify(title) || `m${m + 1}`;
    steps.push({
      id: `s${sessionId}-${slug}`,
      title,
      description: description || `Módulo ${m + 1}`,
      content: contentLines || undefined,
    });
  }

  return steps;
}

function parseSession(filePath: string): Session {
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = matter(raw);
  const fm = parsed.data as Partial<Session>;

  if (fm.id === undefined || fm.title === undefined) {
    throw new Error(`Session ${filePath} is missing required frontmatter (id, title).`);
  }

  const script = parseModules(Number(fm.id), parsed.content);

  return {
    id: Number(fm.id),
    title: String(fm.title),
    date: String(fm.date ?? ''),
    objectives: Array.isArray(fm.objectives) ? fm.objectives.map(String) : [],
    script,
    exercises: Array.isArray(fm.exercises) ? (fm.exercises as Session['exercises']) : [],
    takeaways: Array.isArray(fm.takeaways) ? fm.takeaways.map(String) : [],
  };
}

function parseCourse(courseDir: string): Course {
  const courseId = basename(courseDir);
  const courseMdPath = join(courseDir, '_course.md');
  if (!existsSync(courseMdPath)) {
    throw new Error(`Course ${courseId} is missing _course.md.`);
  }

  const courseMd = matter(readFileSync(courseMdPath, 'utf-8'));
  const meta = courseMd.data as Partial<Course>;

  if (!meta.title) {
    throw new Error(`Course ${courseId}: _course.md must define "title" in frontmatter.`);
  }

  const sessionFiles = readdirSync(courseDir)
    .filter(f => /^sesion-\d+/.test(f) && f.endsWith('.md'))
    .map(f => join(courseDir, f));

  const sessions = sessionFiles
    .map(parseSession)
    .sort((a, b) => a.id - b.id);

  return {
    id: courseId,
    title: meta.title,
    description: meta.description ?? '',
    instructor: meta.instructor ?? '',
    category: meta.category ?? '',
    image: meta.image,
    sessions,
  };
}

function main() {
  if (!existsSync(CONTENT_DIR)) {
    console.error(`No content/ directory found at ${CONTENT_DIR}`);
    process.exit(1);
  }

  const courseDirs = readdirSync(CONTENT_DIR)
    .map(f => join(CONTENT_DIR, f))
    .filter(p => statSync(p).isDirectory());

  if (courseDirs.length === 0) {
    console.error('No course folders found under content/.');
    process.exit(1);
  }

  const courses = courseDirs.map(parseCourse);

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(courses, null, 2) + '\n');

  // Summary
  for (const c of courses) {
    const totalSteps = c.sessions.reduce((n, s) => n + s.script.length, 0);
    console.log(
      `✓ ${c.id.padEnd(30)} ${c.sessions.length} sesiones, ${totalSteps} módulos`
    );
  }
  console.log(`\nWrote ${OUT_FILE}`);
}

main();
