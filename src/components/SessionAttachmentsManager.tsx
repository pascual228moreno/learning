import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Paperclip,
  Upload,
  Loader2,
  Trash2,
  Copy,
  Check,
  FileText,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { courses } from '../data';
import { cn } from '../lib/utils';

interface AttachmentRow {
  id: string;
  course_id: string;
  session_id: string;
  title: string;
  url: string;
  storage_path: string | null;
  created_at: string;
}

const BUCKET = 'course-files';
const MAX_SIZE = 20 * 1024 * 1024;

/**
 * Per-session attachment manager. Files live in the `course-files` Storage
 * bucket and are tracked in the public.session_attachments table, keyed by
 * (course_id, session_id). The admin picks a course, sees every session's
 * current attachments inline, and uploads new ones with a single click.
 *
 * No Markdown editing needed — the CourseViewer reads attachments from
 * this table at runtime and merges them with any frontmatter-defined ones.
 */
export const SessionAttachmentsManager = () => {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? '');
  const [rows, setRows] = useState<AttachmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingSession, setUploadingSession] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedCourse = useMemo(
    () => courses.find(c => c.id === selectedCourseId),
    [selectedCourseId]
  );

  const fetchRows = async (courseId: string) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('session_attachments')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at');
    if (err) setError(err.message);
    else setRows((data ?? []) as AttachmentRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!selectedCourseId) return;
    fetchRows(selectedCourseId);

    const channel = supabase
      .channel(`attachments:${selectedCourseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_attachments',
          filter: `course_id=eq.${selectedCourseId}`,
        },
        () => fetchRows(selectedCourseId)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedCourseId]);

  const upload = async (courseId: string, sessionId: string, file: File) => {
    setError(null);
    if (file.size > MAX_SIZE) {
      setError(`"${file.name}" supera el límite de 20 MB (pesa ${humanSize(file.size)}).`);
      return;
    }
    setUploadingSession(sessionId);
    try {
      const uuid = crypto.randomUUID();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
      const path = `attachments/${uuid}-${safe}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const { error: insErr } = await supabase
        .from('session_attachments')
        .insert({
          course_id: courseId,
          session_id: sessionId,
          title: file.name,
          url: pub.publicUrl,
          storage_path: path,
        });
      if (insErr) {
        // rollback the storage object so we don't leak orphans
        await supabase.storage.from(BUCKET).remove([path]);
        throw insErr;
      }
    } catch (e: any) {
      setError(e?.message || 'No se pudo subir el archivo.');
    } finally {
      setUploadingSession(null);
    }
  };

  const remove = async (row: AttachmentRow) => {
    if (!confirm(`¿Borrar "${row.title}"? El link dejará de funcionar en la web.`)) return;
    const { error: delErr } = await supabase
      .from('session_attachments')
      .delete()
      .eq('id', row.id);
    if (delErr) {
      alert('No se pudo borrar: ' + delErr.message);
      return;
    }
    if (row.storage_path) {
      // best-effort cleanup; the DB delete already invalidates the link
      supabase.storage.from(BUCKET).remove([row.storage_path]).catch(() => {});
    }
  };

  const copyUrl = (row: AttachmentRow) => {
    navigator.clipboard.writeText(row.url).then(() => {
      setCopiedId(row.id);
      setTimeout(() => setCopiedId(id => (id === row.id ? null : id)), 1500);
    });
  };

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Paperclip className="text-golive" size={22} />
        <h2 className="text-xl font-bold text-slate-900">Material por sesión</h2>
      </div>

      <p className="text-sm text-slate-500 mb-5 leading-relaxed">
        Sube PDFs, slides, ZIPs o cualquier archivo. Se asocian a la sesión que elijas y aparecen en la pestaña "Material de la sesión" para los alumnos inscritos. Máximo 20 MB por archivo.
      </p>

      {/* Course selector */}
      <div className="mb-6">
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
          Curso
        </label>
        <div className="relative">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="input pr-10 appearance-none cursor-pointer"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!selectedCourse ? (
        <div className="p-8 text-center text-slate-400 text-sm">No hay cursos publicados.</div>
      ) : loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Cargando…</div>
      ) : (
        <div className="space-y-3">
          {selectedCourse.sessions.map(session => {
            const sessionRows = rows.filter(r => r.session_id === String(session.id));
            const isUploading = uploadingSession === String(session.id);
            return (
              <SessionCard
                key={session.id}
                title={session.title}
                sessionNumber={session.id}
                attachments={sessionRows}
                isUploading={isUploading}
                copiedId={copiedId}
                onUpload={(file) => upload(selectedCourse.id, String(session.id), file)}
                onCopy={copyUrl}
                onDelete={remove}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

interface SessionCardProps {
  title: string;
  sessionNumber: number;
  attachments: AttachmentRow[];
  isUploading: boolean;
  copiedId: string | null;
  onUpload: (file: File) => void;
  onCopy: (row: AttachmentRow) => void;
  onDelete: (row: AttachmentRow) => void;
}

const SessionCard = ({
  title,
  sessionNumber,
  attachments,
  isUploading,
  copiedId,
  onUpload,
  onCopy,
  onDelete,
}: SessionCardProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onUpload(f);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onUpload(f);
  };

  return (
    <div
      className="bg-white border border-slate-200 rounded-3xl p-5"
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
            Sesión {sessionNumber}
          </p>
          <p className="text-sm font-bold text-slate-900 truncate">{title}</p>
        </div>
        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full uppercase tracking-widest">
          {attachments.length === 0
            ? 'Sin archivos'
            : attachments.length === 1
              ? '1 archivo'
              : `${attachments.length} archivos`}
        </span>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2 mb-4">
          {attachments.map(row => (
            <div
              key={row.id}
              className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl"
            >
              <div className="w-9 h-9 rounded-xl bg-white text-slate-400 flex items-center justify-center flex-shrink-0">
                <FileText size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{row.title}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                  {new Date(row.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => onCopy(row)}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md transition-colors flex items-center gap-1",
                  copiedId === row.id
                    ? "text-green-600 bg-green-50"
                    : "text-slate-400 hover:text-golive hover:bg-white"
                )}
                title="Copiar URL pública"
              >
                {copiedId === row.id ? <><Check size={11} /> copiada</> : <><Copy size={11} /> URL</>}
              </button>
              <button
                onClick={() => onDelete(row)}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                title="Borrar archivo"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input ref={inputRef} type="file" onChange={onChange} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border-2 border-dashed transition-colors disabled:opacity-50",
          isUploading
            ? "border-golive/40 bg-golive/5 text-golive"
            : "border-slate-200 text-slate-500 hover:border-golive/40 hover:text-golive hover:bg-golive/5"
        )}
      >
        {isUploading ? (
          <><Loader2 size={14} className="animate-spin" /> Subiendo…</>
        ) : (
          <><Upload size={14} /> Subir archivo a esta sesión</>
        )}
      </button>
    </div>
  );
};

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
