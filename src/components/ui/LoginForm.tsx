// app/login/page.tsx
"use client";
import Link from 'next/link';

const LoginForm = () => {
  return (
    // Section 1: Main container to center the form
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      
      {/* Section 2: Form card */}
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        
        {/* Section 3: Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">
            Welcome back!
          </h1>
        </div>
        
        {/* Section 4: Form element */}
        <form className="mt-8 space-y-6">
          
          {/* Email Input */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter Email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          {/* Password Input */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Log in
            </button>
          </div>
        </form>

        {/* Section 5: Link to Register page */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register
          </Link>
        </p>
        
      </div>
    </main>
  );
};

export default LoginForm;