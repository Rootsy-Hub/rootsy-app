"use client"

import "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/library/libraryColorTheme.css"
import { libraryShellMainClass, libraryThemeClass } from "@/app/[siteId]/[popId]/library/libraryColorTheme"
import { LayoutFinalComponentsModal } from "@/app/[siteId]/[popId]/library/LayoutFinalComponentsModal"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
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
      <DataWorkspaceModuleLayout
        siteId={siteId}
        popId={popId}
        popName={bootstrap?.popName ?? ""}
        title="Librería"
        contentFlush
        loading={bootstrapLoading}
        userName={bootstrap?.userFullName || undefined}
        userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
        userRoleLabel={bootstrap?.roleLabel || undefined}
        mainClassName={`${libraryShellMainClass} ${libraryThemeClass} rootsy-nature-palette min-h-0 flex-1 flex-col overflow-hidden`}
        headerActions={
          <DataWorkspaceHeaderIconButton
            label="Componentes finales"
            headerVariant={dataWorkspaceModuleHeaderVariant}
            onClick={() => setFinalComponentsOpen(true)}
          >
            <Layers3 aria-hidden />
          </DataWorkspaceHeaderIconButton>
        }
      >
        <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden">
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

      <LayoutFinalComponentsModal
        open={finalComponentsOpen}
        onOpenChange={setFinalComponentsOpen}
      />
    </>
  )
}
