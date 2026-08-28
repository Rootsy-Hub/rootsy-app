import {
  dataWorkspaceBlocksPageMainClass,
  dataWorkspaceBlocksPageScopeClass,
  dataWorkspaceBlocksSkeletonTone,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { RootsIconButton } from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

export function ChatWorkspaceSkeleton() {
  return (
    <div
      className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Cargando chat</span>
      <div className={cn(dataWorkspaceBlocksSkeletonTone.box, "h-full")} />
      <div className={cn(dataWorkspaceBlocksSkeletonTone.box, "h-full")} />
    </div>
  )
}

type ChatModulePageSkeletonProps = {
  siteId: string
  popId: string
  popName: string
  userName: string
  userAvatarSrc?: string
  userRoleLabel: string
  headerLoading: boolean
}

/** Mismo cascarón que la página de chat, para el portero del POP. */
export function ChatModulePageSkeleton({
  siteId,
  popId,
  popName,
  userName,
  userAvatarSrc,
  userRoleLabel,
  headerLoading,
}: ChatModulePageSkeletonProps) {
  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Chat"
      headerVariant={dataWorkspaceModuleHeaderVariant}
      loading={headerLoading}
      userName={userName}
      userAvatarSrc={userAvatarSrc}
      userRoleLabel={userRoleLabel}
      headerActions={
        <RootsIconButton
          semantic="primary"
          atmosphere="eter"
          size="default"
          label="Nuevo canal"
          disabled
        >
          <Plus className="size-5" aria-hidden />
        </RootsIconButton>
      }
      contentFlush
      mainMaxWidthClass="max-w-none"
      mainClassName={cn(
        dataWorkspaceBlocksPageMainClass,
        "flex min-h-0 flex-1 flex-col overflow-hidden",
      )}
    >
      <div
        className={cn(
          dataWorkspaceBlocksPageScopeClass,
          "flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-6 pb-0 sm:px-6 lg:px-8",
        )}
      >
        <ChatWorkspaceSkeleton />
      </div>
    </DataWorkspaceModuleLayout>
  )
}
