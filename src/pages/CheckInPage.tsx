import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { PageSection } from '../components/PageSection'
import { useGeolocation } from '../hooks/useGeolocation'
import { createLocalAttendanceRecord } from '../services/attendanceService'
import { getMockPatients } from '../services/mockData'
import type { AttendanceRecord } from '../types/attendance'

const patients = getMockPatients()

export function CheckInPage() {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id ?? '')
  const [notes, setNotes] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date().toISOString())
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { captureLocation, currentLocation, errorMessage, isLoading, permissionStatus, status } =
    useGeolocation({ autoStart: true })

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date().toISOString())
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedbackMessage(null)

    const selectedPatient = patients.find((patient) => patient.id === selectedPatientId)

    if (!selectedPatient) {
      setFeedbackMessage('Selecione um paciente antes de confirmar o check-in.')
      return
    }

    if (permissionStatus === 'denied') {
      setFeedbackMessage('O check-in esta bloqueado porque a permissao de localizacao foi negada.')
      return
    }

    if (currentLocation?.latitude == null || currentLocation.longitude == null) {
      setFeedbackMessage('O check-in so pode continuar quando a localizacao for capturada com sucesso.')
      return
    }

    setIsSubmitting(true)

    const record: AttendanceRecord = {
      localId: uuidv4(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patient_name: selectedPatient.name,
      professionalId: 'at-001',
      professionalName: 'AT Responsavel',
      checkType: 'check-in',
      check_type: 'check-in',
      notes: notes.trim(),
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy_meters: currentLocation.accuracy,
      location_permission: permissionStatus,
      client_created_at: new Date().toISOString(),
      recordedAt: currentTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      location: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
        timestampLocal: currentLocation.timestampLocal,
      },
    }

    try {
      await createLocalAttendanceRecord(record)
      setNotes('')
      setFeedbackMessage('Check-in salvo localmente com sucesso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit =
    status === 'success' &&
    permissionStatus !== 'denied' &&
    currentLocation?.latitude != null &&
    currentLocation.longitude != null &&
    !isLoading &&
    !isSubmitting

  return (
    <PageSection
      title="Check-in"
      description="A localizacao e capturada automaticamente e o check-in so continua quando ela estiver valida."
    >
      <form className="form-layout" onSubmit={handleSubmit}>
        <label className="field">
          <span>Paciente</span>
          <select
            value={selectedPatientId}
            onChange={(event) => setSelectedPatientId(event.target.value)}
          >
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Observacao</span>
          <textarea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Digite uma observacao opcional sobre o atendimento."
          />
        </label>

        <div className="status-box">
          <strong>Horario atual</strong>
          <span>{formatDateTime(currentTime)}</span>
        </div>

        <div className="status-box">
          <strong>Status da localizacao</strong>
          <span>{getStatusLabel(status)}</span>
        </div>

        <div className="status-box">
          <strong>Permissao de localizacao</strong>
          <span>{getPermissionLabel(permissionStatus)}</span>
        </div>

        <div className="status-box">
          <strong>Localizacao atual</strong>
          {currentLocation ? (
            <div className="status-detail-list">
              <span>Latitude: {currentLocation.latitude.toFixed(6)}</span>
              <span>Longitude: {currentLocation.longitude.toFixed(6)}</span>
              <span>Accuracy: {Math.round(currentLocation.accuracy)} m</span>
            </div>
          ) : (
            <span>Nenhuma localizacao valida capturada ainda.</span>
          )}
        </div>

        <div className="inline-actions">
          <button type="button" className="secondary-button" onClick={() => void captureLocation()}>
            {isLoading ? 'Capturando localizacao...' : 'Tentar novamente'}
          </button>
        </div>

        {errorMessage ? <p className="feedback error">{errorMessage}</p> : null}
        {feedbackMessage ? <p className="feedback success">{feedbackMessage}</p> : null}

        <button type="submit" className="primary-button" disabled={!canSubmit}>
          {isSubmitting ? 'Salvando check-in...' : 'Confirmar check-in'}
        </button>
      </form>
    </PageSection>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value))
}

function getStatusLabel(status: ReturnType<typeof useGeolocation>['status']) {
  switch (status) {
    case 'loading':
      return 'Capturando localizacao...'
    case 'success':
      return 'Localizacao capturada com sucesso.'
    case 'permission-denied':
      return 'Permissao negada.'
    case 'error':
      return 'Erro ao capturar localizacao.'
    case 'unsupported':
      return 'Geolocalizacao nao suportada.'
    default:
      return 'Aguardando captura da localizacao.'
  }
}

function getPermissionLabel(permissionStatus: ReturnType<typeof useGeolocation>['permissionStatus']) {
  switch (permissionStatus) {
    case 'granted':
      return 'Permitida'
    case 'denied':
      return 'Negada'
    case 'prompt':
      return 'Aguardando autorizacao'
    case 'unsupported':
      return 'Nao suportada'
    default:
      return 'Indefinida'
  }
}
