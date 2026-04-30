'use client';

import { useState, useEffect } from 'react';
import { getQuizById } from '@/lib/actions';
import QuizInterface from '@/components/quiz/QuizInterface';

export default function QuizPage({ params }) {
  const [quiz, setQuiz] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    async function fetchQuiz() {
      const result = await getQuizById(Number(params.id));
      if (result.success) {
        setQuiz(result.data);
      } else {
        setError(result.message);
      }
    }

    fetchQuiz();
  }, [params.id]);

  if (error) return <div className="text-center py-8 text-red-600">❌ {error}</div>;
  if (!quiz || !user) return <div className="text-center py-8">Loading quiz...</div>;

  return <QuizInterface quiz={quiz} userId={user.id} />;
}