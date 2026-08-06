"use client"

import "@/app/[siteId]/[popId]/library/layouts/layoutsOperarTheme.css"
import "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem.css"
import { DataWorkspaceModuleLayout } from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useParams } from "next/navigation"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
}

/** Shell de cabecera — preview layout Operar · Vender. */
export function LayoutsOperarPreviewShell({ children }: Props) {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } = usePopWorkspace()

  if (!siteId || !popId) {
    return (
      <div className="rootsy-app-light flex min-h-svh items-center justify-center bg-background p-6 text-sm text-muted-foreground">
        Punto de venta no encontrado.
      </div>
    )
  }

  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Vender"
      contentFlush
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName || undefined}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel || undefined}
      mainClassName="rootsy-theme-pos rootsy-radius-system min-h-0 flex-1 bg-[var(--rootsy-sombra-950)]"
    >
      <div className="relative flex min-h-0 w-full flex-1 flex-col">
        {bootstrapError ? (
          <div
            role="alert"
            className="relative shrink-0 border-b border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            Cabecera: {bootstrapError}
          </div>
        ) : null}
        {children}
      </div>
    </DataWorkspaceModuleLayout>
  )
}
