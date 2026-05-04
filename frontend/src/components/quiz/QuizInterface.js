'use client';

import { useState, useEffect } from 'react';
import { submitQuiz } from '@/lib/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import ResultCard from './ResultCard';

export default function QuizInterface({ quiz, userId }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(new Array(quiz.questions.length).fill(null));
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');

  useEffect(() => {
    const duration = (quiz.timeLimit || quiz.questions.length * 60);
    setTimeLeft(duration);
  }, [quiz]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleAnswerChange = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // In the handleSubmit function of QuizInterface.js

const handleSubmit = async () => {
  if (submitted) return;

  const confirmed = window.confirm('Are you sure you want to submit? You cannot edit after submission.');
  if (!confirmed) return;

  setLoading(true);
  try {
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        score++;
      }
    });

    const percentage = Math.round((score / quiz.questions.length) * 100);
    const newAttemptId = Date.now();

    const resultData = {
      id: newAttemptId,
      score,
      total: quiz.questions.length,
      percentage,
      answers,
      submittedAt: new Date().toISOString(),
    };

    // ✅ Save to localStorage with attemptId
    localStorage.setItem(`attempt_${newAttemptId}`, JSON.stringify({
      id: newAttemptId,
      quizId: quiz.id,
      quizTopic: quiz.topic,
      userId,
      ...resultData,
    }));

    // ✅ Also save to attempts array for tracking
    const existingAttempts = JSON.parse(localStorage.getItem(`attempts_${quiz.id}`) || '[]');
    existingAttempts.push({
      id: newAttemptId,
      quizId: quiz.id,
      score,
      percentage,
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem(`attempts_${quiz.id}`, JSON.stringify(existingAttempts));

    setAttemptId(newAttemptId);
    setResult(resultData);
    setSubmitted(true);

    // Submit to backend with assignmentId if available
    await submitQuiz(quiz.id, userId, answers, assignmentId);
  } catch (error) {
    console.error('Error:', error);
    setLoading(false);
  }
};

  if (submitted && result && attemptId) {
    return <ResultCard attempt={result} quiz={quiz} attemptId={attemptId} />;
  }

  if (timeLeft === null) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border border-white border-t-transparent mx-auto mb-4'></div>
          <p className='text-gray-400 font-light'>Initializing quiz...</p>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = Math.round(((currentQuestion + 1) / quiz.questions.length) * 100);

  return (
    <div className='min-h-screen bg-black text-white'>
      {/* Header */}
      <div className='border-b border-zinc-800 py-6 px-8 sticky top-0 z-10 bg-black'>
        <div className='max-w-4xl mx-auto flex justify-between items-start'>
          <div className='space-y-2'>
            <h1 className='text-3xl font-light tracking-tight'>{quiz.topic}</h1>
            <p className='text-sm text-gray-500 font-light'>Question {currentQuestion + 1} of {quiz.questions.length}</p>
          </div>
          <div className={`text-center p-3 rounded-lg border ${
            timeLeft < 60
              ? 'border-red-500/50 bg-red-500/10'
              : 'border-green-500/50 bg-green-500/10'
          }`}>
            <div className={`text-xs font-light uppercase tracking-widest ${
              timeLeft < 60 ? 'text-red-400' : 'text-green-400'
            }`}>
              Time Left
            </div>
            <div className={`text-2xl font-light ${
              timeLeft < 60 ? 'text-red-400' : 'text-green-400'
            }`}>
              {minutes}:{seconds < 10 ? '0' : ''}{seconds}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-8 py-12'>
        {/* Progress Bar */}
        <div className='mb-12'>
          <div className='flex justify-between text-xs text-gray-500 font-light mb-3'>
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className='w-full bg-zinc-800 rounded-full h-1 overflow-hidden'>
            <div
              className='bg-white h-1 transition-all duration-300'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className='border border-zinc-800 rounded-lg p-8 mb-12 space-y-6'>
          <div className='space-y-3'>
            <span className='text-xs text-gray-500 font-light uppercase tracking-widest'>Question {currentQuestion + 1}</span>
            <h2 className='text-2xl font-light'>{question.text}</h2>
          </div>

          {/* Options */}
          <div className='space-y-3'>
            {question.options && question.options.length > 0 ? (
              question.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                    answers[currentQuestion] === index
                      ? 'border-white bg-zinc-900'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type='radio'
                    name='answer'
                    value={index}
                    checked={answers[currentQuestion] === index}
                    onChange={() => handleAnswerChange(index)}
                    className='w-4 h-4'
                  />
                  <span className='ml-3 font-light'>{option}</span>
                </label>
              ))
            ) : (
              <p className='text-gray-500 text-center py-4 font-light'>No options available</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className='flex gap-4 mb-12'>
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className='border border-zinc-700 text-gray-400 hover:text-white hover:border-white disabled:opacity-30 font-light rounded-sm px-4 py-2 transition flex items-center gap-2 text-sm'
          >
            <ChevronLeft className='h-4 w-4' />
            Previous
          </button>

          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={handleNext}
              className='flex-1 bg-white text-black hover:bg-gray-200 font-light rounded-sm py-2 transition flex items-center justify-center gap-2 text-sm'
            >
              Next
              <ChevronRight className='h-4 w-4' />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className='flex-1 bg-white text-black hover:bg-gray-200 disabled:opacity-50 font-light rounded-sm py-2 transition flex items-center justify-center gap-2 text-sm'
            >
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-3 w-3 border border-black border-t-transparent'></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className='h-4 w-4' />
                  Submit Quiz
                </>
              )}
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className='border-t border-zinc-800 pt-8 space-y-4'>
          <p className='text-xs font-light text-gray-500 uppercase tracking-widest'>Jump to question</p>
          <div className='flex flex-wrap gap-2'>
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-sm text-xs font-light transition ${
                  index === currentQuestion
                    ? 'bg-white text-black'
                    : answers[index] !== null
                    ? 'bg-zinc-700 text-white border border-zinc-600'
                    : 'bg-zinc-800 text-gray-500 hover:bg-zinc-700'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}