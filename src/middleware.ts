import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // ส่ง pathname ไปยัง headers เพื่อให้ layout สามารถเข้าถึงได้
  response.headers.set('x-pathname', request.nextUrl.pathname)

  // ตรวจสอบ session timeout สำหรับ Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // ตั้งค่า session timeout 30 นาที
          const sessionOptions = name.includes('supabase') ? {
            ...options,
            maxAge: 30 * 60, // 30 นาที
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const
          } : options;

          response.cookies.set({
            name,
            value,
            ...sessionOptions,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // ตรวจสอบและรีเฟรช session หากจำเป็น
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // ตรวจสอบว่า session หมดอายุหรือไม่
      const now = Math.floor(Date.now() / 1000) // current time in seconds
      const sessionExpiry = session.expires_at || 0
      
      // หาก session จะหมดอายุใน 5 นาทีข้างหน้า ให้รีเฟรช
      if (sessionExpiry - now < 5 * 60) {
        await supabase.auth.refreshSession()
      }
    }
  } catch (error) {
    console.error('Session refresh error:', error)
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
