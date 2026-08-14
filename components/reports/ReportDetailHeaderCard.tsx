"use client"

import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import { ReportCategoryIsotype } from "@/components/reports/ReportCategoryIsotype"
import {
  dataWorkspaceDetailCardClass,
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceDetailCardStatsClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsIconButton } from "@/components/rootsy-button"
import type { ReportCatalogCategoryId } from "@/lib/reportsCatalog"
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { ArrowLeft, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { DateRange } from "react-day-picker"

type Props = {
  eyebrow: string
  title: string
  icon: LucideIcon
  categoryId: ReportCatalogCategoryId
  onBack: () => void
  preset: DataWorkspaceDatePreset
  customRange: DateRange | undefined
  bounds: { from: string | null; to: string | null }
  onPresetChange: (preset: DataWorkspaceDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  stats?: ReactNode
}

export function ReportDetailHeaderCard({
  eyebrow,
  title,
  icon,
  categoryId,
  onBack,
  preset,
  customRange,
  bounds,
  onPresetChange,
  onCustomRangeChange,
  stats,
}: Props) {
  return (
    <article className={dataWorkspaceDetailCardClass}>
      <div className={dataWorkspaceDetailCardHeaderClass}>
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
            <RootsIconButton
              theme="workspace"
              emphasis="ghost"
              size="default"
              label="Volver al listado de reportes"
              type="button"
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft aria-hidden />
            </RootsIconButton>

            <ReportCategoryIsotype
              icon={icon}
              categoryId={categoryId}
              iconClassName="size-5"
            />

            <div className="min-w-0">
              <p className={dataWorkspaceEntityCardEyebrowClass}>{eyebrow}</p>
              <h2
                className={cn(
                  dataWorkspaceEntityCardTitleClass,
                  "mt-1 truncate text-lg sm:text-xl",
                )}
              >
                {title}
              </h2>
            </div>
          </div>

          <div className="flex shrink-0 justify-end self-end lg:self-center">
            <DataWorkspacePeriodFilter
              variant="compact"
              preset={preset}
              customRange={customRange}
              onPresetChange={onPresetChange}
              onCustomRangeChange={onCustomRangeChange}
              bounds={bounds}
              showActiveState={false}
            />
          </div>
        </div>
      </div>

      {stats ? (
        <div className={dataWorkspaceDetailCardStatsClass}>{stats}</div>
      ) : null}
    </article>
  )
}
