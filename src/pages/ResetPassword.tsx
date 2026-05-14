import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);

  // Supabase parses the URL hash (#access_token=...&type=recovery) automatically
  // when detectSessionInUrl is true, then fires PASSWORD_RECOVERY. We just
  // listen so the user sees a clear state if the link is invalid/expired.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        setRecoveryReady(true);
      }
    });
    // Also check current session (in case the event fired before mount).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setRecoveryReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setSubmitting(false);
    if (err) {
      setError(err.message || 'No se pudo cambiar la contraseña.');
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate('/portal'), 1500);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-golive/10 rounded-3xl flex items-center justify-center text-golive mx-auto mb-6">
          <KeyRound size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Define tu contraseña</h1>
        <p className="text-sm text-slate-500">Estás restableciendo tu contraseña desde el enlace del email.</p>
      </div>

      {!recoveryReady && !success && (
        <div className="flex items-start gap-2 p-4 bg-amber-50 text-amber-700 rounded-xl text-sm mb-6">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Enlace no válido o caducado</p>
            <p className="text-xs">Pide otro email de reset a tu administrador o usa <Link to="/login" className="underline">volver al login</Link> si recuerdas tu contraseña.</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Nueva contraseña</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className="input"
          />
        </label>
        <label className="block">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Confírmala</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className="input"
          />
        </label>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-xs">
            <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
            <span>Contraseña actualizada. Iniciando sesión…</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !recoveryReady || !newPassword || !confirm}
          className="w-full bg-golive text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-golive-hover transition-colors disabled:opacity-50"
        >
          {submitting ? 'Guardando…' : 'Establecer contraseña'}
        </button>
      </form>
    </div>
  );
};
