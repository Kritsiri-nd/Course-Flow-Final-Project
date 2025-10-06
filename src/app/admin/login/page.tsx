'use client';

import AdminLoginForm from "./AdminLoginForm";
import CourseFlowIcon from '@/assets/courseFlowIcon';
import { useRouter } from 'next/navigation'; 

import Link from 'next/link';
import Image from 'next/image';



export default function AdminLoginPage() {

    const router = useRouter();

    return (

        <main className ="flex min-h-screen items-center justify-center
        bg-linear2">
            <div className ="w-full max-w-2xl space-y-8 rounded-lg bg-white p-10 shadow-lg">

                <div className="flex items-center justify-center cursor-pointer" 
                     onClick={() => router.push("/")} >
                    <CourseFlowIcon className="h-[36px] w-[315px] transition-transform hover:scale-105" />
                </div>

                <div>
                    <h1 className="text-center text-h4 text-gray-700 text-bold"
                    >Admin Panel Control</h1>
                </div>

                <AdminLoginForm />

            </div>
        </main>
    );
}