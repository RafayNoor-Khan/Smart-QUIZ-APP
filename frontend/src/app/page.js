'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      router.push(parsedUser.role === 'student' ? '/dashboard' : '/instructor/dashboard');
    }
  }, [router]);

  if (user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-gray-900">📚 QuizHub</h1>
        <p className="text-2xl text-gray-600">
          AI-Powered Quiz Platform for Students & Teachers
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
            🔐 Login
          </Link>
          <Link href="/register" className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50">
            📝 Register
          </Link>
        </div>
      </div>
    </div>
  );
}