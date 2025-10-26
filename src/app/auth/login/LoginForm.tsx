'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoadingButton } from '@/components/ui/loading';
// import { sign } from 'crypto';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(`Please check your email and password.`);
    } else {
      router.refresh();
    }
    setIsLoading(false);
  };

  // 👇 **จุดแก้ไขหลัก:** ลบ <main> ออก ให้ return แค่ div ที่เป็นกล่องฟอร์ม
  // div นี้มีหน้าที่กำหนด "ความกว้างสูงสุด" ของตัวเอง ไม่ให้ถูกบีบ
  return (
    <div className="space-y-8 rounded-lg bg-white p-10 shadow-lg">
      <div>
        <h1 className="text-left text-3xl font-semibold text-blue-500">
          Welcome back!
        </h1>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {/* --- Email Input --- */}
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

        {/* --- Password Input --- */}
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
            <LoadingButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="w-full justify-center rounded-md border border-transparent btn-blue-500 px-4 py-3 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Log In
            </LoadingButton>
          </div>
        </form>

      <p className="text-center text-sm text-left text-gray-500">
        Don&apos;t have an account ?{' '}
        <Link href="/auth/register" className="font-medium text-blue-500 hover:text-blue-600">
          Register
        </Link>
      </p>
    </div>
  );
}