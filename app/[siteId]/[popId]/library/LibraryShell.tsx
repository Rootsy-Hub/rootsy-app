"use client"

import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import type { ReactNode } from "react"

type Props = {
  siteId: string
  popId: string
  children: ReactNode
}

export function LibraryShell({ siteId, popId, children }: Props) {
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  return (
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Librería UI"
      headerVariant="dark"
      contentFlush
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName || undefined}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel || undefined}
      mainClassName="rootsy-app-light bg-background"
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
