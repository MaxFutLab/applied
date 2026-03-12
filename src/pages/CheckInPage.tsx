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
  const { captureLocation, currentLocation, errorMessage, isLoading, permissionStatus } =
    useGeolocation()

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date().toISOString())
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const selectedPatient = patients.find((patient) => patient.id === selectedPatientId)

    if (!selectedPatient) {
      setFeedbackMessage('Selecione um paciente antes de confirmar o check-in.')
      return
    }

    const record: AttendanceRecord = {
      localId: uuidv4(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      professionalId: 'at-001',
      professionalName: 'AT Responsavel',
      checkType: 'check-in',
      notes: notes.trim(),
      recordedAt: currentTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      location: currentLocation
        ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            accuracy: currentLocation.accuracy,
            timestampLocal: currentLocation.timestampLocal,
          }
        : null,
    }

    await createLocalAttendanceRecord(record)

    setNotes('')
    setFeedbackMessage('Check-in salvo localmente com sucesso.')
  }

  return (
    <PageSection
      title="Check-in"
      description="Registre o inicio do atendimento mesmo sem internet."
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
          <strong>Permissao de localizacao</strong>
          <span>{permissionStatus}</span>
        </div>

        <div className="inline-actions">
          <button type="button" className="secondary-button" onClick={() => void captureLocation()}>
            {isLoading ? 'Capturando localizacao...' : 'Capturar localizacao'}
          </button>
        </div>

        <div className="status-box">
          <strong>Localizacao atual</strong>
          {currentLocation ? (
            <span>
              Lat {currentLocation.latitude.toFixed(6)} | Long {currentLocation.longitude.toFixed(6)}
              {' | '}Precisao {Math.round(currentLocation.accuracy)}m
            </span>
          ) : (
            <span>Nenhuma localizacao capturada ainda.</span>
          )}
        </div>

        {errorMessage ? <p className="feedback error">{errorMessage}</p> : null}
        {feedbackMessage ? <p className="feedback success">{feedbackMessage}</p> : null}

        <button type="submit" className="primary-button">
          Confirmar check-in
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
