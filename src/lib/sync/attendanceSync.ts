import {
  listQueuedAttendanceRecordsByUser,
  markAttendanceAsError,
  markAttendanceAsSynced,
  updateAttendanceSyncStatus,
} from '../db/indexedDb'
import { isSupabaseConfigured } from '../supabase/client'
import { uploadAttendanceRecord } from '../../services/attendanceService'
import type { SyncRunResult } from '../../types/attendance'

let syncInFlight: Promise<SyncRunResult> | null = null

export function syncPendingAttendanceRecords(ownerUserId: string | null): Promise<SyncRunResult> {
  if (syncInFlight) {
    return syncInFlight
  }

  syncInFlight = runSync(ownerUserId).finally(() => {
    syncInFlight = null
  })

  return syncInFlight
}

async function runSync(ownerUserId: string | null): Promise<SyncRunResult> {
  if (!ownerUserId) {
    return {
      attempted: 0,
      synced: 0,
      failed: 0,
      skipped: 0,
    }
  }

  const queuedRecords = await listQueuedAttendanceRecordsByUser(ownerUserId)

  if (!isSupabaseConfigured || typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      attempted: queuedRecords.length,
      synced: 0,
      failed: 0,
      skipped: queuedRecords.length,
    }
  }

  let synced = 0
  let failed = 0

  for (const record of queuedRecords) {
    await updateAttendanceSyncStatus(record.localId, 'syncing')

    const result = await uploadAttendanceRecord(record)

    if (result.success) {
      await markAttendanceAsSynced(record.localId, record.localId)
      synced += 1
      continue
    }

    if (result.shouldRetry) {
      await updateAttendanceSyncStatus(record.localId, 'pending', result.message)
    } else {
      await markAttendanceAsError(record.localId, result.message)
    }

    failed += 1
  }

  return {
    attempted: queuedRecords.length,
    synced,
    failed,
    skipped: 0,
  }
}
