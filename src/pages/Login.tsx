import { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const { user, loginWithGoogle, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from || '/portal';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to={redirectTo} replace />;

  const onEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      console.error('Login error (raw):', err);
      setError(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGoogleClick = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google login error (raw):', err);
      setError(mapAuthError(err));
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-golive/10 rounded-3xl flex items-center justify-center text-golive mx-auto mb-6">
          <GraduationCap size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Acceso a Golive Academy</h1>
        <p className="text-sm text-slate-500">Introduce las credenciales que te han facilitado.</p>
      </div>

      <form onSubmit={onEmailSubmit} className="space-y-4 mb-6">
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-golive/30 focus:outline-none text-sm"
          />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-golive/30 focus:outline-none text-sm"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !email || !password}
          className="w-full bg-golive text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-golive-hover transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Accediendo...' : 'Acceder'}
        </button>

        <p className="text-center text-[11px] text-slate-400">
          ¿Olvidaste tu contraseña? Contacta con el administrador del curso.
        </p>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold">o</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onGoogleClick}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 py-3.5 rounded-2xl font-bold text-sm transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span>Continuar con Google</span>
      </button>
    </div>
  );
};

function mapAuthError(err: any): string {
  const code = String(err?.code || '').toLowerCase();
  const msg = String(err?.message || err || '').toLowerCase();
  const status = err?.status;

  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos.';
  }
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Tu cuenta existe pero no está confirmada. Contacta con el administrador.';
  }
  if (code === 'user_not_found' || msg.includes('user not found')) {
    return 'No existe ningún usuario con ese email.';
  }
  if (msg.includes('invalid') && msg.includes('email')) {
    return 'El formato del email no es válido.';
  }
  if (status === 429 || code === 'over_request_rate_limit' || msg.includes('rate limit') || msg.includes('too many')) {
    return 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.';
  }
  if (code === 'user_banned' || msg.includes('disabled')) {
    return 'Esta cuenta ha sido desactivada.';
  }
  if (msg.includes('network') || msg.includes('failed to fetch')) {
    return 'Problema de red. Comprueba tu conexión.';
  }

  return err?.message ? `Error: ${err.message}` : 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}
