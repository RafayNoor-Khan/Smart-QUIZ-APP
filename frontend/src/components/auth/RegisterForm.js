'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export default function RegisterForm({ onSuccess }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleRoleChange = (value) => {
    setForm((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await registerUser(
        form.email,
        form.name,
        form.password,
        form.role
      );

      if (result.success) {
        // ✅ IMPORTANT: Do NOT overwrite currently logged-in instructor
        setSuccess('User created successfully.');

        // reset form (optional)
        setForm({ name: '', email: '', password: '', role: 'student' });

        onSuccess?.();

        // optional redirect
        setTimeout(() => {
          router.push('/instructor/dashboard');
        }, 400);
      } else {
        setError(result.message || 'Registration failed');
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

      {success && (
        <Alert className='bg-green-500/10 border-green-500/50 text-green-400'>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className='space-y-2'>
        <Label className='text-sm text-gray-300'>Full Name</Label>
        <Input
          id='name'
          value={form.name}
          onChange={handleChange}
          placeholder='John Doe'
          className='bg-zinc-800 border-zinc-700 text-white'
          required
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-sm text-gray-300'>Email</Label>
        <Input
          id='email'
          type='email'
          value={form.email}
          onChange={handleChange}
          placeholder='you@example.com'
          className='bg-zinc-800 border-zinc-700 text-white'
          required
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-sm text-gray-300'>Role</Label>
        <Select value={form.role} onValueChange={handleRoleChange}>
          <SelectTrigger className='bg-zinc-800 border-zinc-700 text-white'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='bg-zinc-800 border-zinc-700'>
            <SelectItem value='student'>Student</SelectItem>
            <SelectItem value='instructor'>Instructor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label className='text-sm text-gray-300'>Password</Label>
        <Input
          id='password'
          type='password'
          value={form.password}
          onChange={handleChange}
          placeholder='••••••••'
          className='bg-zinc-800 border-zinc-700 text-white'
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
            Creating account...
          </>
        ) : (
          'Create User'
        )}
      </Button>
    </form>
  );
}