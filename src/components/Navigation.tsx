import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LogoutConfirmModal } from './LogoutConfirmModal';

export const Navigation = () => {
  const { user, login, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-golive rounded flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">G</div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">Golive <span className="text-golive">Academy</span></span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/portal" className="text-sm font-semibold text-slate-600 hover:text-golive transition-colors mr-2">Mis Cursos</Link>
                <div className="relative group">
                  <img src={user.photoURL || ""} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-golive/20 cursor-pointer" />
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="bg-white border border-slate-100 shadow-xl rounded-xl p-2 min-w-[200px]">
                      <div className="px-3 py-2 border-b border-slate-50 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.displayName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={14} /> Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={login} className="btn-primary flex items-center gap-2 text-sm">
                <UserIcon size={16} /> Acceder
              </button>
            )}
          </div>
        </div>
      </nav>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onConfirm={() => {
          logout();
          setShowLogoutConfirm(false);
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};
