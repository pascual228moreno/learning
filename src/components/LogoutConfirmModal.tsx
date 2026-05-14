import { motion, AnimatePresence } from 'motion/react';
import { LogOut } from 'lucide-react';

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutConfirmModal = ({ open, onConfirm, onCancel }: Props) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-100"
        >
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogOut size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">¿Cerrar sesión?</h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            ¿Estás seguro de que quieres cerrar sesión en Golive Academy? Tendrás que volver a autenticarte para ver tus cursos.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
            >
              Cerrar Sesión
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-slate-50 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
