import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { useAuth } from '../hooks/useAuth'

type LoginLocationState = {
  from?: string
}

export function LoginPage() {
  const location = useLocation()
  const { isAuthenticated, isLoading, signInWithPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const redirectTo = (location.state as LoginLocationState | null)?.from ?? '/'

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    const result = await signInWithPassword(email.trim(), password)

    if (!result.success) {
      setErrorMessage(result.errorMessage || 'Nao foi possivel entrar.')
    }
  }

  return (
    <div className="auth-page">
      <PageSection
        title="Login"
        description="Entre com email e senha para acessar as rotas privadas do sistema."
      >
        <form className="form-layout auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@empresa.com"
              required
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </label>

          {errorMessage ? <p className="feedback error">{errorMessage}</p> : null}

          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </PageSection>
    </div>
  )
}
