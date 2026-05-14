import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Comment } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface Props {
  courseId: string;
  sessionId: string;
}

export const CommentsSection = ({ courseId, sessionId }: Props) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('courseId', '==', courseId),
      where('sessionId', '==', sessionId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
    });
  }, [courseId, sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        courseId,
        sessionId,
        text: newComment,
        createdAt: serverTimestamp()
      });
      setNewComment("");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'comments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `comments/${id}`);
    }
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
            <img src={c.userPhoto || ""} alt="U" className="w-10 h-10 rounded-2xl bg-slate-100 object-cover border border-slate-100" />
            <div className="flex-1 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:border-slate-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">{c.userName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400">{c.createdAt?.toDate().toLocaleDateString()}</span>
                  {user?.uid === c.userId && (
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
