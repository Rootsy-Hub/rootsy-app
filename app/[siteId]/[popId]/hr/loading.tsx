"use client"

import { HrPageSkeletonScreen } from "@/app/[siteId]/[popId]/hr/HrPageSkeleton"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { dataWorkspaceBlocksPageMainClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import { useParams } from "next/navigation"

export default function HrSegmentLoading() {
  const params = useParams()
  const workspace = usePopWorkspaceOptional()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""

  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={workspace?.bootstrap?.popName ?? ""}
      title="RRHH"
      headerVariant={dataWorkspaceModuleHeaderVariant}
      contentFlush
      loading
      userName={workspace?.bootstrap?.userFullName}
      userAvatarSrc={workspace?.bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={workspace?.bootstrap?.roleLabel || undefined}
      mainMaxWidthClass="max-w-none"
      mainClassName={dataWorkspaceBlocksPageMainClass}
    >
      <HrPageSkeletonScreen />
    </DataWorkspaceModuleLayout>
  )
}
