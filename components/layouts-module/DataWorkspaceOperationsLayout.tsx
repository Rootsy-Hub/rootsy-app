"use client"

import "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette.css"
import {
  layoutsOperationsBodyScopeClass,
  layoutsOperationsBodyShellClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import {
  DataWorkspaceModuleLayout,
  type DataWorkspaceModuleLayoutProps,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export { dataWorkspaceModuleHeaderVariant } from "@/components/layouts-module/DataWorkspaceModuleLayout"

export type DataWorkspaceOperationsLayoutProps = DataWorkspaceModuleLayoutProps

/**
 * Shell módulo POP + cuerpo operaciones (layout · operaciones).
 * Fondo POP + header reutilizable + fila bruma + canvas `--op-dark-shell`.
 */
export function DataWorkspaceOperationsLayout({
  children,
  contentFlush = true,
  mainClassName,
  ...props
}: DataWorkspaceOperationsLayoutProps) {
  return (
    <DataWorkspaceModuleLayout
      {...props}
      contentFlush={contentFlush}
      mainClassName={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden p-0",
        mainClassName,
      )}
    >
      <OperationsModuleBody>{children}</OperationsModuleBody>
    </DataWorkspaceModuleLayout>
  )
}

/** Canvas operativo — hijo directo del row bruma del módulo. */
export function OperationsModuleBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        layoutsOperationsBodyScopeClass,
        layoutsOperationsBodyShellClass,
        "dark relative flex min-h-0 flex-1 flex-col overflow-hidden text-white",
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Ambiente decorativo compartido — ventas · mostrador · mesas · compras. */
export function OperationsModuleBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.14),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.1),transparent_36%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[38px_38px] opacity-20" />
    </div>
  )
}
