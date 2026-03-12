import { AttendanceForm } from '../components/AttendanceForm'

export function CheckOutPage() {
  return (
    <AttendanceForm
      checkType="check-out"
      title="Check-out"
      description="Registre o encerramento do atendimento com localizacao obrigatoria e envio ao Supabase."
    />
  )
}
