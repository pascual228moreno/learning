import { Link, Navigate } from 'react-router-dom';
import { ChevronRight, GraduationCap, User as UserIcon } from 'lucide-react';
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Mis Formaciones</h2>
        <p className="text-slate-500">Selecciona un curso para continuar donde lo dejaste.</p>
      </div>

      {visibleCourses.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Aún no tienes cursos asignados</h3>
          <p className="text-sm text-slate-500">El administrador del curso te asignará acceso en breve.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {visibleCourses.map(course => (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-golive/30 hover:shadow-2xl hover:shadow-golive/5 transition-all duration-500"
            >
              <div className="aspect-video w-full overflow-hidden relative">
                <img
                  src={course.image}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={course.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-2">{course.category}</span>
                  <h3 className="text-xl font-bold text-white leading-tight">{course.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <UserIcon size={12} className="text-slate-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-1 text-golive font-bold text-sm">
                    <span>Acceder</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
