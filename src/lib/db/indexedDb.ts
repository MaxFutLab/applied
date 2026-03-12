import { openDB } from 'idb'
import type { AttendanceRecord, SyncStatus } from '../../types/attendance'

const DATABASE_NAME = 'applied-attendance-db'
const DATABASE_VERSION = 1
const ATTENDANCE_STORE = 'attendance-records'

async function getDatabase() {
  return openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(ATTENDANCE_STORE)) {
        const store = database.createObjectStore(ATTENDANCE_STORE, {
          keyPath: 'localId',
        })

        store.createIndex('by-sync-status', 'syncStatus')
        store.createIndex('by-created-at', 'createdAt')
      }
    },
  })
}

export async function saveAttendanceRecord(record: AttendanceRecord) {
  const database = await getDatabase()
  await database.put(ATTENDANCE_STORE, record)
}

export async function listAttendanceRecords() {
  const database = await getDatabase()
  return database.getAllFromIndex(ATTENDANCE_STORE, 'by-created-at')
}

export async function listPendingAttendanceRecords() {
  const database = await getDatabase()
  return database.getAllFromIndex(ATTENDANCE_STORE, 'by-sync-status', 'pending')
}

export async function markAttendanceAsSynced(localId: string, remoteId?: string) {
  const database = await getDatabase()
  const record = await database.get(ATTENDANCE_STORE, localId)

  if (!record) {
    return
  }

  const updatedRecord: AttendanceRecord = {
    ...record,
    remoteId: remoteId ?? record.remoteId,
    syncStatus: 'synced',
    syncErrorMessage: undefined,
    updatedAt: new Date().toISOString(),
  }

  await database.put(ATTENDANCE_STORE, updatedRecord)
}

export async function markAttendanceAsError(localId: string, errorMessage: string) {
  await updateAttendanceSyncStatus(localId, 'error', errorMessage)
}

export async function updateAttendanceSyncStatus(
  localId: string,
  syncStatus: SyncStatus,
  errorMessage?: string,
) {
  const database = await getDatabase()
  const record = await database.get(ATTENDANCE_STORE, localId)

  if (!record) {
    return
  }

  const updatedRecord: AttendanceRecord = {
    ...record,
    syncStatus,
    syncErrorMessage: errorMessage,
    updatedAt: new Date().toISOString(),
  }

  await database.put(ATTENDANCE_STORE, updatedRecord)
}
