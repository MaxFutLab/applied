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
        description="Acesso rapido as telas principais do sistema de presenca e atendimento."
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
        title="Etapa atual"
        description="A aplicacao agora consegue registrar checks, listar atendimentos e exibir um painel inicial."
      >
        <ul className="info-list">
          <li>Check-in e check-out com geolocalizacao automatica e obrigatoria.</li>
          <li>Envio para a tabela attendance no Supabase quando configurado.</li>
          <li>Pagina de atendimentos com carregamento remoto e estados de tela.</li>
          <li>Painel administrativo com contadores e lista recente.</li>
        </ul>
      </PageSection>
    </div>
  )
}
