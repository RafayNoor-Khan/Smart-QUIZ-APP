'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllQuizzes, deleteQuiz } from '@/lib/actions';
import Link from 'next/link';
import { LogOut, Plus, Trash2 } from 'lucide-react';

export default function InstructorDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // =========================
  // AUTH + HYDRATION SAFE
  // =========================
  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (!userData) {
      router.replace('/');
      return;
    }

    try {
      const parsed = JSON.parse(userData);

      if (parsed.role !== 'instructor') {
        router.replace('/dashboard');
        return;
      }

      setUser(parsed);
    } catch (e) {
      router.replace('/');
    }
  }, []);

  // =========================
  // FETCH QUIZZES (SEPARATE)
  // =========================
  useEffect(() => {
    if (!user) return;

    const loadQuizzes = async () => {
      try {
        const result = await getAllQuizzes();
        setQuizzes(result.success ? result.data || [] : []);
      } catch (err) {
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [user]);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    router.replace('/');
  };

  // =========================
  // DELETE QUIZ
  // =========================
  const handleDeleteQuiz = async (quizId) => {
    setDeleting(quizId);
    try {
      const result = await deleteQuiz(quizId);
      if (result.success) {
        setQuizzes(quizzes.filter((q) => q.id !== quizId));
        setShowDeleteConfirm(null);
      } else {
        alert('Failed to delete quiz: ' + result.message);
      }
    } catch (err) {
      alert('Error deleting quiz');
    } finally {
      setDeleting(null);
    }
  };

  const totalQuestions = quizzes.reduce(
    (acc, quiz) => acc + (quiz.questions?.length || 0),
    0
  );

  // =========================
  // LOADING STATE
  // =========================
  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center text-gray-400">
          <div className="animate-spin h-8 w-8 border border-white border-t-transparent mx-auto mb-4 rounded-full" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <div className="border-b border-zinc-800 py-8 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-start">

          <div>
            <h1 className="text-5xl font-light">
              Welcome, <span className="text-white">{user.name}</span>
            </h1>
            <p className="text-gray-500 font-light">
              Manage quizzes and track progress
            </p>
          </div>

          {/* ACTION BUTTONS (NEON ONLY HERE) */}
          <div className="flex gap-2">

            <Link href="/instructor/create-quiz">
              <button className="px-3 py-2 text-sm font-light border border-zinc-700 text-gray-400 hover:text-white hover:border-white transition rounded-sm flex items-center gap-2">
                <Plus size={14} />
                Create
              </button>
            </Link>

            <Link href="/instructor/assign-quiz">
              <button className="px-3 py-2 text-sm font-light bg-emerald-500 text-black hover:bg-emerald-400 transition rounded-sm flex items-center gap-2">
                <Plus size={14} />
                Assign
              </button>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-light border border-zinc-700 text-gray-400 hover:text-white hover:border-white transition rounded-sm flex items-center gap-2"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-3 gap-8">
        {[
          { label: 'Total Quizzes', value: quizzes.length },
          { label: 'Questions', value: totalQuestions },
          { label: 'Active', value: '—' },
        ].map((stat) => (
          <div key={stat.label} className="border-b border-zinc-800 pb-6">
            <p className="text-gray-500 text-sm uppercase">{stat.label}</p>
            <p className="text-4xl font-light text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* QUIZZES */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        <h2 className="text-3xl font-light mb-8">Your Quizzes</h2>

        {quizzes.length === 0 ? (
          <div className="border border-zinc-800 p-10 text-center text-gray-500">
            No quizzes yet
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">

            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="border border-zinc-800 p-6 rounded-lg space-y-4 relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl text-white">{quiz.topic}</h3>
                    <p className="text-gray-500 text-sm">
                      {quiz.questions?.length || 0} questions
                    </p>
                  </div>
                  
                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => setShowDeleteConfirm(quiz.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition"
                    title="Delete quiz"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-800">

                  <Link href={`/instructor/analytics/${quiz.id}`} className="flex-1">
                    <button className="w-full border border-zinc-700 text-white py-2 rounded-sm hover:border-white transition text-sm">
                      Analytics
                    </button>
                  </Link>

                  <Link href={`/instructor/assign-quiz?quizId=${quiz.id}`} className="flex-1">
                    <button className="w-full bg-emerald-500 text-black py-2 rounded-sm hover:bg-emerald-400 transition text-sm">
                      Assign
                    </button>
                  </Link>

                </div>

                {/* DELETE CONFIRMATION MODAL */}
                {showDeleteConfirm === quiz.id && (
                  <div className="absolute inset-0 bg-black/80 rounded-lg flex items-center justify-center border border-red-500/50">
                    <div className="bg-black border border-red-500/50 rounded-lg p-6 space-y-4 max-w-xs">
                      <p className="text-red-400 font-light">Delete this quiz?</p>
                      <p className="text-gray-400 text-sm">This action cannot be undone.</p>
                      
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="flex-1 border border-zinc-700 text-white py-2 rounded-sm hover:border-white transition text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          disabled={deleting === quiz.id}
                          className="flex-1 bg-red-600 text-white py-2 rounded-sm hover:bg-red-700 transition text-sm disabled:opacity-50"
                        >
                          {deleting === quiz.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}