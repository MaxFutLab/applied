import { useEffect } from 'react'
import { syncPendingAttendanceRecords } from '../lib/sync/attendanceSync'

export function useAttendanceSync() {
  useEffect(() => {
    void syncPendingAttendanceRecords()

    function handleOnline() {
      void syncPendingAttendanceRecords()
    }

    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [])
}
