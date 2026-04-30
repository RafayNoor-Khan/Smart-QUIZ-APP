'use client';

import { useState, useEffect } from 'react';
import { getPendingAssignments, getCompletedAssignments } from '@/lib/actions';
import QuizCard from '@/components/quiz/QuizCard';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'student') {
        window.location.href = '/instructor/dashboard';
        return;
      }
      setUser(parsedUser);
      fetchAssignments(parsedUser.id);
    } else {
      window.location.href = '/login';
    }
  }, []);

  async function fetchAssignments(userId) {
    const [pendingRes, completedRes] = await Promise.all([
      getPendingAssignments(userId),
      getCompletedAssignments(userId),
    ]);

    if (pendingRes.success) setPending(pendingRes.data);
    if (completedRes.success) setCompleted(completedRes.data);
    setLoading(false);
  }

  if (!user) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold">👋 Welcome, {user.name}!</h1>
        <p className="text-lg mt-2">Let's get started with your quizzes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setTab('pending')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            tab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ⏳ Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            tab === 'completed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ✅ Completed ({completed.length})
        </button>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="text-center py-8">Loading quizzes...</div>
        ) : tab === 'pending' ? (
          pending.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-lg">No pending quizzes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pending.map((assignment) => (
                <QuizCard
                  key={assignment.id}
                  quiz={assignment.quiz}
                  deadline={assignment.deadline}
                  status="pending"
                  isPending={true}
                />
              ))}
            </div>
          )
        ) : completed.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg">No completed quizzes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map((assignment) => (
              <QuizCard
                key={assignment.id}
                quiz={assignment.quiz}
                deadline={assignment.deadline}
                status="completed"
                isPending={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}