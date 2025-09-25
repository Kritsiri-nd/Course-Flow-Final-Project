'use client';

import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import { redirect } from 'next/navigation';
import AdminLoginForm from './AdminLoginForm';

export default async function AdminLoginPage() {

   return(
      <AdminLoginForm />
   );
}