import { v4 as uuidv4 } from 'uuid'
import {
  markAttendanceAsError,
  markAttendanceAsSynced,
  saveAttendanceRecord,
  updateAttendanceSyncStatus,
} from '../lib/db/indexedDb'
import { isSupabaseConfigured, supabase } from '../lib/supabase/client'
import type {
  AttendanceInsert,
  AttendanceRecord,
  AttendanceRow,
  CreateAttendanceInput,
  CreateAttendanceResult,
  FetchAttendanceRecordsResult,
} from '../types/attendance'

const ATTENDANCE_TABLE = 'attendance'

export async function createAttendanceRecord(
  input: CreateAttendanceInput,
): Promise<CreateAttendanceResult> {
  const now = new Date().toISOString()
  const localId = uuidv4()

  const localRecord: AttendanceRecord = {
    localId,
    ownerUserId: input.ownerUserId,
    ownerUserEmail: input.ownerUserEmail ?? null,
    ownerScopeKey: input.ownerScopeKey,
    patientId: input.patientId,
    patientName: input.patientName,
    patient_name: input.patientName,
    professionalId: input.professionalId,
    professionalName: input.professionalName,
    checkType: input.checkType,
    check_type: input.checkType,
    notes: input.notes,
    latitude: input.latitude,
    longitude: input.longitude,
    accuracy_meters: input.accuracyMeters,
    location_permission: input.locationPermission,
    client_created_at: input.clientCreatedAt,
    recordedAt: input.clientCreatedAt,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
    syncErrorMessage: undefined,
    location: {
      latitude: input.latitude,
      longitude: input.longitude,
      accuracy: input.accuracyMeters,
      timestampLocal: input.clientCreatedAt,
    },
  }

  await saveAttendanceRecord(localRecord)

  if (!canAttemptRemoteSync()) {
    return {
      localRecord,
      remoteRecord: null,
      savedToSupabase: false,
      message: getOfflineMessage(),
    }
  }

  await updateAttendanceSyncStatus(localRecord.localId, 'syncing')
  const syncResult = await uploadAttendanceRecord(localRecord)

  if (!syncResult.success) {
    if (syncResult.shouldRetry) {
      await updateAttendanceSyncStatus(localRecord.localId, 'pending', syncResult.message)
    } else {
      await markAttendanceAsError(localRecord.localId, syncResult.message)
    }

    return {
      localRecord: {
        ...localRecord,
        syncStatus: syncResult.shouldRetry ? 'pending' : 'error',
        syncErrorMessage: syncResult.message,
      },
      remoteRecord: null,
      savedToSupabase: false,
      message: `Registro salvo localmente, mas nao foi enviado ao Supabase: ${syncResult.message}`,
    }
  }

  await markAttendanceAsSynced(localRecord.localId, localRecord.localId)

  return {
    localRecord: {
      ...localRecord,
      remoteId: localRecord.localId,
      syncStatus: 'synced',
      syncErrorMessage: undefined,
    },
    remoteRecord: null,
    savedToSupabase: true,
    message:
      input.checkType === 'check-in'
        ? 'Check-in salvo com sucesso no Supabase.'
        : 'Check-out salvo com sucesso no Supabase.',
  }
}

export async function fetchAttendanceRecords(): Promise<FetchAttendanceRecordsResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      records: [] as AttendanceRow[],
      errorMessage: 'Supabase nao configurado. Nenhum registro remoto pode ser carregado.',
    }
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      records: [] as AttendanceRow[],
      errorMessage: null,
    }
  }

  const { data, error } = await supabase
    .from(ATTENDANCE_TABLE)
    .select('id, patient_name, observation, check_time, latitude, longitude, accuracy, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return {
      records: [] as AttendanceRow[],
      errorMessage: error.message,
    }
  }

  return {
    records: data ?? [],
    errorMessage: null,
  }
}

export async function uploadAttendanceRecord(record: AttendanceRecord) {
  if (!canAttemptRemoteSync()) {
    return {
      success: false,
      shouldRetry: true,
      message: getOfflineMessage(),
    }
  }

  if (!record.ownerUserId) {
    return {
      success: false,
      shouldRetry: false,
      message: 'Registro local sem usuario vinculado. Sincronizacao bloqueada.',
    }
  }

  const payload: AttendanceInsert = {
    id: record.localId,
    patient_name: record.patient_name,
    observation: record.notes,
    check_time: record.recordedAt,
    latitude: record.latitude,
    longitude: record.longitude,
    accuracy: record.accuracy_meters,
    created_at: record.createdAt,
  }

  const { error } = await supabase.from(ATTENDANCE_TABLE).upsert(payload, { onConflict: 'id' })

  if (error) {
    return {
      success: false,
      shouldRetry: isRetryableSyncError(error.message),
      message: error.message,
    }
  }

  return {
    success: true,
    shouldRetry: false,
    message: 'Registro sincronizado com sucesso.',
  }
}

function canAttemptRemoteSync() {
  return Boolean(
    isSupabaseConfigured &&
      supabase &&
      (typeof navigator === 'undefined' || navigator.onLine),
  )
}

function getOfflineMessage() {
  if (!isSupabaseConfigured || !supabase) {
    return 'Supabase nao configurado. Registro salvo apenas localmente.'
  }

  return 'Sem internet no momento. Registro salvo localmente para sincronizar depois.'
}

function isRetryableSyncError(message: string) {
  const normalized = message.toLowerCase()

  return (
    normalized.includes('network') ||
    normalized.includes('fetch') ||
    normalized.includes('offline') ||
    normalized.includes('timeout') ||
    normalized.includes('failed to fetch')
  )
}
