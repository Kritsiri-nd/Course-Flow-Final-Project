'use client';

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";



const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);


export default function RegisterPage() {

  const router = useRouter();

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [education, setEducation] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');


  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    

  const supabase = createClient();

  const  { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
      first_name: firstName,    
      last_name: lastName,      
      date_of_birth: dob,       
      education: education 
      },
    }
});

if (signUpError) {
  setError(signUpError.message);
}else{
  setMessage('Register success! Please check your email to confirm your account.');
  setFirstName('');
  setLastName('');
  setDob('');
  setEducation('');
  setEmail('');
  setPassword(''); 
  
  // router.push('/auth/login');

}

setIsLoading(false);

};


return(
<>
  <Navbar />
    
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 font-sans">

      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 ">

        <div>
          <h1 className="text-center text-3xl font-bold text-blue-500">Register to start leaning!</h1>
        </div>

        <form onSubmit={handleRegister} className="mt-8 space-y-6">

          <div className="grid grid-cols-1 gap-y-6 sm:gap-x-4">

            <div>
              <label  htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name</label>
                <input  
                type="text"
                value={firstName }
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Enter your First Name"
                className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
                />
            </div>

            <div>
              <label  htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                Last Name</label>
                <input
                type="text"
                value={lastName }
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Enter your Last Name"
                className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
                />
            </div>

            <div className="relative">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
              <label  htmlFor="Education" className="block text-sm font-medium text-gray-700">
                Education Background</label>
                <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                required
                placeholder="Enter Education Background"
                className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
                />
            </div>

            <div>
              <label  htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email</label>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter Email"
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
                placeholder="Enter Password"
                className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
                />
            </div>

            {message && <p className="text-green-500">{message}</p>}
            {error && <p className="text-red-500">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-3.5 font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-60"
                disabled={isLoading}
              >
              {isLoading ? 'Registering...' : 'Register'}
              </button>

          </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
        </form>

      </div>

    </main>

</>
)
}

