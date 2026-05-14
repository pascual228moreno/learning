import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Landing = () => {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-64px)] flex items-center">
      {/* Ambient background — soft blurred blobs + faint grid */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -right-32 w-[640px] h-[640px] rounded-full bg-gradient-to-br from-golive/25 via-golive/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-48 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-golive/10 via-amber-100/30 to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(0deg, #000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 relative w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm rounded-full text-[11px] font-bold uppercase tracking-[0.18em] mb-10 md:mb-14"
        >
          <Sparkles size={14} className="text-golive" />
          <span className="text-slate-700">Lidera la era de la IA</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-black text-slate-900 tracking-[-0.045em] leading-[0.85] mb-8"
          style={{ fontSize: 'clamp(3.5rem, 11vw, 9.5rem)' }}
        >
          Golive
          <br />
          <span className="bg-gradient-to-br from-golive via-golive to-golive-dark bg-clip-text text-transparent">
            Academy.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-lg md:text-2xl text-slate-500 max-w-2xl mb-12 leading-relaxed font-medium"
        >
          Formación práctica de Golive. Aprende a construir soluciones reales con IA junto a especialistas que ya las despliegan en producción.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap gap-6 items-center"
        >
          <Link
            to={user ? '/portal' : '/login'}
            className="group inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-2xl font-bold text-base shadow-2xl shadow-slate-900/15 hover:bg-golive hover:shadow-golive/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            <span>{user ? 'Entrar a la Academia' : 'Acceder a mi curso'}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          {!user && (
            <p className="text-xs text-slate-400 font-medium max-w-[18rem] leading-relaxed">
              Plataforma de acceso restringido. Las credenciales las facilita tu equipo de Golive.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
};
