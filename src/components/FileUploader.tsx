import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  Check,
  Copy,
  X as XIcon,
  Trash2,
  AlertCircle,
  Loader2,
  Paperclip,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface UploadResult {
  title: string;
  url: string;
  size: number;
  path: string;
}

const BUCKET = 'course-files';
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

/**
 * Admin-only upload widget for session attachments. Stores files in the
 * `course-files` Supabase Storage bucket and produces the YAML snippet
 * the admin pastes into a session's frontmatter under `attachments:`.
 *
 * Files are not auto-attached to a session — the admin still chooses
 * which session's .md to paste the snippet into. That keeps storage
 * and content authoring loosely coupled.
 */
export const FileUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [recent, setRecent] = useState<UploadResult[]>([]);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { loadRecent(); }, []);

  const loadRecent = async () => {
    const { data } = await supabase
      .storage
      .from(BUCKET)
      .list('attachments', {
        limit: 20,
        sortBy: { column: 'created_at', order: 'desc' },
      });
    if (!data) return;
    setRecent(
      data
        .filter(o => o.name)
        .map(o => {
          const path = `attachments/${o.name}`;
          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
          // Pull off the uuid prefix for the display title.
          const displayName = o.name.replace(/^[0-9a-f-]{36}-/, '');
          return {
            title: displayName,
            url: pub.publicUrl,
            size: o.metadata?.size ?? 0,
            path,
          };
        })
    );
  };

  const onPickFile = () => fileInputRef.current?.click();

  const upload = async (file: File) => {
    setError(null);
    setResult(null);
    if (file.size > MAX_SIZE) {
      setError(`El archivo supera el límite de 20 MB (este pesa ${humanSize(file.size)}).`);
      return;
    }
    setUploading(true);
    try {
      const uuid = crypto.randomUUID();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
      const path = `attachments/${uuid}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const r: UploadResult = {
        title: file.name,
        url: pub.publicUrl,
        size: file.size,
        path,
      };
      setResult(r);
      loadRecent();
    } catch (e: any) {
      setError(e?.message || 'No se pudo subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) upload(f);
    // reset so the same file can be re-picked
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  };

  const yamlSnippet = (item: UploadResult) =>
    `  - title: ${item.title.replace(/[":\\]/g, '')}\n    url: ${item.url}`;

  const copySnippet = (item: UploadResult) => {
    navigator.clipboard.writeText(yamlSnippet(item)).then(() => {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    });
  };

  const copyUrl = (item: UploadResult) => {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  };

  const remove = async (path: string) => {
    if (!confirm('¿Borrar este archivo del Storage? Si está vinculado en algún .md, el link dejará de funcionar.')) return;
    const { error: delErr } = await supabase.storage.from(BUCKET).remove([path]);
    if (delErr) {
      alert('No se pudo borrar: ' + delErr.message);
      return;
    }
    if (result?.path === path) setResult(null);
    loadRecent();
  };

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Paperclip className="text-golive" size={22} />
        <h2 className="text-xl font-bold text-slate-900">Subir archivos adjuntos</h2>
      </div>

      <p className="text-sm text-slate-500 mb-4 leading-relaxed">
        Sube material de sesión (PDF, slides, ZIP, código). Tras la subida copia el snippet YAML y pégalo en el frontmatter del <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[12px]">.md</code> de la sesión bajo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[12px]">attachments:</code>. Tamaño máximo: 20 MB por archivo.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        onChange={onFileChange}
        className="hidden"
      />

      <div
        onClick={onPickFile}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "relative cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition-colors",
          uploading ? "border-golive/40 bg-golive/5" : "border-slate-200 hover:border-golive/30 hover:bg-slate-50"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-golive" />
            <p className="text-sm font-bold">Subiendo…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="w-14 h-14 rounded-2xl bg-golive/10 text-golive flex items-center justify-center">
              <Upload size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Arrastra aquí o haz click para elegir un archivo</p>
              <p className="text-xs text-slate-400 mt-1">Hasta 20 MB · PDF, ZIP, código, slides…</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-4 p-5 bg-green-50 border border-green-100 rounded-3xl">
          <div className="flex items-start gap-2 text-green-700 mb-3">
            <Check size={18} className="mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate">{result.title}</p>
              <p className="text-xs">Subido · {humanSize(result.size)}</p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-green-700 hover:text-green-900"
            >
              <XIcon size={16} />
            </button>
          </div>

          <pre className="bg-white p-3 rounded-xl text-[11px] font-mono text-slate-700 whitespace-pre-wrap break-all mb-3">
{yamlSnippet(result)}
          </pre>

          <div className="flex gap-2">
            <button
              onClick={() => copySnippet(result)}
              className="flex-1 bg-white text-green-700 border border-green-200 px-3 py-2 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-1.5"
            >
              {copiedSnippet ? <><Check size={12} /> Snippet copiado</> : <><Copy size={12} /> Copiar snippet YAML</>}
            </button>
            <button
              onClick={() => copyUrl(result)}
              className="px-3 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              {copiedUrl ? <><Check size={12} /> URL copiada</> : <><Copy size={12} /> Solo URL</>}
            </button>
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.18em] mb-3">
            Archivos en Storage ({recent.length})
          </h3>
          <div className="space-y-2">
            {recent.map(item => (
              <div
                key={item.path}
                className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {humanSize(item.size)}
                  </p>
                </div>
                <button
                  onClick={() => copySnippet(item)}
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-golive px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
                  title="Copiar snippet YAML"
                >
                  copiar snippet
                </button>
                <button
                  onClick={() => remove(item.path)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  title="Borrar de Storage"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
