// import { createClient } from "@supabase/supabase-js";

// export const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );


// lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr'

// ฟังก์ชันนี้สำหรับใช้ใน Client Components ที่มี 'use client' เท่านั้น
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}