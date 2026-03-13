import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { syncPendingAttendanceRecords } from '../lib/sync/attendanceSync'

export function useAttendanceSync() {
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return
    }

    void syncPendingAttendanceRecords(user?.id ?? null)

    function handleOnline() {
      void syncPendingAttendanceRecords(user?.id ?? null)
    }

    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [isAuthenticated, isLoading, user?.id])
}
