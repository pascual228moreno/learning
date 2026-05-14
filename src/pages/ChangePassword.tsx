import { useState, FormEvent } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const ChangePassword = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (loading) {
    return <div className="max-w-md mx-auto p-12 text-center text-slate-400">Cargando…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;

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
      setError(err.message);
      return;
    }
    setSuccess(true);
    setNewPassword('');
    setConfirm('');
    setTimeout(() => navigate('/portal'), 1500);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <Link to="/portal" className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-golive mb-8">
        <ArrowLeft size={12} /> Volver
      </Link>

      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-golive/10 rounded-3xl flex items-center justify-center text-golive mx-auto mb-6">
          <KeyRound size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Cambiar contraseña</h1>
        <p className="text-sm text-slate-500">Define una contraseña nueva para tu cuenta.</p>
      </div>

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
            <span>Contraseña actualizada. Volviendo al portal…</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !newPassword || !confirm}
          className="w-full bg-golive text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-golive-hover transition-colors disabled:opacity-50"
        >
          {submitting ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
};
