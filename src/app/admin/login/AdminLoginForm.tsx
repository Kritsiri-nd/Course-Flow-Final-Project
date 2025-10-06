'use client';

import { useActionState } from 'react'; 
import { useFormStatus } from 'react-dom';
import { signInAsAdmin } from "./actions";
// import { SignInAsAdmin } from './actions';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
        type = "submit"
        disabled = {pending}
        className = "flex w-full items-center justify-center  rounded-lg bg-blue-500 px-4 py-3 text-white font-blod text-lg"
        >
            {pending ? 'Logging in...' : 'Log In'}
        </button>
    );
}

export default function AdminLoginForm() {

     const [state, formAction] = useActionState(signInAsAdmin, undefined);

    return (
        <form action={formAction} className="space-y-6">
            <div>
                <label htmlFor="email" className="block font-sans text-base font-normal leading-normal tracking-normal">
                    Email
                </label>
                <div className="mt-3">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="Enter Email"
                        className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-b2"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block font-sans text-base font-normal leading-normal tracking-normal">
                    Password
                </label>
                <div className="mt-3">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        placeholder="Enter Password"
                        className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-b2"
                    />
                </div>
            </div>

            {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
            )}

             <div>
            <SubmitButton />
            </div>

        </form>
    );
}