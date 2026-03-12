import { useEffect, useState } from 'react'
import { PageSection } from '../components/PageSection'
import { listAttendanceRecords } from '../lib/db/indexedDb'
import type { AttendanceRecord } from '../types/attendance'

export function AttendanceListPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])

  async function loadRecords() {
    const storedRecords = await listAttendanceRecords()
    const sortedRecords = [...storedRecords].sort((first, second) =>
      second.createdAt.localeCompare(first.createdAt),
    )
    setRecords(sortedRecords)
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadRecords()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [])

  return (
    <PageSection
      title="Atendimentos"
      description="Lista local dos registros que depois poderao ser sincronizados com o Supabase."
      actions={
        <button type="button" className="secondary-button" onClick={() => void loadRecords()}>
          Atualizar lista
        </button>
      }
    >
      {records.length === 0 ? (
        <p className="section-description">Nenhum atendimento salvo localmente ate agora.</p>
      ) : (
        <div className="records-list">
          {records.map((record) => (
            <article key={record.localId} className="record-card">
              <div className="record-row">
                <strong>{record.patientName}</strong>
                <span className={`sync-pill ${record.syncStatus}`}>{record.syncStatus}</span>
              </div>
              <p>{record.checkType}</p>
              <p>{formatDateTime(record.recordedAt)}</p>
              <p>{record.notes || 'Sem observacao.'}</p>
            </article>
          ))}
        </div>
      )}
    </PageSection>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
