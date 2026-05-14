import { useState, useEffect, FormEvent, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import {
  UserPlus,
  Users,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  CheckSquare,
  Square,
  Save,
  KeyRound,
  X as XIcon,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { courses } from '../data';
import { UserProfile, Role } from '../types';
import {
  createUser,
  updateUserCourses,
  updateUserRole,
  setUserPassword,
  generatePassword,
} from '../lib/admin-actions';
import { cn } from '../lib/utils';
import { FileUploader } from '../components/FileUploader';

export const Admin = () => {
  const { profile, loading, resolvingAccess } = useAuth();

  if (loading || resolvingAccess) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">Cargando…</div>;
  }
  if (!profile || profile.role !== 'superadmin') {
    return <Navigate to="/portal" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-golive font-black tracking-widest text-[10px] uppercase mb-3">
          <ShieldCheck size={14} />
          <span>Panel de administración</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Usuarios</h1>
        <p className="text-slate-500 mt-2">Crea cuentas para tus asistentes y asígnales los cursos.</p>
      </header>

      <CreateUserCard adminUid={profile.id} />
      <UsersTable />
      <FileUploader />
    </div>
  );
};

const CreateUserCard = ({ adminUid }: { adminUid: string }) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState(() => generatePassword());
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [role, setRole] = useState<Role>('student');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCreds, setSuccessCreds] = useState<{ email: string; password: string; displayName: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleCourse = (id: string) => {
    setSelectedCourses(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const reset = () => {
    setEmail('');
    setDisplayName('');
    setPassword(generatePassword());
    setSelectedCourses([]);
    setRole('student');
    setError(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccessCreds(null);

    if (!email || !password || !displayName) {
      setError('Rellena email, nombre y contraseña.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (selectedCourses.length === 0 && role !== 'superadmin') {
      setError('Selecciona al menos un curso.');
      return;
    }

    setSubmitting(true);
    try {
      await createUser({
        email,
        password,
        displayName,
        courseIds: selectedCourses,
        role,
        createdByUid: adminUid,
      });
      setSuccessCreds({ email: email.trim().toLowerCase(), password, displayName });
      reset();
    } catch (err: any) {
      setError(mapCreateError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const copyCredentials = () => {
    if (!successCreds) return;
    const text =
      `Acceso a Golive Academy para ${successCreds.displayName}\n` +
      `URL: ${window.location.origin}/login\n` +
      `Email: ${successCreds.email}\n` +
      `Contraseña: ${successCreds.password}\n` +
      `(Te recomendamos cambiarla en tu primer acceso desde "¿Olvidaste tu contraseña?")`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="text-golive" size={22} />
        <h2 className="text-xl font-bold text-slate-900">Crear usuario</h2>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-3xl p-8 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="asistente@empresa.com"
              className="input"
              autoComplete="off"
            />
          </Field>
          <Field label="Nombre completo">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ana López"
              className="input"
              autoComplete="off"
            />
          </Field>
        </div>

        <Field label="Contraseña (la verás solo esta vez)">
          <div className="flex gap-2">
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input font-mono tracking-tight"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setPassword(generatePassword())}
              className="px-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 text-xs font-bold flex items-center gap-2"
              title="Generar nueva"
            >
              <RefreshCw size={14} /> Generar
            </button>
          </div>
        </Field>

        <Field label="Cursos asignados">
          <div className="space-y-2">
            {courses.map(c => {
              const checked = selectedCourses.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCourse(c.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-colors",
                    checked ? "border-golive/30 bg-golive/5" : "border-slate-100 bg-slate-50 hover:border-slate-200"
                  )}
                >
                  {checked
                    ? <CheckSquare size={18} className="text-golive flex-shrink-0" />
                    : <Square size={18} className="text-slate-300 flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{c.title}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{c.category}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Rol">
          <div className="flex gap-2">
            {(['student', 'superadmin'] as Role[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 py-2.5 rounded-2xl text-sm font-bold border-2 transition-colors",
                  role === r ? "border-golive bg-golive text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                )}
              >
                {r === 'student' ? 'Alumno' : 'Superadmin'}
              </button>
            ))}
          </div>
        </Field>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-golive text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-golive-hover transition-colors disabled:opacity-50"
        >
          {submitting ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>

      {successCreds && (
        <div className="mt-4 p-5 bg-green-50 border border-green-100 rounded-3xl">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-start gap-2 text-green-700">
              <Check size={18} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">Usuario creado correctamente</p>
                <p className="text-xs">Copia estas credenciales — no podrás volver a verlas.</p>
              </div>
            </div>
            <button
              onClick={copyCredentials}
              className="flex items-center gap-1.5 bg-white text-green-700 border border-green-200 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors"
            >
              {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
            </button>
          </div>
          <pre className="bg-white p-3 rounded-xl text-xs font-mono text-slate-700 whitespace-pre-wrap">
{`Email:    ${successCreds.email}
Contraseña: ${successCreds.password}`}
          </pre>
        </div>
      )}
    </section>
  );
};

const UsersTable = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (active) {
        if (!error && data) setUsers(data as UserProfile[]);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel('profiles:all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => { load(); })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <Users className="text-golive" size={22} />
        <h2 className="text-xl font-bold text-slate-900">Usuarios ({users.length})</h2>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white border border-slate-100 rounded-3xl">Cargando…</div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white border border-slate-100 rounded-3xl">
          <GraduationCap size={40} className="mx-auto mb-4 opacity-20" />
          <p>Aún no hay usuarios. Crea el primero arriba.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u: UserProfile) => <UserRow key={u.id} user={u} />)}
        </div>
      )}
    </section>
  );
};

const UserRow = ({ user }: { user: UserProfile }) => {
  const [editing, setEditing] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>(user.course_ids || []);
  const [saving, setSaving] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdValue, setPwdValue] = useState(() => generatePassword());
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) setSelectedCourses(user.course_ids || []);
  }, [user.course_ids, editing]);

  const toggleCourse = (id: string) => {
    setSelectedCourses(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateUserCourses(user.id, selectedCourses);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleSuperadmin = async () => {
    const next: Role = user.role === 'superadmin' ? 'student' : 'superadmin';
    if (!confirm(`¿Cambiar rol de ${user.email} a ${next === 'superadmin' ? 'superadmin' : 'alumno'}?`)) return;
    await updateUserRole(user.id, next);
  };

  const openPwd = () => {
    setPwdValue(generatePassword());
    setPwdError(null);
    setPwdSuccess(null);
    setPwdOpen(true);
  };

  const closePwd = () => {
    setPwdOpen(false);
    setPwdError(null);
    setPwdSuccess(null);
  };

  const applyPwd = async () => {
    setPwdError(null);
    if (pwdValue.length < 6) {
      setPwdError('Mínimo 6 caracteres.');
      return;
    }
    setPwdSubmitting(true);
    try {
      await setUserPassword(user.id, pwdValue);
      setPwdSuccess(pwdValue);
    } catch (err: any) {
      setPwdError(err?.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setPwdSubmitting(false);
    }
  };

  const copyCreds = () => {
    if (!pwdSuccess) return;
    const text =
      `Acceso a Golive Academy\n` +
      `URL: ${window.location.origin}/login\n` +
      `Email: ${user.email}\n` +
      `Contraseña: ${pwdSuccess}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {user.photo_url ? (
            <img src={user.photo_url} className="w-10 h-10 rounded-2xl object-cover bg-slate-100 flex-shrink-0" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm flex-shrink-0">
              {(user.display_name || user.email)[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 truncate">{user.display_name || '—'}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest",
            user.role === 'superadmin' ? "bg-golive/10 text-golive" : "bg-slate-100 text-slate-500"
          )}>
            {user.role === 'superadmin' ? 'Superadmin' : 'Alumno'}
          </span>
          <button
            onClick={toggleSuperadmin}
            className="text-[10px] text-slate-400 hover:text-golive font-bold uppercase tracking-widest"
            title="Cambiar rol"
          >
            cambiar rol
          </button>
          <button
            onClick={pwdOpen ? closePwd : openPwd}
            className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-golive font-bold uppercase tracking-widest px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
            title="Cambiar contraseña"
          >
            <KeyRound size={10} /> {pwdOpen ? 'cerrar' : 'cambiar pwd'}
          </button>
        </div>
      </div>

      {pwdOpen && (
        <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
          {!pwdSuccess ? (
            <>
              <label className="block">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Nueva contraseña</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pwdValue}
                    onChange={(e) => setPwdValue(e.target.value)}
                    className="input font-mono tracking-tight"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setPwdValue(generatePassword())}
                    className="px-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 text-xs font-bold flex items-center gap-2"
                  >
                    <RefreshCw size={14} /> Generar
                  </button>
                </div>
              </label>

              {pwdError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{pwdError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={applyPwd}
                  disabled={pwdSubmitting}
                  className="flex-1 bg-golive text-white py-2.5 rounded-2xl text-xs font-bold disabled:opacity-50"
                >
                  {pwdSubmitting ? 'Aplicando…' : 'Aplicar contraseña'}
                </button>
                <button
                  onClick={closePwd}
                  className="px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold flex items-center gap-1"
                >
                  <XIcon size={12} /> Cancelar
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl">
              <div className="flex items-start gap-2 text-green-700 mb-3">
                <Check size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">Contraseña actualizada</p>
                  <p className="text-xs">Pásale al usuario las nuevas credenciales:</p>
                </div>
              </div>
              <pre className="bg-white p-3 rounded-xl text-xs font-mono text-slate-700 whitespace-pre-wrap mb-2">
{`Email:    ${user.email}
Contraseña: ${pwdSuccess}`}
              </pre>
              <div className="flex gap-2">
                <button
                  onClick={copyCreds}
                  className="flex-1 bg-white text-green-700 border border-green-200 px-3 py-2 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Copy size={12} /> Copiar credenciales
                </button>
                <button
                  onClick={closePwd}
                  className="px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-50">
        {!editing ? (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(user.course_ids || []).length === 0 && (
                <span className="text-xs text-slate-400 italic">Sin cursos asignados</span>
              )}
              {(user.course_ids || []).map(cid => {
                const c = courses.find(x => x.id === cid);
                return (
                  <span key={cid} className="text-[10px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full">
                    {c?.title || cid}
                  </span>
                );
              })}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-bold text-golive hover:text-golive-hover"
            >
              Editar cursos
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map(c => {
              const checked = selectedCourses.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCourse(c.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-colors",
                    checked ? "border-golive/30 bg-golive/5" : "border-slate-100 bg-slate-50 hover:border-slate-200"
                  )}
                >
                  {checked
                    ? <CheckSquare size={16} className="text-golive flex-shrink-0" />
                    : <Square size={16} className="text-slate-300 flex-shrink-0" />
                  }
                  <span className="font-bold text-sm text-slate-700 truncate">{c.title}</span>
                </button>
              );
            })}
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 bg-golive text-white py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                onClick={() => { setEditing(false); setSelectedCourses(user.course_ids || []); }}
                className="px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</span>
    {children}
  </label>
);

function mapCreateError(err: any): string {
  const msg = String(err?.message || err || '').toLowerCase();
  if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
    return 'Ese email ya tiene una cuenta. Si es nuevo, asígnale cursos desde la lista de usuarios.';
  }
  if (msg.includes('invalid') && msg.includes('email')) {
    return 'El formato del email no es válido.';
  }
  if (msg.includes('weak') || msg.includes('password')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msg.includes('signups not allowed') || msg.includes('disabled')) {
    return 'Los registros están deshabilitados en Supabase. Actívalos en Auth → Sign In / Providers → Email.';
  }
  return err?.message || 'No se pudo crear el usuario. Revisa la consola.';
}
