'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';

export default function ResultsPage({ params }) {
  const { id } = use(params);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Get attempt data from localStorage
      const storedAttempt = localStorage.getItem(`attempt_${id}`);
      if (storedAttempt) {
        setAttempt(JSON.parse(storedAttempt));
      } else {
        setAttempt(null);
      }
    } catch (error) {
      console.error('Error loading results:', error);
      setAttempt(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border border-white border-t-transparent mx-auto mb-4'></div>
          <p className='text-gray-400 font-light'>Loading results...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <div className='text-center space-y-4 border border-zinc-800 rounded-lg p-8'>
          <p className='text-red-400 font-light text-lg'>Results not found</p>
          <p className='text-gray-500 font-light text-sm'>The quiz results could not be retrieved.</p>
          <Link
            href='/dashboard'
            className='text-white hover:text-gray-400 font-light underline'
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isPassed = attempt.percentage >= 60;

  return (
    <div className='min-h-screen bg-black text-white'>
      <div className='max-w-2xl mx-auto px-8 py-12'>
        <div className='border border-zinc-800 rounded-lg p-12 space-y-8'>
          {/* Result Status */}
          <div className='text-center space-y-3'>
            <div className='text-6xl'>
              {isPassed ? '✅' : '❌'}
            </div>
            <h1 className='text-4xl font-light tracking-tight'>
              {isPassed ? 'Quiz Completed' : 'Quiz Completed'}
            </h1>
            <p className='text-gray-500 font-light'>{attempt.quizTopic}</p>
          </div>

          {/* Score Card */}
          <div className={`border rounded-lg p-8 space-y-4 ${
            isPassed
              ? 'border-green-500/50 bg-green-500/10'
              : 'border-red-500/50 bg-red-500/10'
          }`}>
            <p className='text-gray-400 text-center text-xs font-light uppercase tracking-widest'>Your Score</p>
            <p className={`text-6xl font-light text-center ${
              isPassed ? 'text-green-400' : 'text-red-400'
            }`}>
              {attempt.percentage}%
            </p>
            <p className='text-center text-gray-300 font-light'>
              {attempt.score} out of {attempt.total} questions correct
            </p>

            {/* Status Badge */}
            <div className='text-center pt-4'>
              <span className={`inline-block px-4 py-2 rounded-sm text-xs font-light uppercase tracking-widest ${
                isPassed
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-red-500/20 text-red-400 border border-red-500/50'
              }`}>
                {isPassed ? 'Passed' : 'Not Passed'}
              </span>
            </div>
          </div>

          {/* Results Summary */}
          <div className='grid grid-cols-3 gap-4'>
            <div className='border border-zinc-800 rounded-lg p-6 text-center space-y-2'>
              <p className='text-xs font-light text-gray-500 uppercase tracking-widest'>Total</p>
              <p className='text-3xl font-light'>{attempt.total}</p>
            </div>
            <div className='border border-zinc-800 rounded-lg p-6 text-center space-y-2'>
              <p className='text-xs font-light text-gray-500 uppercase tracking-widest'>Correct</p>
              <p className='text-3xl font-light text-green-400'>{attempt.score}</p>
            </div>
            <div className='border border-zinc-800 rounded-lg p-6 text-center space-y-2'>
              <p className='text-xs font-light text-gray-500 uppercase tracking-widest'>Incorrect</p>
              <p className='text-3xl font-light text-red-400'>{attempt.total - attempt.score}</p>
            </div>
          </div>

          {/* Submitted At */}
          <div className='border border-zinc-800 rounded-lg p-4 text-center'>
            <p className='text-sm text-gray-500 font-light'>
              Submitted: <span className='text-white'>{new Date(attempt.submittedAt).toLocaleString()}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3 pt-4 border-t border-zinc-800'>
            <Link
              href='/dashboard'
              className='block w-full bg-white text-black py-3 rounded-sm hover:bg-gray-200 font-light text-center transition text-sm'
            >
              Back to Dashboard
            </Link>
            <Link
              href='/dashboard'
              className='block w-full border border-zinc-700 text-white py-3 rounded-sm hover:border-white hover:bg-white hover:text-black font-light text-center transition text-sm'
            >
              View All Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}