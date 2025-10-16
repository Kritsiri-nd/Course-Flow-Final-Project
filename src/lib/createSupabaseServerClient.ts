import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Async version for server components
export async function createSupabaseServerClient() { 
  const cookieStore = await cookies()

  // Session timeout: 30 นาที (1800 วินาที)
  const SESSION_TIMEOUT = 30 * 60; // 30 minutes in seconds

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // ตั้งเวลาหมดอายุ cookie ให้เป็น 30 นาที สำหรับ session cookies
            const sessionOptions = name.includes('supabase') ? {
              ...options,
              maxAge: SESSION_TIMEOUT, // 30 นาที
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax' as const
            } : options;

            cookieStore.set({ name, value, ...sessionOptions })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Non-async version for server actions
export async function createClient() { 
  const cookieStore = await cookies()

  // Session timeout: 30 นาที (1800 วินาที)
  const SESSION_TIMEOUT = 30 * 60; // 30 minutes in seconds

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // ตั้งเวลาหมดอายุ cookie ให้เป็น 30 นาที สำหรับ session cookies
            const sessionOptions = name.includes('supabase') ? {
              ...options,
              maxAge: SESSION_TIMEOUT, // 30 นาที
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax' as const
            } : options;

            cookieStore.set({ name, value, ...sessionOptions })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}