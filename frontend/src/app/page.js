'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import LoginForm from '@/components/auth/LoginForm';

export default function Home() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);

      if (userData.role === 'instructor') {
        router.push('/instructor/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [router]);

  return (
    <div className='min-h-screen bg-black text-white flex flex-col'>
      {/* NAVBAR */}
      <nav className='flex justify-between items-center px-4 sm:px-8 py-6'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 sm:w-10 sm:h-10 rounded bg-white flex items-center justify-center text-black font-bold'>
            Q
          </div>
          <span className='text-lg sm:text-xl font-light'>QuizApp</span>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className='bg-white text-black hover:bg-gray-200 font-light px-4 sm:px-6 py-2 rounded-sm text-sm sm:text-base'>
              Sign In
            </Button>
          </DialogTrigger>

          <DialogContent className='max-w-md sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-lg'>
            <DialogHeader className='mb-6'>
              <DialogTitle className='text-xl sm:text-2xl font-light text-white'>
                Welcome
              </DialogTitle>
            </DialogHeader>

            {/* ✅ Only Login tab now */}
            <Tabs defaultValue='login' className='w-full'>
              <TabsList className='grid grid-cols-1 bg-zinc-800 border-b border-zinc-700 rounded-none mb-6'>
                <TabsTrigger value='login' className='font-light'>
                  Sign In
                </TabsTrigger>
              </TabsList>

              <TabsContent value='login'>
                <LoginForm onSuccess={() => setOpen(false)} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </nav>

      {/* HERO */}
      <main className='flex-1 flex items-center justify-center px-4 sm:px-8 py-16 sm:py-20'>
        <div className='max-w-3xl w-full text-center space-y-12 sm:space-y-16'>
          {/* Heading */}
          <div className='space-y-5'>
            <h1 className='text-4xl sm:text-6xl md:text-7xl font-light leading-tight'>
              Create Quizzes
              <br />
              <span className='font-extralight'>Track Progress</span>
            </h1>

            <p className='text-gray-400 text-base sm:text-lg font-light max-w-xl mx-auto'>
              A minimal platform for educators. Create quizzes, assign to students, analyze results.
            </p>
          </div>

          {/* CTA */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className='bg-white text-black hover:bg-gray-200 font-light px-6 sm:px-8 py-3 rounded-sm'>
                Get Started
              </Button>
            </DialogTrigger>
          </Dialog>

          {/* FEATURES */}
          <div className='grid gap-8 sm:gap-10 pt-6 sm:pt-10'>
            <div>
              <h3 className='text-xs sm:text-sm text-gray-300 uppercase tracking-widest'>
                Feature One
              </h3>
              <p className='text-gray-500 font-light mt-1'>
                Create and manage quizzes with ease
              </p>
            </div>

            <div>
              <h3 className='text-xs sm:text-sm text-gray-300 uppercase tracking-widest'>
                Feature Two
              </h3>
              <p className='text-gray-500 font-light mt-1'>
                Assign to students instantly
              </p>
            </div>

            <div>
              <h3 className='text-xs sm:text-sm text-gray-300 uppercase tracking-widest'>
                Feature Three
              </h3>
              <p className='text-gray-500 font-light mt-1'>
                Deep analytics and insights
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className='border-t border-zinc-800 py-6 px-4 sm:px-8 text-center text-gray-500 text-xs sm:text-sm font-light'>
        © 2024 QuizApp. Minimal. Clean. Focused.
      </footer>
    </div>
  );
}