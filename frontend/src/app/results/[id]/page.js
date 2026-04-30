'use client';

import { useState, useEffect } from 'react';
import { getQuizById } from '@/lib/actions';
import ResultsCard from '@/components/quiz/ResultsCard';

export default function ResultsPage({ params }) {
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    // Mock attempt data (In real app, you'd fetch from API)
    const mockAttempt = JSON.parse(localStorage.getItem(`attempt_${params.id}`) || '{"score": 8, "percentage": 80}');
    setAttempt(mockAttempt);

    // Get quiz details
    async function fetchQuiz() {
      // In real scenario, you'd get quizId from the attempt
      const result = await getQuizById(1); // Example
      if (result.success) setQuiz(result.data);
    }

    fetchQuiz();
  }, [params.id]);

  if (!attempt || !quiz) return <div className="text-center py-8">Loading results...</div>;

  return <ResultsCard attempt={attempt} quiz={quiz} />;
}