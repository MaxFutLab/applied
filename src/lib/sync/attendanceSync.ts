import { listPendingAttendanceRecords } from '../db/indexedDb'
import { isSupabaseConfigured } from '../supabase/client'

export type SyncRunResult = {
  attempted: number
  synced: number
  skipped: number
}

export async function syncPendingAttendanceRecords(): Promise<SyncRunResult> {
  const pendingRecords = await listPendingAttendanceRecords()

  if (!isSupabaseConfigured) {
    return {
      attempted: pendingRecords.length,
      synced: 0,
      skipped: pendingRecords.length,
    }
  }

  return {
    attempted: pendingRecords.length,
    synced: 0,
    skipped: pendingRecords.length,
  }
}
