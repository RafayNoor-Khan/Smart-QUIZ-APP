// components/quiz/QuizCard.js

'use client';

import Link from 'next/link';
import { formatQuizDate, getDaysLeft, isDeadlinePassed } from '@/lib/utils';

export default function QuizCard({ quiz, deadline, status, isPending, attemptId }) {
  const daysLeft = getDaysLeft(deadline);
  const isPassed = isDeadlinePassed(deadline);

  return (
    <div className='border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition space-y-4 group bg-black text-white'>
      <div className='flex justify-between items-start'>
        <div className='space-y-1'>
          <h3 className='text-lg font-light text-white group-hover:text-gray-300 transition'>{quiz.topic}</h3>
          <p className='text-sm text-gray-500 font-light'>{quiz.questions?.length || 0} questions</p>
        </div>
        <span className={`text-xs font-light px-2 py-1 rounded-sm border ${
          status === 'pending'
            ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
            : 'border-green-500/50 bg-green-500/10 text-green-400'
        }`}>
          {status === 'pending' ? 'Pending' : 'Completed'}
        </span>
      </div>

      {deadline && (
        <div className='space-y-2 text-sm'>
          <p className='text-gray-400 font-light'>
            {formatQuizDate(deadline)}
          </p>
          {isPending && daysLeft && (
            <p className={`font-light ${daysLeft <= 1 ? 'text-red-400' : 'text-gray-400'}`}>
              {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Overdue'}
            </p>
          )}
        </div>
      )}

      <div className='pt-2 border-t border-zinc-800'>
        {status === 'pending' && !isPassed ? (
          <Link href={`/quiz/${quiz.id}`} className='block'>
            <button className='w-full bg-white text-black py-2 rounded-sm font-light hover:bg-gray-200 transition text-sm'>
              Start Quiz
            </button>
          </Link>
        ) : status === 'completed' ? (
          <Link href={`/results/${attemptId}`} className='block'>
            <button className='w-full border border-zinc-700 text-white py-2 rounded-sm font-light hover:border-white hover:bg-white hover:text-black transition text-sm'>
              View Details
            </button>
          </Link>
        ) : (
          <Link href={`/quiz/${quiz.id}`} className='block'>
            <button className='w-full bg-white text-black py-2 rounded-sm font-light hover:bg-gray-200 transition text-sm'>
              Start Quiz
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}