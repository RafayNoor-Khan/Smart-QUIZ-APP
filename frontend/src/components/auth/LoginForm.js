'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export default function LoginForm({ onSuccess }) {
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUser(form.email, form.password);

      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('userId', result.user.id);

        onSuccess?.();

        setTimeout(() => {
          router.push(
            result.user.role === 'instructor'
              ? '/instructor/dashboard'
              : '/dashboard'
          );
        }, 200);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>

      {error && (
        <Alert className='bg-red-500/10 border-red-500/50 text-red-400'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className='space-y-2'>
        <Label htmlFor='email' className='text-sm text-gray-300'>
          Email
        </Label>
        <Input
          id='email'
          type='email'
          value={form.email}
          onChange={handleChange}
          placeholder='you@example.com'
          className='bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-600'
          required
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='password' className='text-sm text-gray-300'>
          Password
        </Label>
        <Input
          id='password'
          type='password'
          value={form.password}
          onChange={handleChange}
          placeholder='••••••••'
          className='bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-600'
          required
        />
      </div>

      <Button
        type='submit'
        disabled={loading}
        className='w-full bg-white text-black hover:bg-gray-200'
      >
        {loading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );
}