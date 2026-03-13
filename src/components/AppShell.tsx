import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAttendanceSync } from '../hooks/useAttendanceSync'

const navigationItems = [
  { to: '/', label: 'Inicio' },
  { to: '/check-in', label: 'Check-in' },
  { to: '/check-out', label: 'Check-out' },
  { to: '/attendances', label: 'Atendimentos' },
  { to: '/admin', label: 'Admin' },
]

export function AppShell() {
  const { user, signOut, isLoading } = useAuth()
  useAttendanceSync()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-row">
          <div>
            <p className="eyebrow">Applied</p>
            <h1>Sistema de presenca para ATs</h1>
            <p className="subtitle">
              Controle simples de check-in, check-out e sincronizacao de atendimentos.
            </p>
          </div>

          <div className="auth-toolbar">
            <span className="auth-user">{user?.email || 'Usuario autenticado'}</span>
            <button
              type="button"
              className="secondary-button"
              onClick={() => void signOut()}
              disabled={isLoading}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <nav className="main-nav" aria-label="Navegacao principal">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}
