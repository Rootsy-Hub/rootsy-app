"use client"

import {
  dataWorkspaceBlocksSectionDescriptionClass,
  dataWorkspaceBlocksSectionTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import type { ReactNode } from "react"

type Props = {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

/** Jardín de un módulo en bloques — título, copy y CTA, como en RRHH. */
export function DataWorkspaceBlocksSection({
  title,
  description,
  action,
  children,
}: Props) {
  const showHeader = Boolean(title || description || action)

  return (
    <section className="space-y-4">
      {showHeader ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {title ? (
              <h2 className={dataWorkspaceBlocksSectionTitleClass}>{title}</h2>
            ) : null}
            {description ? (
              <p className={dataWorkspaceBlocksSectionDescriptionClass}>
                {description}
              </p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}
