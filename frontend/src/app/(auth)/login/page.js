'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/actions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginUser(email, password);

      if (result.success) {
        // Store user in localStorage for client-side access
        localStorage.setItem('user', JSON.stringify(result.user));

        // Redirect based on role
        if (result.user.role === 'instructor') {
          router.push('/instructor/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-xl p-8'>
      <h1 className='text-3xl font-bold text-center mb-2 text-blue-600'>
        QuizApp
      </h1>
      <p className='text-center text-gray-600 mb-6 text-sm'>
        Login to your account
      </p>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Email Address
          </label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder='you@example.com'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Password
          </label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder='••••••••'
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200'
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className='mt-6 pt-6 border-t border-gray-200'>
        <p className='text-center text-gray-600 text-sm'>
          Don't have an account?{' '}
          <Link
            href='/register'
            className='text-blue-600 hover:text-blue-700 font-semibold'
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}