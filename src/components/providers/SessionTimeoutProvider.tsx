'use client'

import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { useEffect } from 'react'

interface SessionTimeoutProviderProps {
  children: React.ReactNode
  hasSession: boolean
}

export default function SessionTimeoutProvider({ 
  children, 
  hasSession 
}: SessionTimeoutProviderProps) {
  const { handleSessionExpired } = useSessionTimeout()

  useEffect(() => {
    if (!hasSession) {
      // หาก session หมดอายุแล้ว ให้ redirect ไปหน้า login
      return
    }
  }, [hasSession, handleSessionExpired])

  return <>{children}</>
}