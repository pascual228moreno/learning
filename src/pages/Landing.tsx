import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Landing = () => {
  const { user } = useAuth();
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-golive/5 text-golive rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-golive/10"
        >
          <Sparkles size={14} />
          <span>Lidera la era de la IA</span>
        </motion.div>
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.95] mb-8">
          Bienvenido a <br />
          <span className="text-golive">Golive Academy</span>
        </h1>
        <p className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Plataforma oficial de formación de Golive. Aprende de expertos a crear soluciones reales con IA.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to={user ? "/portal" : "/login"} className="bg-golive text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-golive/30 hover:bg-golive-hover transition-all hover:-translate-y-1 active:translate-y-0">
            {user ? 'Entrar a la Academia' : 'Acceder'}
          </Link>
        </div>
      </div>
    </section>
  );
};
