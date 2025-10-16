'use server'

import { createClient } from '@/lib/createSupabaseServerClient' // 🔴 สำคัญ: ต้อง import server client
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  revalidatePath('/', 'layout') // ล้าง cache ทั้งหมดเพื่อให้แน่ใจว่า session จะถูกล้าง
  redirect('/auth/login') // พาผู้ใช้กลับไปหน้า Login
}