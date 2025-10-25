// ในไฟล์ /app/login/page.tsx

import Image from 'next/image';
import LoginForm from './LoginForm';
import { createSupabaseServerClient } from '@/lib/createSupabaseServerClient';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/');
  }

  return (
    // หน้านี้ทำหน้าที่จัด Layout และวาง Background
    <main className="relative flex min-h-screen items-center justify-center bg-gray-50 overflow-hidden">
      
      {/* Background Shapes */}
      <Image
        src="/assets/Vector 8.png" // แก้ Path รูปของคุณ
        alt="Blue decorative shape"
        width={172}
        height={617}
        className="absolute -top-20 right-0 z-10"
      />

      <Image
        src="/assets/Vector 9.png" // แก้ Path รูปของคุณ
        alt="Yellow decorative shape"
        width={113}
        height={418}
        className="absolute left-0 z-10"
      />

      <Image
        src="/assets/Ellipse 4.png" // แก้ Path รูปของคุณ
        alt="Yellow circle decorative shape"
        width={35}
        height={35}
        className="absolute top-125 right-15 z-10"
      />

      <Image
        src="/assets/Ellipse 5.png" // แก้ Path รูปของคุณ
        alt="Yellow circle decorative shape"
        width={75}
        height={75}
        className="absolute top-25 left-15 z-10"
      />

      <Image
        src="/assets/greenX.png" // แก้ Path รูปของคุณ
        alt="Yellow circle decorative shape"
        width={15}
        height={15}
        className="absolute top-55 left-35 z-10"
      />

      
      
      {/* วาง LoginForm ที่เราแก้ไขแล้ว (ซึ่งตอนนี้เป็นแค่กล่องฟอร์ม) */}
      <div className="z-20 w-full max-w-md">
        <LoginForm />
      </div>

    </main>
  );
}