import { useEffect, useMemo, useState } from 'react'
import { PageSection } from '../components/PageSection'
import { isSupabaseConfigured } from '../lib/supabase/client'
import { fetchAttendanceRecords } from '../services/attendanceService'
import type { AttendanceRow } from '../types/attendance'

export function AdminPage() {
  const [records, setRecords] = useState<AttendanceRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadDashboard() {
    setIsLoading(true)
    const result = await fetchAttendanceRecords()
    setRecords(result.records)
    setErrorMessage(result.errorMessage)
    setIsLoading(false)
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadDashboard()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [])

  const summary = useMemo(() => {
    const totalRecords = records.length

    return {
      totalRecords,
      recentRecords: records.slice(0, 5),
    }
  }, [records])

  return (
    <div className="page-grid">
      <PageSection
        title="Painel administrativo"
        description="Resumo inicial dos atendimentos e do estado da integracao com o Supabase."
        actions={
          <button type="button" className="secondary-button" onClick={() => void loadDashboard()}>
            Atualizar painel
          </button>
        }
      >
        <p className="section-description">
          Supabase configurado: {isSupabaseConfigured ? 'sim' : 'nao'}
        </p>
        {isLoading ? <p className="section-description">Carregando resumo...</p> : null}
        {!isLoading && errorMessage ? <p className="feedback error">{errorMessage}</p> : null}

        <div className="stats-grid">
          <article className="stat-card">
            <strong>{summary.totalRecords}</strong>
            <span>Total de registros</span>
          </article>
          <article className="stat-card">
            <strong>{summary.recentRecords.length}</strong>
            <span>Ultimos carregados</span>
          </article>
          <article className="stat-card">
            <strong>{isSupabaseConfigured ? 'Online' : 'Offline'}</strong>
            <span>Status do Supabase</span>
          </article>
        </div>
      </PageSection>

      <PageSection
        title="Ultimos atendimentos"
        description="Lista recente dos registros retornados pelo Supabase."
      >
        {!isLoading && !errorMessage && summary.recentRecords.length === 0 ? (
          <p className="section-description">Ainda nao existem atendimentos para mostrar.</p>
        ) : null}

        <div className="records-list">
          {summary.recentRecords.map((record) => (
            <article key={record.id} className="record-card">
              <div className="record-row">
                <strong>{record.patient_name}</strong>
                <span className="sync-pill synced">Registro</span>
              </div>
              <p>{formatDateTime(record.check_time)}</p>
              <p>
                Latitude: {record.latitude.toFixed(6)} | Longitude: {record.longitude.toFixed(6)}
              </p>
              <p>{record.observation || 'Sem observacao.'}</p>
            </article>
          ))}
        </div>
      </PageSection>
    </div>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
