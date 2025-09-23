'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/navbar'; 
import { sign } from 'crypto';


export default function LoginPage() {

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
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false)
    }else{
      setMessage('Login successful! Redirecting...');
      router.push('/auth/login/success');
    }

    setIsLoading(false);
  };

  return(
    <>
    
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 font-sans">

      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 ">
        <div>
          <h1 className="text-center text-3xl font-bold text-blue-500">Welcome back!</h1>
        </div>

        <form onSubmit={handleLogin} className="">

          <div className="grid grid-cols-1 gap-y-10">

            <div>
              <label  htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email</label>
                <input  
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your Email"
                className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
                />
            </div>

            <div>
              <label  htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password</label>
                <input  
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your Password"
                className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
                />

                 {error && <p className="text-sm text-red-500">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
            
            </div>

          </div>
          
        </form>

      </div>

    </main>


    </>

  );
}
