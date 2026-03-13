export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error'

export type CheckType = 'check-in' | 'check-out'

export type Patient = {
  id: string
  name: string
}

export type AtProfessional = {
  id: string
  name: string
}

export type AttendanceLocation = {
  latitude: number
  longitude: number
  accuracy: number
  timestampLocal: string
}

export type AttendanceRecord = {
  localId: string
  remoteId?: string
  ownerUserId: string | null
  ownerUserEmail?: string | null
  ownerScopeKey: string | null
  patientId: string
  patientName: string
  patient_name: string
  professionalId: string
  professionalName: string
  checkType: CheckType
  check_type: CheckType
  notes: string
  latitude: number
  longitude: number
  accuracy_meters: number
  location_permission: string
  client_created_at: string
  recordedAt: string
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
  syncErrorMessage?: string
  location: AttendanceLocation | null
}

export type AttendanceInsert = {
  id: string
  patient_name: string
  observation: string
  check_time: string
  latitude: number
  longitude: number
  accuracy: number
  created_at: string
}

export type AttendanceRow = AttendanceInsert & {
  id: string
}

export type CreateAttendanceInput = {
  ownerUserId: string | null
  ownerUserEmail?: string | null
  ownerScopeKey: string | null
  patientId: string
  patientName: string
  professionalId: string
  professionalName: string
  checkType: CheckType
  notes: string
  latitude: number
  longitude: number
  accuracyMeters: number
  locationPermission: string
  clientCreatedAt: string
}

export type CreateAttendanceResult = {
  localRecord: AttendanceRecord
  remoteRecord: AttendanceRow | null
  savedToSupabase: boolean
  message: string
}

export type FetchAttendanceRecordsResult = {
  records: AttendanceRow[]
  errorMessage: string | null
}

export type SyncRunResult = {
  attempted: number
  synced: number
  failed: number
  skipped: number
}
