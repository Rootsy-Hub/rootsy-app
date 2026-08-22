"use client"

import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksPageMainClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"

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
  const { bootstrap, loading } = usePopWorkspace()

  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title={title}
      pillLabel="Próximamente"
      headerVariant={dataWorkspaceModuleHeaderVariant}
      loading={loading}
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
      <div className={dataWorkspaceBlocksEmptyStateClass}>
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </DataWorkspaceModuleLayout>
  )
}
