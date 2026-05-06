'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';

export default function InstructorRegisterPage() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.replace('/');
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== 'instructor') {
        router.replace('/dashboard');
      }
    } catch {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className='min-h-screen bg-black text-white flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-6'>
        <h1 className='text-2xl font-light mb-6'>Create User</h1>
        <RegisterForm />
      </div>
    </div>
  );
}