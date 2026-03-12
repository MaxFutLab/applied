import { PageSection } from '../components/PageSection'
import { isSupabaseConfigured } from '../lib/supabase/client'
import { syncPendingAttendanceRecords } from '../lib/sync/attendanceSync'

export function AdminPage() {
  async function handleSyncPreview() {
    await syncPendingAttendanceRecords()
  }

  return (
    <div className="page-grid">
      <PageSection
        title="Painel administrativo"
        description="Area inicial para configuracoes e verificacoes tecnicas do sistema."
      >
        <ul className="info-list">
          <li>Supabase configurado: {isSupabaseConfigured ? 'sim' : 'nao'}</li>
          <li>Modo offline local: pronto com IndexedDB</li>
          <li>Sincronizacao automatica: estrutura inicial preparada</li>
        </ul>
      </PageSection>

      <PageSection
        title="Sincronizacao"
        description="A rotina completa sera evoluida depois. Por enquanto, a base do modulo ja existe."
        actions={
          <button type="button" className="secondary-button" onClick={() => void handleSyncPreview()}>
            Testar rotina futura
          </button>
        }
      >
        <p className="section-description">
          Quando o Supabase estiver configurado, esta area sera usada para monitorar filas de envio,
          erros e reprocessamento.
        </p>
      </PageSection>
    </div>
  )
}
