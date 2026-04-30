'use client';

import { useState } from 'react';
import { generateQuiz, saveQuiz } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function CreateQuizPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGenerate = async () => {
    setError('');
    setLoading(true);

    const result = await generateQuiz(topic);
    if (result.success) {
      setGeneratedQuiz(result.data);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);

    const result = await saveQuiz(generatedQuiz);
    if (result.success) {
      router.push('/instructor/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold">✨ Create Quiz with AI</h1>

      {!generatedQuiz ? (
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              ❌ {error}
            </div>
          )}

          <div>
            <label className="block text-lg font-semibold mb-2">Quiz Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Biology, History, Mathematics"
              className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic || loading}
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 text-lg"
          >
            {loading ? '⏳ Generating...' : '🤖 Generate with AI'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{generatedQuiz.topic}</h2>
            <p className="text-gray-600">Type: {generatedQuiz.type}</p>
          </div>

          {/* Questions Preview */}
          <div className="space-y-6">
            {generatedQuiz.questions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <p className="font-semibold mb-3 text-lg">{index + 1}. {question.question}</p>
                {question.options && (
                  <ul className="space-y-2 ml-4">
                    {question.options.map((option, optIndex) => (
                      <li
                        key={optIndex}
                        className={optIndex === question.answer ? 'font-bold text-green-600' : ''}
                      >
                        {String.fromCharCode(65 + optIndex)}) {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setGeneratedQuiz(null)}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded font-semibold hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : '💾 Save Quiz'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}