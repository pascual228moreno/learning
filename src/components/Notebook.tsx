import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NotebookPen, X, Check, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const SAVE_DEBOUNCE_MS = 800;

/**
 * Floating private notebook. One row per user in `public.notes`, written
 * with optimistic-by-default plus a debounced upsert. Closed by default;
 * hidden entirely until the user is signed in and has a resolved profile
 * (so it doesn't appear on /login or the access-pending screens).
 */
export const Notebook = () => {
  const { user, profile, noAccess } = useAuth();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);

  // Load the user's notebook the first time they open it (lazy — most users
  // won't open it on a given visit, no point fetching for everyone).
  useEffect(() => {
    if (!user || loaded || !open) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('notes')
        .select('content')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!active) return;
      setContent(data?.content ?? '');
      setLoaded(true);
    })();
    return () => { active = false; };
  }, [user, loaded, open]);

  const flushSave = useCallback(async () => {
    if (!user) return;
    if (!dirtyRef.current) return;
    dirtyRef.current = false;
    setSaveState('saving');
    const { error } = await supabase
      .from('notes')
      .upsert(
        { user_id: user.id, content, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    if (error) {
      setSaveState('error');
      dirtyRef.current = true; // keep marked dirty so next change retries
    } else {
      setSaveState('saved');
      setTimeout(() => setSaveState(s => (s === 'saved' ? 'idle' : s)), 1800);
    }
  }, [user, content]);

  // Debounced save on every change after load.
  useEffect(() => {
    if (!loaded) return;
    dirtyRef.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { flushSave(); }, SAVE_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, loaded, flushSave]);

  // Flush on unmount or visibility change so we never lose the last keystroke.
  useEffect(() => {
    const onHide = () => { flushSave(); };
    window.addEventListener('beforeunload', onHide);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') onHide();
    });
    return () => {
      window.removeEventListener('beforeunload', onHide);
      flushSave();
    };
  }, [flushSave]);

  // Gate visibility: signed in + has profile (i.e. authorized).
  if (!user || !profile || noAccess) return null;

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        type="button"
        aria-label={open ? 'Cerrar mi cuaderno' : 'Abrir mi cuaderno'}
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-2xl shadow-slate-900/30 hover:bg-golive hover:shadow-golive/40 transition-colors"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <NotebookPen size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Slide-up panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="notebook-panel"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] max-w-[400px] h-[min(560px,calc(100vh-8rem))] bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden"
          >
            <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-golive/10 text-golive flex items-center justify-center flex-shrink-0">
                  <NotebookPen size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 leading-tight">Mi cuaderno</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Solo lo ves tú</p>
                </div>
              </div>
              <SaveIndicator state={saveState} />
            </header>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={loaded ? 'Apunta lo que necesites recordar de esta sesión…' : 'Cargando…'}
              disabled={!loaded}
              className="flex-1 w-full resize-none p-5 text-sm leading-relaxed text-slate-700 placeholder:text-slate-300 focus:outline-none font-sans"
            />

            <footer className="px-5 py-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-right">
              {content.length} {content.length === 1 ? 'carácter' : 'caracteres'}
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const SaveIndicator = ({ state }: { state: SaveState }) => {
  if (state === 'saving') {
    return (
      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <Loader2 size={11} className="animate-spin" /> Guardando
      </div>
    );
  }
  if (state === 'saved') {
    return (
      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-green-600">
        <Check size={11} /> Guardado
      </div>
    );
  }
  if (state === 'error') {
    return (
      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500">
        ⚠ Error
      </div>
    );
  }
  return null;
};
