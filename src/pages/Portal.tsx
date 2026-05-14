import { Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { courses } from '../data';

export const Portal = () => {
  const { user, profile, loading, resolvingAccess, noAccess } = useAuth();

  if (loading) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">Cargando…</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (noAccess) return <Navigate to="/no-access" replace />;

  if (resolvingAccess || !profile) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">Comprobando acceso…</div>;
  }

  const visibleCourses = profile.role === 'superadmin'
    ? courses
    : courses.filter(c => profile.course_ids.includes(c.id));

  const firstName =
    (profile.display_name?.split(' ')[0]) ||
    (user.email?.split('@')[0]) ||
    'estudiante';

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-14 md:mb-16"
      >
        <p className="text-[11px] font-black text-golive uppercase tracking-[0.22em] mb-3">
          Tus formaciones
        </p>
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-[-0.035em] leading-[0.95] mb-4">
          Hola, {firstName}.
        </h2>
        <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
          {visibleCourses.length === 0
            ? 'Aún no hay cursos asignados a tu cuenta.'
            : visibleCourses.length === 1
              ? 'Tienes 1 curso activo. Continúa donde lo dejaste.'
              : `Tienes ${visibleCourses.length} cursos activos. Continúa donde lo dejaste.`}
        </p>
      </motion.header>

      {visibleCourses.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-16 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Aún no tienes cursos asignados</h3>
          <p className="text-sm text-slate-500">El administrador del curso te asignará acceso en breve.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {visibleCourses.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} total={visibleCourses.length} />
          ))}
        </div>
      )}
    </div>
  );
};

const CourseCard = ({
  course,
  index,
  total,
}: {
  course: typeof courses[number];
  index: number;
  total: number;
}) => {
  const totalSteps = course.sessions.reduce((n, s) => n + s.script.length, 0);
  const instructorInitial = (course.instructor || '?')[0].toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.06 }}
    >
      <Link
        to={`/course/${course.id}`}
        className="group block bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:border-golive/40 hover:shadow-2xl hover:shadow-golive/10 hover:-translate-y-1 transition-all duration-500"
      >
        <div className="aspect-[16/10] w-full overflow-hidden relative">
          <img
            src={course.image}
            className="w-full h-full object-cover transition-all duration-700 grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.04]"
            alt={course.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent" />

          <div className="absolute top-5 right-5 z-10">
            <div className="px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
            <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-2 block">
              {course.category}
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white leading-[1.05] tracking-[-0.02em]">
              {course.title}
            </h3>
          </div>
        </div>

        <div className="p-6 md:p-7">
          <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed">{course.description}</p>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-golive to-golive-dark flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                {instructorInitial}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.18em]">
                  Instructor
                </p>
                <p className="text-xs font-bold text-slate-700 truncate">{course.instructor}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-golive font-black text-sm group-hover:gap-3 transition-all flex-shrink-0">
              <span>Acceder</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {totalSteps > 0 && (
            <p className="mt-5 pt-5 border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
              {course.sessions.length} sesiones · {totalSteps} módulos
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};
