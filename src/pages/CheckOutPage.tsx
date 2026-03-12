import { Link } from 'react-router-dom'
import { PageSection } from '../components/PageSection'

export function CheckOutPage() {
  return (
    <PageSection
      title="Check-out"
      description="Tela reservada para a proxima etapa do encerramento do atendimento."
    >
      <p className="section-description">
        A base de navegacao ja esta pronta. Na proxima etapa podemos reaproveitar a logica do
        check-in para registrar a saida.
      </p>
      <Link to="/check-in" className="text-link">
        Ir para check-in
      </Link>
    </PageSection>
  )
}
