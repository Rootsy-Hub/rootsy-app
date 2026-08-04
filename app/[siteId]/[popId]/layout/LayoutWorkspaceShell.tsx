"use client"

import {
  LAYOUT_VIEW_ITEMS,
  type LayoutViewId,
} from "@/app/[siteId]/[popId]/layout/layoutWorkspaceNav"
import "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette.css"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceSectionMenu } from "@/components/layouts/DataWorkspaceSectionMenu"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import type { ReactNode } from "react"

type Props = {
  siteId: string
  popId: string
  activeViewId: LayoutViewId
  title: string
  onViewSelect: (id: LayoutViewId) => void
  children: ReactNode
}

export function LayoutWorkspaceShell({
  siteId,
  popId,
  activeViewId,
  title,
  onViewSelect,
  children,
}: Props) {
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError } =
    usePopWorkspace()

  return (
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title={title}
      headerVariant="dark"
      contentFlush
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName || undefined}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel || undefined}
      mainClassName="rootsy-app-light rootsy-nature-palette min-h-0 overflow-hidden bg-background"
      sectionMenu={
        <DataWorkspaceSectionMenu
          headerVariant="dark"
          viewItems={LAYOUT_VIEW_ITEMS}
          activeId={activeViewId}
          onSelect={(id) => onViewSelect(id as LayoutViewId)}
        />
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
  )
}
