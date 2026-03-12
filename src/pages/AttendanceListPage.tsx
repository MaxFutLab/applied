import { useEffect, useState } from 'react'
import { PageSection } from '../components/PageSection'
import { listAttendanceRecords } from '../lib/db/indexedDb'
import { syncPendingAttendanceRecords } from '../lib/sync/attendanceSync'
import { fetchAttendanceRecords } from '../services/attendanceService'
import type { AttendanceRecord, AttendanceRow, SyncRunResult } from '../types/attendance'

export function AttendanceListPage() {
  const [remoteRecords, setRemoteRecords] = useState<AttendanceRow[]>([])
  const [localRecords, setLocalRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  async function loadData() {
    setIsLoading(true)

    const [remoteResult, storedLocalRecords] = await Promise.all([
      fetchAttendanceRecords(),
      listAttendanceRecords(),
    ])

    setRemoteRecords(remoteResult.records)
    setErrorMessage(remoteResult.errorMessage)
    setLocalRecords(
      [...storedLocalRecords].sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
    )
    setIsLoading(false)
  }

  async function handleManualSync() {
    setIsSyncing(true)
    setSyncMessage(null)

    const result = await syncPendingAttendanceRecords()
    setSyncMessage(buildSyncMessage(result))

    await loadData()
    setIsSyncing(false)
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadData()
    }, 0)

    function handleOnline() {
      void syncPendingAttendanceRecords().then((result) => {
        setSyncMessage(buildSyncMessage(result))
        void loadData()
      })
    }

    window.addEventListener('online', handleOnline)

    return () => {
      window.clearTimeout(timerId)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

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
                  <strong>{record.patient_name}</strong>
                  <span className="sync-pill synced">Supabase</span>
                </div>
                <p>{formatDateTime(record.check_time)}</p>
                <p>
                  Latitude: {record.latitude.toFixed(6)} | Longitude: {record.longitude.toFixed(6)}
                </p>
                <p>Accuracy: {Math.round(record.accuracy)} m</p>
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
                  <strong>{record.patient_name}</strong>
                  <span className={`sync-pill ${record.syncStatus}`}>{record.syncStatus}</span>
                </div>
                <p>{record.check_type}</p>
                <p>{formatDateTime(record.recordedAt)}</p>
                <p>
                  Latitude: {record.latitude.toFixed(6)} | Longitude: {record.longitude.toFixed(6)}
                </p>
                <p>Accuracy: {Math.round(record.accuracy_meters)} m</p>
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
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
