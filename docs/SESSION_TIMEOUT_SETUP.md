# Session Timeout Configuration - 30 นาที

## การตั้งค่าที่ดำเนินการแล้ว

### 1. Server-Side Configuration

#### ` สำหรับsrc/lib/createSupabaseServerClient.ts`
- เพิ่มการตั้งค่า `maxAge: 30 * 60` (30 นาที) Supabase cookies
- ใช้ `httpOnly: true` และ `secure` สำหรับความปลอดภัย
- ตั้งค่า `sameSite: 'lax'` เพื่อป้องกัน CSRF

#### `src/middleware.ts`
- เพิ่มการตรวจสอบ session expiry ทุก request
- Auto-refresh session หาก session จะหมดอายุใน 5 นาที
- ตั้งค่า cookie options ให้มี maxAge 30 นาที

### 2. Client-Side Configuration

#### `src/hooks/useSessionTimeout.ts`
- Hook สำหรับจัดการ session timeout ฝั่ง client
- แจ้งเตือนผู้ใช้ก่อนหมดอายุ 5 นาที
- ตรวจสอบ user activity และ reset timer อัตโนมัติ
- Auto logout เมื่อ session หมดอายุ

#### `src/components/providers/SessionTimeoutProvider.tsx`
- Component wrapper สำหรับจัดการ session timeout
- ใช้ใน layout เพื่อครอบคลุมทั้งแอปพลิเคชัน

#### `src/lib/supabaseClient.ts`
- ตั้งค่า `autoRefreshToken: true` สำหรับ client-side
- เปิดใช้งาน `persistSession` และ `detectSessionInUrl`

### 3. Layout Integration

#### `src/app/layout.tsx`
- เพิ่ม `SessionTimeoutProvider` wrapper
- ส่งข้อมูล session state ไปยัง provider

## การทำงานของระบบ

### 🕐 Timeline การทำงาน:
```
Login ──→ 25 นาที ──→ แจ้งเตือน (5 นาทีเหลือ) ──→ 30 นาที ──→ Auto Logout
         │                    │                              │
         │                    │── User ขอต่ออายุ ──→ Reset Timer
         │
         └── User Activity ──→ Reset Timer (ทุกครั้งที่มี activity)
```

### 🔄 Activity Detection:
- Mouse events: `mousedown`, `mousemove`, `click`
- Keyboard events: `keypress`
- Touch events: `touchstart`
- Scroll events: `scroll`

### ⚠️ Warning System:
- แจ้งเตือนก่อนหมดอายุ 5 นาที
- ให้ผู้ใช้เลือกต่ออายุหรือ logout
- หากไม่ตอบสนอง จะ logout อัตโนมัติ

### 🔒 Security Features:
- **HttpOnly Cookies**: ป้องกัน XSS attacks
- **Secure Cookies**: ใช้ HTTPS ใน production
- **SameSite**: ป้องกัน CSRF attacks
- **Auto Refresh**: ป้องกัน session hijacking

## การใช้งาน

### สำหรับผู้พัฒนา:
1. Session timeout จะทำงานอัตโนมัติเมื่อ user login
2. ไม่ต้องเรียกใช้เพิ่มเติม - ทำงานผ่าน layout wrapper
3. สามารถปรับเวลาได้ที่ตัวแปร `SESSION_TIMEOUT`

### สำหรับผู้ใช้:
1. ระบบจะแจ้งเตือนก่อนหมดอายุ 5 นาที
2. สามารถขอต่ออายุ session ได้
3. หากไม่มี activity จะ logout อัตโนมัติ
4. การใช้งานปกติจะ reset timer อัตโนมัติ

## Environment Variables ที่จำเป็น:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production # สำหรับ secure cookies
```

## การ Customization:

### เปลี่ยนเวลา Session Timeout:
```typescript
// ใน src/lib/createSupabaseServerClient.ts และ src/hooks/useSessionTimeout.ts
const SESSION_TIMEOUT = 45 * 60; // เปลี่ยนเป็น 45 นาที
```

### เปลี่ยนเวลาแจ้งเตือน:
```typescript
// ใน src/hooks/useSessionTimeout.ts  
const WARNING_TIME = 10 * 60 * 1000; // เปลี่ยนเป็นแจ้งเตือนก่อน 10 นาที
```

### เปลี่ยนข้อความแจ้งเตือน:
```typescript
// ใน src/hooks/useSessionTimeout.ts
const shouldExtend = window.confirm(
  'ข้อความแจ้งเตือนของคุณ'
)
```

---

✅ **การตั้งค่า Session Timeout 30 นาทีเสร็จสมบูรณ์!**