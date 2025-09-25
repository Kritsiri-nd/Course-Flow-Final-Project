'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sign } from 'crypto';

import CourseFlowIcon from '@/assets/courseFlowIcon';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(`Please check your email and password.`);
      setIsLoading(false);
      return;
    }

    const userRole = data.user?.user_metadata?.role;

    if (userRole === 'admin') {
      router.refresh();
      router.push('/admin/courses');
    } else {
      setError('Access denied. Admins only.');
      await supabase.auth.signOut();
      setIsLoading(false);
      return;
    }
  };

  return (
    <main className="flex justify-center min-h-screen items-center justify-center bg-blue-500 px-4 py-12 font-sans">
      
      <div className="justify-center w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-lg">

        <div className="flex cursor-pointer justify-center" onClick={() => router.push("/admin/login")}>
          <CourseFlowIcon className="mt-1 h-[30px] w-[270px] transition-transform hover:scale-105 sm:h-[16px] sm:w-[140px] md:h-[18px] md:w-[160px] lg:h-[20px] lg:w-[180px]" />
        </div>

        <div>
          <h1 className="text-center text-l font-bold text-indigo-600">Admin Panel Control</h1>
        </div>

        
        <form onSubmit={handleLogin} className="space-y-6">
          
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter Email"
                className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* --- Group 2: Password Input --- */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter Password"
                className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Display Error Message */}
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          {/* --- Group 3: Submit Button --- */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>

        {/* <p className="text-center text-sm text-gray-500">
         Do you have an Account{' '}
          <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register
          </Link>
        </p> */}

      </div>
    </main>
  );
}
