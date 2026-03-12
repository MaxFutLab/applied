import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

type RouteErrorBoundaryProps = {
  children: ReactNode
}

type RouteErrorBoundaryState = {
  hasError: boolean
  errorMessage: string | null
}

class RouteErrorBoundaryBase extends Component<
  RouteErrorBoundaryProps & { resetKey: string },
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Erro inesperado ao renderizar a pagina.',
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RouteErrorBoundary', error, errorInfo)
  }

  componentDidUpdate(prevProps: Readonly<RouteErrorBoundaryProps & { resetKey: string }>) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({
        hasError: false,
        errorMessage: null,
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-grid">
          <section className="card-section">
            <h2>Falha ao carregar esta pagina</h2>
            <p className="section-description">
              O sistema evitou uma tela branca total. Voce pode voltar para a pagina inicial e
              tentar novamente.
            </p>
            {this.state.errorMessage ? (
              <p className="feedback error">{this.state.errorMessage}</p>
            ) : null}
            <div className="inline-actions">
              <Link to="/" className="primary-button">
                Ir para o inicio
              </Link>
            </div>
          </section>
        </div>
      )
    }

    return this.props.children
  }
}

export function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
  const location = useLocation()

  return <RouteErrorBoundaryBase resetKey={location.pathname}>{children}</RouteErrorBoundaryBase>
}
