"use client"

import "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem.css"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useParams } from "next/navigation"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
}

/** Mismo shell de cabecera que LibraryShell — DataWorkspaceLayout dark + bootstrap POP. */
export function LayoutsOperationsPreviewShell({ children }: Props) {
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
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Vender"
      headerVariant="dark"
      contentFlush
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName || undefined}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel || undefined}
      mainClassName="rootsy-nature-palette rootsy-radius-system min-h-0 flex-1 bg-[var(--op-dark-shell)]"
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
    </DataWorkspaceLayout>
  )
}
