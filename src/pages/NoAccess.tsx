import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const NoAccess = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
        <ShieldAlert size={40} />
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-3">Tu cuenta no tiene acceso</h1>
      <p className="text-slate-500 mb-2">
        Has iniciado sesión correctamente, pero <span className="font-semibold text-slate-700">{user?.email}</span> no está autorizado en Golive Academy.
      </p>
      <p className="text-sm text-slate-400 mb-10">
        Si crees que es un error, contacta con el administrador del curso.
      </p>
      <button
        onClick={logout}
        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold text-sm transition-colors"
      >
        <LogOut size={14} /> Cerrar sesión
      </button>
    </div>
  );
};
