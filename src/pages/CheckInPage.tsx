import { AttendanceForm } from '../components/AttendanceForm'

export function CheckInPage() {
  return (
    <AttendanceForm
      checkType="check-in"
      title="Check-in"
      description="Registre o inicio do atendimento com localizacao obrigatoria e envio ao Supabase."
    />
  )
}
