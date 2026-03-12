import type { AtProfessional, Patient } from '../types/attendance'

const patients: Patient[] = [
  { id: 'patient-001', name: 'Ana Souza' },
  { id: 'patient-002', name: 'Bruno Lima' },
  { id: 'patient-003', name: 'Carla Santos' },
]

const professionals: AtProfessional[] = [
  { id: 'at-001', name: 'AT Responsavel' },
]

export function getMockPatients() {
  return patients
}

export function getMockProfessionals() {
  return professionals
}
