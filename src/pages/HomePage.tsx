import { Link } from 'react-router-dom'
import { PageSection } from '../components/PageSection'

const quickActions = [
  {
    title: 'Fazer check-in',
    description: 'Registrar inicio do atendimento com horario e localizacao.',
    to: '/check-in',
  },
  {
    title: 'Fazer check-out',
    description: 'Encerrar o atendimento quando a etapa estiver pronta.',
    to: '/check-out',
  },
  {
    title: 'Ver atendimentos',
    description: 'Consultar registros locais e acompanhar sincronizacao.',
    to: '/attendances',
  },
  {
    title: 'Painel administrativo',
    description: 'Conferir configuracao do app e status do Supabase.',
    to: '/admin',
  },
]

export function HomePage() {
  return (
    <div className="page-grid">
      <PageSection
        title="Inicio"
        description="Base inicial do sistema web PWA para presenca e controle de atendimentos."
      >
        <div className="action-grid">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to} className="action-card">
              <strong>{action.title}</strong>
              <span>{action.description}</span>
            </Link>
          ))}
        </div>
      </PageSection>

      <PageSection
        title="O que ja esta pronto"
        description="Nesta etapa focamos na base segura do sistema para evoluir nas proximas fases."
      >
        <ul className="info-list">
          <li>Roteamento principal configurado para as telas do sistema.</li>
          <li>Estrutura inicial para offline com IndexedDB preparada.</li>
          <li>Cliente Supabase criado com variaveis de ambiente.</li>
          <li>Tela de check-in pronta para primeira captura local.</li>
        </ul>
      </PageSection>
    </div>
  )
}
