'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getQuizById } from '@/lib/actions';
import QuizInterface from '@/components/quiz/QuizInterface';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const [quiz, setQuiz] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    fetchQuiz();
  }, [router, params.id]);

  const fetchQuiz = async () => {
    const result = await getQuizById(parseInt(params.id));
    if (result.success) {
      setQuiz(result.data);
    } else {
      setError('Quiz not found');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border border-white border-t-transparent mx-auto mb-4'></div>
          <p className='text-gray-400 font-light'>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <div className='text-center space-y-4'>
          <p className='text-red-400 text-lg font-light'>{error || 'Quiz not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className='text-white hover:text-gray-400 font-light underline'
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <QuizInterface quiz={quiz} userId={user?.id} />;
}