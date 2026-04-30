'use client';

import Link from 'next/link';
import { formatQuizDate, getDaysLeft, isDeadlinePassed } from '@/lib/utils';

export default function QuizCard({ quiz, deadline, status, isPending }) {
  const daysLeft = getDaysLeft(deadline);
  const isPassed = isDeadlinePassed(deadline);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{quiz.topic}</h3>
          <p className="text-sm text-gray-600">📝 {quiz.questions?.length || 0} Questions</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {status === 'pending' ? '⏳ Pending' : '✅ Completed'}
        </span>
      </div>

      {deadline && (
        <div className="mb-4 text-sm">
          <p className="text-gray-600">
            📅 Deadline: {formatQuizDate(deadline)}
          </p>
          {isPending && daysLeft && (
            <p className={daysLeft <= 1 ? 'text-red-600 font-bold mt-2' : 'text-blue-600 mt-2'}>
              {daysLeft > 0 ? `⏰ ${daysLeft} days left` : '⚠️ Overdue'}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {isPending && !isPassed ? (
          <Link href={`/quiz/${quiz.id}`} className="flex-1">
            <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">
              Start Quiz
            </button>
          </Link>
        ) : (
          <Link href={`/quiz/${quiz.id}`} className="flex-1">
            <button className="w-full border border-blue-600 text-blue-600 py-2 rounded font-semibold hover:bg-blue-50">
              View Details
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}