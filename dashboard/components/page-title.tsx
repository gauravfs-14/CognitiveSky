import type { ReactNode } from "react"

interface PageTitleProps {
  title: string
  description?: string
  icon?: ReactNode
}

export function PageTitle({ title, description, icon }: PageTitleProps) {
  return (
    <div className="mb-6 flex items-center">
      {icon && <div className="mr-3 text-sky-600">{icon}</div>}
      <div>
        <h1 className="text-2xl font-bold text-sky-900">{title}</h1>
        {description && <p className="text-sky-600">{description}</p>}
      </div>
    </div>
  )
}
