import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // ส่ง pathname ไปยัง headers เพื่อให้ส่วนอื่นของแอปเข้าถึงได้
  response.headers.set('x-pathname', request.nextUrl.pathname)

  // สร้าง Supabase client สำหรับฝั่ง Server (ใน Middleware)
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

  // --- START: ส่วนของ Logic การตรวจสอบสิทธิ์ ---

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const pathname = request.nextUrl.pathname;

    const isAdminPath = pathname.startsWith('/admin');
    const isAdminLoginPath = pathname === '/admin/login';
    
    // ตรวจสอบและรีเฟรช session หากจำเป็น
    if (session) {
      // ตรวจสอบว่า session หมดอายุหรือไม่
      const now = Math.floor(Date.now() / 1000) // current time in seconds
      const sessionExpiry = session.expires_at || 0
      
      // หาก session จะหมดอายุใน 5 นาทีข้างหน้า ให้รีเฟรช
      if (sessionExpiry - now < 5 * 60) {
        await supabase.auth.refreshSession()
      }
    }
    
    // 1. ตรวจสอบผู้ใช้ที่ยังไม่ได้ Login
    if (!session) {
      // ถ้ายังไม่ login และพยายามเข้าหน้า admin อื่นๆ ที่ไม่ใช่หน้า login
      // ให้ redirect ไปที่หน้า login
      if (isAdminPath && !isAdminLoginPath) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
      }
      // ถ้าเข้าหน้าอื่น หรือหน้า login ก็ให้ไปต่อได้
      return response;
    }

    // 2. ตรวจสอบผู้ใช้ที่ Login แล้ว
    // ดึงข้อมูล role จากตาราง profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const userRole = profile?.role;

    // 2.1) กรณีเป็น Admin
    if (userRole === 'admin') {
      // ถ้า Admin login แล้ว และกำลังจะเข้าหน้า login อีกครั้ง
      // ให้ redirect ไปยังหน้า dashboard ของ admin เลย
      if (isAdminLoginPath) {
        return NextResponse.redirect(new URL('/admin/courses', request.url));
      }
    } 
    // 2.2) กรณีเป็น User (หรือ Role อื่นๆ ที่ไม่ใช่ Admin)
    else {
      // ถ้าไม่ใช่ Admin แต่พยายามเข้าหน้า admin ใดๆ
      // ให้ redirect กลับไปที่หน้าแรก
      if (isAdminPath) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

  } catch (error) {
    console.error('Middleware Error:', error);
    // หากเกิดข้อผิดพลาดใดๆ ในการตรวจสอบ session และเป็น admin path
    // ให้ redirect ไปหน้า login เพื่อความปลอดภัย
    if (request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  // --- END: ส่วนของ Logic การตรวจสอบสิทธิ์ ---
  
  // หากผ่านเงื่อนไขทั้งหมด ให้ไปต่อตามปกติ
  return response;
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
