'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

// Session timeout: 30 นาที
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000 // แจ้งเตือนก่อนหมดอายุ 5 นาที

export function useSessionTimeout() {
  const router = useRouter()
  const supabase = createClient()

  const handleSessionExpired = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login?message=session-expired')
    } catch (error) {
      console.error('Error signing out:', error)
      router.push('/auth/login')
    }
  }, [supabase, router])

  const showSessionWarning = useCallback(() => {
    const shouldExtend = window.confirm(
      'เซสชันของคุณจะหมดอายุในอีก 5 นาที คุณต้องการต่ออายุเซสชันหรือไม่?'
    )
    
    if (shouldExtend) {
      // รีเฟรช session
      supabase.auth.refreshSession()
      return true
    } else {
      handleSessionExpired()
      return false
    }
  }, [supabase, handleSessionExpired])

  useEffect(() => {
    let warningTimer: NodeJS.Timeout
    let expiredTimer: NodeJS.Timeout
    const setupTimers = () => {
      // ตั้งเวลาแจ้งเตือนก่อนหมดอายุ 5 นาที
      warningTimer = setTimeout(() => {
        showSessionWarning()
      }, SESSION_TIMEOUT - WARNING_TIME)

      // ตั้งเวลาหมดอายุ session
      expiredTimer = setTimeout(() => {
        handleSessionExpired()
      }, SESSION_TIMEOUT)
    }

    const resetTimers = () => {
      if (warningTimer) clearTimeout(warningTimer)
      if (expiredTimer) clearTimeout(expiredTimer)
      setupTimers()
    }

    // ฟังก์ชันสำหรับ reset timer เมื่อมี activity
    const activityListener = () => {
      resetTimers()
    }

    // ฟัง user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, activityListener, true)
    })

    // เริ่มต้น timers
    setupTimers()

    // Cleanup
    return () => {
      if (warningTimer) clearTimeout(warningTimer)
      if (expiredTimer) clearTimeout(expiredTimer)
      
      events.forEach(event => {
        document.removeEventListener(event, activityListener, true)
      })
    }
  }, [showSessionWarning, handleSessionExpired])

  return {
    handleSessionExpired,
    showSessionWarning
  }
}