export type SyncStatus = 'pending' | 'synced' | 'error'

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
