import type { PropsWithChildren, ReactNode } from 'react'

type PageSectionProps = PropsWithChildren<{
  title: string
  description?: string
  actions?: ReactNode
}>

export function PageSection({ title, description, actions, children }: PageSectionProps) {
  return (
    <section className="card-section">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          {description ? <p className="section-description">{description}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
