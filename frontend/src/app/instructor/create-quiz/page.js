'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateQuiz, saveQuiz } from '@/lib/actions';
import { Loader2, AlertCircle, ChevronLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateQuizPage() {
  const [user, setUser] = useState(null);
  const [topic, setTopic] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState('10');
  const [loading, setLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();

  // =========================
  // AUTH CHECK
  // =========================
  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (!userData) return router.push('/');

    const parsed = JSON.parse(userData);

    if (parsed.role !== 'instructor') {
      return router.push('/dashboard');
    }

    setUser(parsed);
  }, [router]);

  // =========================
  // VALIDATE QUESTION
  // =========================
  const isValidQuestion = (q) => {
    return (
      q &&
      typeof q.question === 'string' &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.answer === 'number'
    );
  };

  // =========================
  // GENERATE QUIZ
  // =========================
  const handleGenerate = async () => {
    if (!topic.trim()) return setError('Please enter a topic');

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const num = Math.max(1, Math.min(100, parseInt(numberOfQuestions) || 10));
      const result = await generateQuiz(topic, num);

      if (!result.success || !result.data || !result.data.questions) {
        return setError(result.message || 'Failed to generate quiz');
      }

      const questions = result.data.questions;

      const valid = questions.every(isValidQuestion);

      if (!valid) {
        return setError('Invalid question format received from server');
      }

      setGeneratedQuiz({
        topic: result.data.topic || topic,
        type: result.data.type || 'mcq',
        questions: questions,
      });

      setSuccess(`Generated ${questions.length} questions successfully`);
    } catch (err) {
      setError(err?.message || 'Error generating quiz');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SAVE QUIZ
  // =========================
  const handleSave = async () => {
    if (!generatedQuiz || !generatedQuiz.questions?.length) {
      return setError('No quiz to save');
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        topic: generatedQuiz.topic,
        type: generatedQuiz.type,
        questions: generatedQuiz.questions.map((q) => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
        })),
      };

      const result = await saveQuiz(payload);

      if (!result.success) {
        return setError(result.message || 'Failed to save quiz');
      }

      setSuccess('Quiz saved successfully!');

      setTimeout(() => {
        router.push('/instructor/dashboard');
      }, 1000);
    } catch (err) {
      setError(err?.message || 'Error saving quiz');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-gray-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-6 lg:px-8">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto py-8 border-b border-emerald-500/20">
        <Link href="/instructor/dashboard" className="flex items-center gap-2 text-emerald-400 mb-4">
          <ChevronLeft size={16} />
          Back
        </Link>

        <h1 className="text-4xl md:text-5xl font-light text-emerald-400">
          Create Quiz
        </h1>
      </div>

      {/* BODY */}
      <div className="max-w-5xl mx-auto py-10">

        {!generatedQuiz ? (
          <div className="border border-emerald-500/30 rounded-lg p-6 space-y-6">

            {(error || success) && (
              <div className={`p-3 rounded flex gap-2 text-sm ${
                error
                  ? 'bg-red-500/10 text-red-400 border border-red-500/40'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40'
              }`}>
                {error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                {error || success}
              </div>
            )}

            <input
              className="w-full p-3 bg-zinc-900 border border-emerald-500/30 rounded"
              placeholder="Enter topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />

            <input
              className="w-full p-3 bg-zinc-900 border border-emerald-500/30 rounded"
              type="number"
              min="1"
              max="100"
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(e.target.value)}
            />

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-emerald-500 text-black py-3 rounded font-semibold"
            >
              {loading ? (
                <span className="flex justify-center items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Generating...
                </span>
              ) : (
                'Generate Quiz'
              )}
            </button>

          </div>
        ) : (
          <div className="space-y-6">

            <div className="border border-emerald-500/30 p-6 rounded">
              <h2 className="text-2xl text-emerald-400 mb-4">
                {generatedQuiz.topic}
              </h2>

              <div className="max-h-96 overflow-y-auto space-y-4">
                {generatedQuiz.questions.map((q, i) => (
                  <div key={i} className="border border-zinc-800 p-3 rounded">
                    <p className="text-sm text-white">
                      Q{i + 1}. {q.question}
                    </p>

                    <div className="mt-2 space-y-1 ml-4">
                      {q.options.map((opt, j) => (
                        <div
                          key={j}
                          className={`text-xs p-2 rounded ${
                            j === q.answer
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setGeneratedQuiz(null);
                  setTopic('');
                  setNumberOfQuestions('10');
                }}
                className="flex-1 border border-emerald-500 text-emerald-400 py-3 rounded"
              >
                Regenerate
              </button>

              <button
                onClick={handleSave}
                className="flex-1 bg-emerald-500 text-black py-3 rounded font-semibold"
              >
                Save Quiz
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}