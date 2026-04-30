'use client';

import { useState, useEffect } from 'react';
import { getAllQuizzes } from '@/lib/actions';
import Link from 'next/link';

export default function InstructorDashboard() {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    async function fetchQuizzes() {
      const result = await getAllQuizzes();
      if (result.success) setQuizzes(result.data);
      setLoading(false);
    }

    fetchQuizzes();
  }, []);

  if (!user) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">👋 Welcome, {user.name}!</h1>
          <p className="text-gray-600 mt-2">Manage your quizzes and assignments</p>
        </div>
        <div className="flex gap-2">
          <Link href="/instructor/create-quiz" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            ➕ Create Quiz
          </Link>
          <Link href="/instructor/assign-quiz" className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50">
            📤 Assign Quiz
          </Link>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">📚 Your Quizzes</h2>
        {loading ? (
          <div className="text-center py-8">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <p className="text-gray-600 text-lg">No quizzes created yet. Create one to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="border rounded-lg p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-bold mb-2">{quiz.topic}</h3>
                <p className="text-gray-600 mb-4">📝 {quiz.questions?.length || 0} Questions</p>
                <div className="flex gap-2">
                  <Link href={`/instructor/analytics/${quiz.id}`} className="flex-1">
                    <button className="w-full border border-blue-600 text-blue-600 py-2 rounded font-semibold hover:bg-blue-50">
                      📊 Analytics
                    </button>
                  </Link>
                  <Link href={`/instructor/assign-quiz?quizId=${quiz.id}`} className="flex-1">
                    <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">
                      Assign
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}