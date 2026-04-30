'use client';

import { useState, useEffect } from 'react';
import { submitQuiz } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function QuizInterface({ quiz, userId }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(new Array(quiz.questions.length).fill(null));
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleSubmit = async () => {
    if (window.confirm('Are you sure? You cannot edit after submission.')) {
      setLoading(true);
      const result = await submitQuiz(quiz.id, userId, answers);

      if (result.success) {
        router.push(`/results/${result.data.attemptId}`);
      } else {
        alert('Error: ' + result.message);
        setLoading(false);
      }
    }
  };

  const question = quiz.questions[currentQuestion];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-6 border-b">
        <h1 className="text-2xl font-bold">{quiz.topic}</h1>
        <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-green-600'}`}>
          ⏱️ {minutes}:{seconds < 10 ? '0' : ''}{seconds}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <span>{Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-6">{question.text}</h2>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                answers[currentQuestion] === index
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={index}
                checked={answers[currentQuestion] === index}
                onChange={() => handleAnswerChange(index)}
                className="w-5 h-5"
              />
              <span className="ml-3 text-lg">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-8">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-2 border rounded font-semibold hover:bg-gray-50 disabled:opacity-50"
        >
          ← Previous
        </button>

        {currentQuestion < quiz.questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : '✅ Submit Quiz'}
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-8 pt-8 border-t">
        <p className="text-sm font-semibold text-gray-600 mb-3">Jump to question:</p>
        <div className="grid grid-cols-10 gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded font-semibold text-sm transition ${
                index === currentQuestion
                  ? 'bg-blue-600 text-white'
                  : answers[index] !== null
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}