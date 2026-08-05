"use client"

import "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/library/libraryColorTheme.css"
import { libraryShellMainClass } from "@/app/[siteId]/[popId]/library/libraryColorTheme"
import { LayoutFinalComponentsModal } from "@/app/[siteId]/[popId]/library/LayoutFinalComponentsModal"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { Layers3 } from "lucide-react"
import { useState, type ReactNode } from "react"

type Props = {
  siteId: string
  popId: string
  sectionId: string
  children: ReactNode
}

export function LibraryShell({ siteId, popId, sectionId, children }: Props) {
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()
  const [finalComponentsOpen, setFinalComponentsOpen] = useState(false)

  return (
    <>
      <DataWorkspaceLayout
        siteId={siteId}
        popId={popId}
        popName={bootstrap?.popName ?? ""}
        title="Librería"
        headerVariant="dark"
        usePopBackdrop={false}
        contentFlush
        loading={bootstrapLoading}
        userName={bootstrap?.userFullName || undefined}
        userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
        userRoleLabel={bootstrap?.roleLabel || undefined}
        mainClassName={`${libraryShellMainClass} rootsy-nature-palette min-h-0 flex-1 flex-col`}
        headerActions={
          <DataWorkspaceHeaderIconButton
            label="Componentes finales"
            headerVariant="dark"
            onClick={() => setFinalComponentsOpen(true)}
          >
            <Layers3 className="size-5" aria-hidden />
          </DataWorkspaceHeaderIconButton>
        }
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

      <LayoutFinalComponentsModal
        open={finalComponentsOpen}
        onOpenChange={setFinalComponentsOpen}
      />
    </>
  )
}
