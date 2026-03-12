import { saveAttendanceRecord } from '../lib/db/indexedDb'
import type { AttendanceRecord } from '../types/attendance'

export async function createLocalAttendanceRecord(record: AttendanceRecord) {
  await saveAttendanceRecord(record)
  return record
}
