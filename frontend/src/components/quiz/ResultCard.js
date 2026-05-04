'use client';

import Link from 'next/link';

export default function ResultCard({ attempt, quiz }) {
  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A', color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-500/10' };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/10' };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10' };
    return { grade: 'F', color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-500/10' };
  };

  const gradeInfo = getGrade(attempt.percentage);

  return (
    <div className='min-h-screen bg-black text-white flex items-center justify-center px-8'>
      <div className='border border-zinc-800 rounded-lg p-12 max-w-2xl w-full space-y-8'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <h1 className='text-4xl font-light tracking-tight'>Quiz Completed</h1>
          <p className='text-gray-500 font-light'>{quiz.topic}</p>
        </div>

        {/* Grade */}
        <div className={`text-center border ${gradeInfo.border} rounded-lg ${gradeInfo.bg} py-8 space-y-2`}>
          <p className='text-xs font-light text-gray-500 uppercase tracking-widest'>Your Grade</p>
          <div className={`text-6xl font-light ${gradeInfo.color}`}>
            {gradeInfo.grade}
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='border border-zinc-800 rounded-lg p-6 space-y-2'>
            <p className='text-xs font-light text-gray-500 uppercase tracking-widest'>Score</p>
            <p className='text-3xl font-light'>{attempt.score}/{quiz.questions.length}</p>
          </div>
          <div className='border border-zinc-800 rounded-lg p-6 space-y-2'>
            <p className='text-xs font-light text-gray-500 uppercase tracking-widest'>Percentage</p>
            <p className='text-3xl font-light'>{attempt.percentage}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='space-y-2'>
          <div className='flex justify-between text-xs font-light text-gray-500'>
            <span>Correct Answers</span>
            <span>{attempt.score} out of {quiz.questions.length}</span>
          </div>
          <div className='w-full bg-zinc-800 rounded-full h-2 overflow-hidden'>
            <div
              className='bg-white h-2 transition-all duration-500'
              style={{ width: `${attempt.percentage}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className='pt-6 border-t border-zinc-800 space-y-3'>
          <Link href='/dashboard' className='block'>
            <button className='w-full bg-white text-black hover:bg-gray-200 py-3 rounded-sm font-light transition text-sm'>
              Back to Dashboard
            </button>
          </Link>
          <Link href='/dashboard?tab=completed' className='block'>
            <button className='w-full border border-zinc-700 text-white hover:border-white py-3 rounded-sm font-light transition text-sm'>
              View All Results
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}