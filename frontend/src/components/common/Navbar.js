'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');

      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/');
  };

  if (loading) return null;

  return (
    <nav className='border-b border-zinc-200 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        
        <div className='flex items-center justify-between h-14'>
          
          {/* Logo */}
          <Link
            href='/'
            className='text-xl sm:text-2xl font-bold text-blue-600'
          >
            QuizApp
          </Link>

          {/* Right Side */}
          {user ? (
            <div className='flex items-center gap-3 sm:gap-4'>
              
              {/* User Info */}
              <div className='hidden sm:block text-right'>
                <p className='text-sm font-medium text-gray-900'>
                  {user.name}
                </p>
                <p className='text-xs text-gray-500 capitalize'>
                  {user.role}
                </p>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className='px-3 sm:px-4 py-1.5 bg-red-600 text-white text-xs sm:text-sm rounded-md hover:bg-red-700 transition'
              >
                Logout
              </button>
            </div>
          ) : (
            <div className='text-sm text-gray-500'>
              Not signed in
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}