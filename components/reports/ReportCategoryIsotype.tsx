"use client"

import { dataWorkspaceEntityCardIsotypeClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import type { ReportCatalogCategoryId } from "@/lib/reportsCatalog"
import { getReportHubCategoryStyle } from "@/lib/reportHubCategoryStyles"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type Props = {
  icon: LucideIcon
  categoryId: ReportCatalogCategoryId
  className?: string
  iconClassName?: string
}

export function ReportCategoryIsotype({
  icon: Icon,
  categoryId,
  className,
  iconClassName,
}: Props) {
  const categoryStyle = getReportHubCategoryStyle(categoryId)

  return (
    <span
      className={cn(dataWorkspaceEntityCardIsotypeClass, className)}
      style={{
        backgroundColor: categoryStyle.accentMuted,
        color: categoryStyle.accent,
        borderColor: categoryStyle.accentMuted,
      }}
      aria-hidden
    >
      <Icon className={cn("size-4 sm:size-[1.125rem]", iconClassName)} strokeWidth={1.75} />
    </span>
  )
}
