import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Rocket,
  Menu,
  X,
  Target,
  PenLine,
  Download,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { courses } from '../data';
import { Session, Course, ProgressRow } from '../types';
import { cn } from '../lib/utils';
import { CommentsSection } from '../components/CommentsSection';

export const CourseViewer = () => {
  const { courseId } = useParams();
  const course = courses.find(c => c.id === courseId);
  const { user, profile, loading, resolvingAccess, noAccess } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || !courseId) return;
    let active = true;

    const load = async () => {
      const { data } = await supabase
        .from('progress')
        .select('step_id, completed')
        .eq('user_id', user.id)
        .eq('course_id', courseId);
      if (active && data) {
        setCompletedSteps(data.filter(r => r.completed).map(r => r.step_id as string));
      }
    };
    load();

    const channel = supabase
      .channel(`progress:${user.id}:${courseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progress',
          filter: `user_id=eq.${user.id}`,
        },
        () => { load(); }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user, courseId]);

  if (loading) return <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (noAccess) return <Navigate to="/no-access" replace />;
  if (resolvingAccess || !profile) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">Comprobando acceso…</div>;
  }
  if (!course) return <Navigate to="/portal" replace />;
  if (profile.role !== 'superadmin' && !profile.course_ids.includes(course.id)) {
    return <Navigate to="/portal" replace />;
  }

  const currentSession = course.sessions.find(s => s.id === selectedSessionId) || course.sessions[0];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">
      <aside className={cn(
        "fixed inset-y-16 left-0 z-40 w-72 bg-white border-r border-slate-200 lg:static lg:block transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Curso Actual</p>
          <h1 className="font-bold text-sm text-slate-900 leading-tight">{course.title}</h1>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto">
          {course.sessions.map(s => {
            const isActive = s.id === selectedSessionId;
            const sessionStepsCount = s.script.length;
            const sessionDoneCount = s.script.filter(step => completedSteps.includes(step.id)).length;
            const isFinished = sessionStepsCount > 0 && sessionStepsCount === sessionDoneCount;

            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSessionId(s.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all group relative",
                  isActive ? "bg-golive text-white shadow-lg shadow-golive/20" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-[10px] font-bold uppercase", isActive ? "text-white/70" : "text-slate-400")}>Sesión {s.id}</span>
                  {isFinished && <CheckCircle2 size={12} className={isActive ? "text-white" : "text-green-500"} />}
                </div>
                <p className="font-bold text-xs truncate">{s.title}</p>
                {sessionStepsCount > 0 && !isActive && (
                   <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-golive transition-all"
                      style={{ width: `${(sessionDoneCount / sessionStepsCount) * 100}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 bg-white relative">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-golive text-white rounded-full shadow-2xl flex items-center justify-center z-50 animate-bounce"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <SessionView course={course} session={currentSession} completedSteps={completedSteps} />
          <CommentsSection courseId={course.id} sessionId={String(currentSession.id)} />
        </div>
      </main>
    </div>
  );
};

const SessionView = ({ course, session, completedSteps }: { course: Course, session: Session, completedSteps: string[] }) => {
  const { user } = useAuth();
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev =>
      prev.includes(stepId) ? prev.filter(i => i !== stepId) : [...prev, stepId]
    );
  };

  const toggleComplete = async (stepId: string) => {
    if (!user) return;
    const isCurrentlyDone = completedSteps.includes(stepId);
    const row: Partial<ProgressRow> = {
      user_id: user.id,
      course_id: course.id,
      step_id: stepId,
      completed: !isCurrentlyDone,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('progress')
      .upsert(row, { onConflict: 'user_id,step_id' });
    if (error) console.error('Progress upsert failed:', error);
  };

  return (
    <motion.div
      key={session.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="mb-12">
        <div className="flex items-center gap-2 text-golive font-black tracking-widest text-[10px] uppercase mb-4">
          <Rocket size={14} />
          <span>{session.date}</span>
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          {session.title}
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
           <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
            <Clock size={12} />
            <span>2 horas intensivas</span>
          </div>
          {session.takeaways.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
              <CheckCircle2 size={12} />
              <span>Material Disponible</span>
            </div>
          )}
        </div>
      </header>

      <div className="space-y-16">
        {session.objectives.length > 0 && (
           <section>
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-6 text-xl">
              <Target className="text-golive" size={24} />
              <h3>Objetivos de la sesión</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {session.objectives.map((obj, i) => (
                <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex gap-4">
                  <span className="text-2xl font-black text-golive/20 italic">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{obj}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 text-slate-900 font-bold mb-6 text-xl">
            <Rocket className="text-golive" size={24} />
            <h3>Ruta de Aprendizaje</h3>
          </div>
          <div className="space-y-4">
            {session.script.length > 0 ? session.script.map((step) => {
              const isOpen = expandedSteps.includes(step.id);
              const isDone = completedSteps.includes(step.id);
              return (
                <div
                  key={step.id}
                  className={cn(
                    "group border-2 rounded-3xl transition-all duration-500",
                    isDone ? "border-slate-100 bg-slate-50/40" : "border-slate-100 shadow-sm hover:border-golive/20"
                  )}
                >
                  <div className="p-6 flex items-start gap-5 cursor-pointer" onClick={() => toggleStep(step.id)}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(step.id);
                      }}
                      className={cn(
                        "mt-1 flex-shrink-0 transition-all transform hover:scale-110",
                        isDone ? "text-green-500" : "text-slate-200 group-hover:text-golive"
                      )}
                    >
                      {isDone ? <CheckCircle2 size={32} strokeWidth={2.5} /> : <Circle size={32} strokeWidth={2} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className={cn(
                          "font-black text-lg tracking-tight",
                          isDone ? "text-slate-400 line-through" : "text-slate-900"
                        )}>{step.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md">{step.duration}</span>
                      </div>
                      <p className={cn("text-sm transition-colors", isDone ? "text-slate-400" : "text-slate-500")}>
                        {isOpen ? step.description : (step.description.substring(0, 80) + '...')}
                      </p>

                      {isOpen && step.resources && step.resources.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                          {step.resources.map((res, i) => (
                            <a
                              key={i}
                              href={res.url}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-golive hover:border-golive transition-all shadow-sm"
                            >
                              <Download size={14} /> {res.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="p-12 border-4 border-dotted border-slate-100 rounded-[40px] flex flex-col items-center justify-center text-slate-400 italic">
                <Sparkles size={40} className="mb-4 opacity-20" />
                <p>Contenido en curso...</p>
              </div>
            )}
          </div>
        </section>

        {session.exercises.length > 0 && (
           <section className="bg-slate-900 rounded-[40px] p-10 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <PenLine size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <PenLine className="text-golive" /> Desafío Práctico
              </h3>
              <div className="space-y-6">
                {session.exercises.map(ex => (
                  <div key={ex.id} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                    <h5 className="font-bold text-xl mb-2">{ex.title}</h5>
                    <p className="text-white/70 text-sm leading-relaxed">{ex.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
};
