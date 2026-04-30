'use client';

import { useState, useEffect } from 'react';
import { getAllQuizzes, assignQuizToAll } from '@/lib/actions';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function AssignQuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizIdParam = searchParams.get('quizId');

  useEffect(() => {
    async function fetchQuizzes() {
      const result = await getAllQuizzes();
      if (result.success) {
        setQuizzes(result.data);
        if (quizIdParam) {
          setSelectedQuiz(quizIdParam);
        }
      }
    }

    fetchQuizzes();
  }, [quizIdParam]);

  const handleAssign = async () => {
    if (!selectedQuiz || !deadline) {
      setError('Please select a quiz and deadline');
      return;
    }

    setError('');
    setLoading(true);

    const result = await assignQuizToAll(Number(selectedQuiz), deadline);
    if (result.success) {
      setSuccess(`✅ Quiz assigned to ${result.data.assignedCount} students!`);
      setTimeout(() => router.push('/instructor/dashboard'), 2000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold">📤 Assign Quiz to Students</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div>
          <label className="block text-lg font-semibold mb-2">Select Quiz</label>
          <select
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
            className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Choose a quiz...</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.topic} ({quiz.questions?.length} questions)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-lg font-semibold mb-2">Deadline</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleAssign}
          disabled={!selectedQuiz || !deadline || loading}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 text-lg"
        >
          {loading ? '⏳ Assigning...' : '✅ Assign to All Students'}
        </button>
      </div>
    </div>
  );
}