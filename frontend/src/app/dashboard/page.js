'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPendingAssignments, getCompletedAssignments } from '@/lib/actions';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import QuizCard from '@/components/quiz/QuizCard';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'student') {
      router.push('/instructor/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchAssignments(parsedUser.id);
  }, [router]);

  const fetchAssignments = async (userId) => {
    const [pendingRes, completedRes] = await Promise.all([
      getPendingAssignments(userId),
      getCompletedAssignments(userId),
    ]);

    setPending(pendingRes.success ? pendingRes.data : []);
    setCompleted(completedRes.success ? completedRes.data : []);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    router.push('/');
  };

  if (!user) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border border-white border-t-transparent mx-auto mb-4'></div>
          <p className='text-gray-400 font-light'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      {/* Header */}
      <div className='border-b border-zinc-800 py-8 px-8'>
        <div className='max-w-7xl mx-auto flex justify-between items-start'>
          <div className='space-y-2'>
            <h1 className='text-5xl font-light tracking-tight'>Welcome, {user.name}</h1>
            <p className='text-gray-500 font-light'>Complete your assigned quizzes</p>
          </div>
          <button
            onClick={handleLogout}
            className='border border-zinc-700 text-gray-400 hover:text-white hover:border-white font-light rounded-sm px-3 py-2 transition flex items-center gap-2 text-sm'
          >
            <LogOut className='h-4 w-4' />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-8 py-12'>
        {/* Stats */}
        <div className='grid grid-cols-2 gap-8 mb-12'>
          <div className='space-y-2 border-b border-zinc-800 pb-6'>
            <p className='text-sm font-light text-gray-500 uppercase tracking-widest'>Pending</p>
            <p className='text-4xl font-light'>{pending.length}</p>
          </div>
          <div className='space-y-2 border-b border-zinc-800 pb-6'>
            <p className='text-sm font-light text-gray-500 uppercase tracking-widest'>Completed</p>
            <p className='text-4xl font-light'>{completed.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex gap-8 border-b border-zinc-800 mb-8'>
          <button
            onClick={() => setTab('pending')}
            className={`pb-3 font-light transition ${
              tab === 'pending'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Pending Quizzes
          </button>
          <button
            onClick={() => setTab('completed')}
            className={`pb-3 font-light transition ${
              tab === 'completed'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Completed Quizzes
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className='flex items-center justify-center py-16'>
            <div className='animate-spin rounded-full h-8 w-8 border border-white border-t-transparent'></div>
          </div>
        ) : tab === 'pending' ? (
          pending.length === 0 ? (
            <div className='border border-zinc-800 rounded-lg p-12 text-center'>
              <p className='text-gray-500 font-light text-lg'>No pending quizzes</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {pending.map((assignment) => {
                return (
                  <QuizCard
                    key={assignment.id}
                    quiz={assignment.quiz}
                    deadline={assignment.deadline}
                    status='pending'
                    isPending={true}
                    attemptId={null}
                  />
                );
              })}
            </div>
          )
        ) : completed.length === 0 ? (
          <div className='border border-zinc-800 rounded-lg p-12 text-center'>
            <p className='text-gray-500 font-light text-lg'>No completed quizzes</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {completed.map((assignment) => {
              // ✅ FIX: Get attemptId from localStorage for completed quizzes
              const attempts = JSON.parse(
                localStorage.getItem(`attempts_${assignment.quizId}`) || '[]'
              );
              const latestAttempt =
                attempts.length > 0 ? attempts[attempts.length - 1] : null;

              return (
                <QuizCard
                  key={assignment.id}
                  quiz={assignment.quiz}
                  deadline={assignment.deadline}
                  status='completed'
                  isPending={false}
                  attemptId={latestAttempt?.id || assignment.id}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}