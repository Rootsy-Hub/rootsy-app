import { ChatModulePageSkeleton } from "@/app/[siteId]/[popId]/chat/ChatWorkspaceSkeleton"
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

type PopModulePageSkeleton = {
  renderPage: (layout: PopModuleSkeletonLayout) => ReactNode
}

/**
 * Esqueleto de página que cada módulo usa al entrar.
 * El portero lo pinta antes de montar la vista.
 */
const POP_MODULE_PAGE_SKELETONS: Record<string, PopModulePageSkeleton> = {
  chat: {
    renderPage: (layout) => (
      <ChatModulePageSkeleton
        siteId={layout.siteId}
        popId={layout.popId}
        popName={layout.popName}
        userName={layout.userName}
        userAvatarSrc={layout.userAvatarSrc}
        userRoleLabel={layout.userRoleLabel}
        headerLoading={layout.headerLoading}
      />
    ),
  },
}

export function getPopModulePageSkeleton(
  moduleKey: string,
): PopModulePageSkeleton | null {
  return POP_MODULE_PAGE_SKELETONS[moduleKey] ?? null
}
