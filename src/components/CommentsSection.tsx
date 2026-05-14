import { useState, useEffect, FormEvent } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Comment } from '../types';

interface Props {
  courseId: string;
  sessionId: string;
}

export const CommentsSection = ({ courseId, sessionId }: Props) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('course_id', courseId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });
      if (active && !error && data) setComments(data as Comment[]);
    };
    load();

    const channel = supabase
      .channel(`comments:${courseId}:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `course_id=eq.${courseId}`,
        },
        () => { load(); }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [courseId, sessionId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      user_id: user.id,
      user_name: profile?.display_name || user.email,
      user_photo: profile?.photo_url,
      course_id: courseId,
      session_id: sessionId,
      text: newComment,
    });
    if (error) console.error('Comment insert failed:', error);
    else setNewComment("");
    setIsSubmitting(false);
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) console.error('Comment delete failed:', error);
  };

  return (
    <section className="mt-24 pt-16 border-t border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <MessageSquare className="text-golive" /> Comunidad y Dudas
        </h3>
        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-400 uppercase tracking-widest">
          {comments.length} Comentarios
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mb-10 group">
        <div className="bg-slate-50 rounded-3xl p-2 border-2 border-slate-100 group-focus-within:border-golive/20 group-focus-within:bg-white transition-all">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="¿Tienes alguna duda o quieres compartir algo?"
            className="w-full bg-transparent p-4 text-sm focus:outline-none resize-none min-h-[100px]"
          />
          <div className="flex justify-end p-2 border-t border-slate-100 mt-2">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="bg-golive text-white px-6 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-golive/20 disabled:opacity-50"
            >
              <Send size={14} /> Publicar
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-6">
        {comments.map(c => (
          <div key={c.id} className="flex gap-4 group">
            {c.user_photo ? (
              <img src={c.user_photo} alt="" className="w-10 h-10 rounded-2xl bg-slate-100 object-cover border border-slate-100" />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm border border-slate-100">
                {(c.user_name || '?')[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:border-slate-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">{c.user_name || c.user_id}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                  {user?.id === c.user_id && (
                    <button onClick={() => deleteComment(c.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
