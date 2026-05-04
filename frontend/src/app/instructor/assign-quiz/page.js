'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllQuizzes, assignQuizToAll } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AssignQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const quizIdParam = searchParams.get('quizId');

  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);

  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [deadline, setDeadline] = useState('');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // AUTH
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return router.replace('/');

    const parsed = JSON.parse(userData);
    if (parsed.role !== 'instructor') return router.replace('/dashboard');

    setUser(parsed);
  }, []);

  // FETCH QUIZZES
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllQuizzes();
        setQuizzes(res.success ? res.data || [] : []);

        if (quizIdParam) setSelectedQuiz(String(quizIdParam));
      } finally {
        setInitialLoading(false);
      }
    };

    load();
  }, [quizIdParam]);

  // ASSIGN
  const handleAssign = async () => {
    if (!selectedQuiz || !deadline) {
      setError('Select quiz and deadline');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await assignQuizToAll(Number(selectedQuiz), deadline);

      if (!res.success) {
        setError(res.message);
        return;
      }

      setSuccess(`Assigned to ${res.data?.assignedCount || 0} students`);

      setTimeout(() => {
        router.push('/instructor/dashboard');
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  if (!user || initialLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <div className="border-b border-zinc-800 px-6 py-8">
        <div className="max-w-4xl mx-auto">

          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-emerald-500 transition underline"
          >
            ← Back
          </button>

          <h1 className="text-5xl font-light text-white mt-3">
            Assign Quiz
          </h1>

          <p className="text-gray-500">
            Assign quizzes to students with deadline
          </p>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {(error || success) && (
          <Alert className={error ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}>
            {error ? <AlertCircle /> : <CheckCircle2 />}
            <AlertDescription>{error || success}</AlertDescription>
          </Alert>
        )}

        {/* QUIZ */}
        <div className="space-y-2">
          <Label className="text-gray-400 uppercase text-xs">Quiz</Label>

          <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:border-emerald-500">
              <SelectValue />
            </SelectTrigger>

            <SelectContent className="bg-zinc-900 border-zinc-800">
              {quizzes.map(q => (
                <SelectItem key={q.id} value={String(q.id)}>
                  {q.topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* DEADLINE */}
        <div className="space-y-2">
          <Label className="text-gray-400 uppercase text-xs">Deadline</Label>

          <input
            type="datetime-local"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 focus:border-emerald-500 outline-none"
          />
        </div>

        {/* BUTTON */}
        <Button
          onClick={handleAssign}
          disabled={!selectedQuiz || !deadline || loading}
          className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : null}
          Assign Quiz
        </Button>

      </div>
    </div>
  );
}