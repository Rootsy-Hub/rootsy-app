import {
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { DataWorkspaceOperationsLayout } from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export type PopModuleSkeletonLayout = {
  siteId: string
  popId: string
  popName: string
  title: string
  userName: string
  userAvatarSrc?: string
  userRoleLabel: string
  headerLoading: boolean
}

type BlocksShellProps = {
  layout: PopModuleSkeletonLayout
  title: string
  children: ReactNode
  pillLabel?: string
  mainClassName?: string
  mainMaxWidthClass?: string
  /** Si es `null`, el hijo ocupa el main sin padding de bloques. */
  contentClassName?: string | null
  headerActions?: ReactNode
}

export function BlocksModulePageSkeleton({
  layout,
  title,
  children,
  pillLabel,
  mainClassName,
  mainMaxWidthClass = "max-w-none",
  contentClassName,
  headerActions,
}: BlocksShellProps) {
  const wrapContent = contentClassName !== null
  return (
    <DataWorkspaceModuleLayout
      siteId={layout.siteId}
      popId={layout.popId}
      popName={layout.popName}
      title={title}
      pillLabel={pillLabel}
      headerVariant={dataWorkspaceModuleHeaderVariant}
      loading={layout.headerLoading}
      userName={layout.userName}
      userAvatarSrc={layout.userAvatarSrc}
      userRoleLabel={layout.userRoleLabel}
      contentFlush
      mainMaxWidthClass={mainMaxWidthClass}
      mainClassName={cn(dataWorkspaceBlocksPageMainClass, mainClassName)}
      headerActions={headerActions}
    >
      {wrapContent ? (
        <div className={contentClassName ?? dataWorkspaceBlocksPageContentClass}>
          {children}
        </div>
      ) : (
        children
      )}
    </DataWorkspaceModuleLayout>
  )
}

export function OperationsModulePageSkeleton({
  layout,
  title,
  children,
}: {
  layout: PopModuleSkeletonLayout
  title: string
  children: ReactNode
}) {
  return (
    <DataWorkspaceOperationsLayout
      siteId={layout.siteId}
      popId={layout.popId}
      popName={layout.popName}
      title={title}
      loading={layout.headerLoading}
      userName={layout.userName}
      userAvatarSrc={layout.userAvatarSrc}
      userRoleLabel={layout.userRoleLabel}
      sidebarCollapsible
      sidebarEdgeToggle={false}
      sidebarOpen
    >
      {children}
    </DataWorkspaceOperationsLayout>
  )
}
