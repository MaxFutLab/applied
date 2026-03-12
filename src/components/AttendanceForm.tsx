import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { PageSection } from './PageSection'
import { useGeolocation } from '../hooks/useGeolocation'
import { createAttendanceRecord } from '../services/attendanceService'
import { getMockPatients, getMockProfessionals } from '../services/mockData'
import type { CheckType, CreateAttendanceResult } from '../types/attendance'

type AttendanceFormProps = {
  checkType: CheckType
  title: string
  description: string
}

const patients = getMockPatients()
const defaultProfessional = getMockProfessionals()[0]

export function AttendanceForm({ checkType, title, description }: AttendanceFormProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id ?? '')
  const [notes, setNotes] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date().toISOString())
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success')
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
      setFeedbackType('error')
      setFeedbackMessage('Selecione um paciente antes de confirmar.')
      return
    }

    if (permissionStatus === 'denied') {
      setFeedbackType('error')
      setFeedbackMessage('O registro esta bloqueado porque a permissao de localizacao foi negada.')
      return
    }

    if (currentLocation?.latitude == null || currentLocation.longitude == null) {
      setFeedbackType('error')
      setFeedbackMessage('O registro so pode continuar quando a localizacao for capturada com sucesso.')
      return
    }

    if (!defaultProfessional) {
      setFeedbackType('error')
      setFeedbackMessage('Nenhum profissional padrao foi encontrado para este registro.')
      return
    }

    setIsSubmitting(true)

    try {
      const result: CreateAttendanceResult = await createAttendanceRecord({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        professionalId: defaultProfessional.id,
        professionalName: defaultProfessional.name,
        checkType,
        notes: notes.trim(),
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracyMeters: currentLocation.accuracy,
        locationPermission: permissionStatus,
        clientCreatedAt: new Date().toISOString(),
      })

      setNotes('')
      setFeedbackType(result.savedToSupabase ? 'success' : 'error')
      setFeedbackMessage(result.message)
    } catch (error) {
      setFeedbackType('error')
      setFeedbackMessage(getErrorMessage(error))
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
    <PageSection title={title} description={description}>
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
          <strong>Horario atual do check</strong>
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
        {feedbackMessage ? <p className={`feedback ${feedbackType}`}>{feedbackMessage}</p> : null}

        <button type="submit" className="primary-button" disabled={!canSubmit}>
          {isSubmitting ? 'Salvando...' : getSubmitLabel(checkType)}
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

function getSubmitLabel(checkType: CheckType) {
  return checkType === 'check-in' ? 'Confirmar check-in' : 'Confirmar check-out'
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Nao foi possivel salvar o atendimento.'
}
