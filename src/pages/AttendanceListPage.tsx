import { useCallback, useEffect, useState } from 'react'
import { PageSection } from '../components/PageSection'
import { listAttendanceRecordsByUser } from '../lib/db/indexedDb'
import { syncPendingAttendanceRecords } from '../lib/sync/attendanceSync'
import { useAuth } from '../hooks/useAuth'
import { fetchAttendanceRecords } from '../services/attendanceService'
import type { AttendanceRecord, AttendanceRow, SyncRunResult } from '../types/attendance'

export function AttendanceListPage() {
  const { user } = useAuth()
  const [remoteRecords, setRemoteRecords] = useState<AttendanceRow[]>([])
  const [localRecords, setLocalRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const [remoteResult, storedLocalRecords] = await Promise.all([
        fetchAttendanceRecords(),
        listAttendanceRecordsByUser(user?.id ?? null),
      ])

      setRemoteRecords(remoteResult.records)
      setErrorMessage(remoteResult.errorMessage)
      setLocalRecords(
        [...storedLocalRecords].sort((first, second) =>
          (second.createdAt ?? '').localeCompare(first.createdAt ?? ''),
        ),
      )
    } catch (error) {
      setRemoteRecords([])
      setLocalRecords([])
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  async function handleManualSync() {
    setIsSyncing(true)
    setSyncMessage(null)

    const result = await syncPendingAttendanceRecords(user?.id ?? null)
    setSyncMessage(buildSyncMessage(result))

    await loadData()
    setIsSyncing(false)
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadData()
    }, 0)

    function handleOnline() {
      void syncPendingAttendanceRecords(user?.id ?? null).then((result) => {
        setSyncMessage(buildSyncMessage(result))
        void loadData()
      })
    }

    window.addEventListener('online', handleOnline)

    return () => {
      window.clearTimeout(timerId)
      window.removeEventListener('online', handleOnline)
    }
  }, [loadData, user?.id])

  return (
    <div className="page-grid">
      <PageSection
        title="Atendimentos"
        description="Acompanhe os registros remotos e o estado da fila local de sincronizacao."
        actions={
          <div className="inline-actions">
            <button type="button" className="secondary-button" onClick={() => void loadData()}>
              Atualizar lista
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => void handleManualSync()}
              disabled={isSyncing}
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}
            </button>
          </div>
        }
      >
        {isLoading ? <p className="section-description">Carregando atendimentos...</p> : null}
        {!isLoading && errorMessage ? <p className="feedback error">{errorMessage}</p> : null}
        {syncMessage ? <p className="feedback success">{syncMessage}</p> : null}

        {!isLoading && !errorMessage && remoteRecords.length === 0 ? (
          <p className="section-description">
            Nenhum atendimento encontrado ainda. Assim que um registro for sincronizado com o
            Supabase, ele aparece aqui.
          </p>
        ) : null}

        {!isLoading && remoteRecords.length > 0 ? (
          <div className="records-list">
            {remoteRecords.map((record) => (
              <article key={record.id} className="record-card">
                <div className="record-row">
                  <strong>{record.patient_name || 'Paciente nao informado'}</strong>
                  <span className="sync-pill synced">Supabase</span>
                </div>
                <p>{formatDateTime(record.check_time)}</p>
                <p>
                  Latitude: {formatCoordinate(record.latitude)} | Longitude:{' '}
                  {formatCoordinate(record.longitude)}
                </p>
                <p>Accuracy: {formatAccuracy(record.accuracy)}</p>
                <p>{record.observation || 'Sem observacao.'}</p>
              </article>
            ))}
          </div>
        ) : null}
      </PageSection>

      <PageSection
        title="Fila local"
        description="Registros salvos no dispositivo com status de sincronizacao."
      >
        {localRecords.length === 0 ? (
          <p className="section-description">Nenhum registro local salvo ate agora.</p>
        ) : (
          <div className="records-list">
            {localRecords.map((record) => (
              <article key={record.localId} className="record-card">
                <div className="record-row">
                  <strong>{record.patient_name || record.patientName || 'Paciente nao informado'}</strong>
                  <span className={`sync-pill ${record.syncStatus}`}>{record.syncStatus}</span>
                </div>
                <p>{record.check_type || record.checkType || 'tipo nao informado'}</p>
                <p>{formatDateTime(record.recordedAt)}</p>
                <p>
                  Latitude: {formatCoordinate(record.latitude)} | Longitude:{' '}
                  {formatCoordinate(record.longitude)}
                </p>
                <p>Accuracy: {formatAccuracy(record.accuracy_meters)}</p>
                <p>{record.notes || 'Sem observacao.'}</p>
                {record.syncErrorMessage ? (
                  <p className="sync-error-text">{record.syncErrorMessage}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </PageSection>
    </div>
  )
}

function buildSyncMessage(result: SyncRunResult) {
  if (result.attempted === 0) {
    return 'Nao ha registros pendentes para sincronizar.'
  }

  return `Sincronizacao concluida. ${result.synced} sincronizado(s), ${result.failed} com falha, ${result.skipped} ignorado(s).`
}

function formatDateTime(value: string) {
  if (!value) {
    return 'Horario indisponivel'
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Horario indisponivel'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsedDate)
}

function formatCoordinate(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(6) : 'indisponivel'
}

function formatAccuracy(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${Math.round(value)} m`
    : 'indisponivel'
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Nao foi possivel carregar a pagina de atendimentos.'
}
