"use client"

import { DataWorkspaceBlocksEmptyState } from "@/components/data-workspace/DataWorkspaceBlocksEmptyState"
import { dataWorkspaceBlocksPageMainClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import { useParams } from "@/lib/pop-spa/navigation"

export function ComingSoonModuleView({
  title,
  description,
}: {
  title: string
  description: string
}) {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const { bootstrap } = usePopWorkspace()
  const popName = bootstrap?.popName ?? ""

  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title={title}
      pillLabel="Próximamente"
      headerVariant={dataWorkspaceModuleHeaderVariant}
      loading={!popName}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      contentFlush
      mainMaxWidthClass="max-w-none"
      mainClassName={cn(
        dataWorkspaceBlocksPageMainClass,
        "flex min-h-0 flex-1 flex-col overflow-hidden",
      )}
    >
      <DataWorkspaceBlocksEmptyState title={title} description={description} />
    </DataWorkspaceModuleLayout>
  )
}
