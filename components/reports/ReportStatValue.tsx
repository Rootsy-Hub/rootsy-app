"use client"

import { dataWorkspaceEntityCardStatValueLargeClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  loading?: boolean
  className?: string
  children: ReactNode
}

/** Altura fija alineada a `text-2xl` para evitar que la card crezca al terminar de cargar. */
const reportStatValueShellClass = "mt-1.5 flex h-8 min-w-0 items-center"

export function ReportStatValue({ loading = false, className, children }: Props) {
  return (
    <div className={reportStatValueShellClass}>
      {loading ? (
        <RootsSpinner size="sm" label="Cargando total" aria-hidden className="shrink-0" />
      ) : (
        <span className={cn(dataWorkspaceEntityCardStatValueLargeClass, className)}>
          {children}
        </span>
      )}
    </div>
  )
}
