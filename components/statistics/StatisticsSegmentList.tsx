"use client"

import {
  dataWorkspaceBlocksSkeletonTone,
  dataWorkspaceEntityCardStatValueClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  statisticsEmptyTextClass,
  statisticsLosetaCardBodyClass,
  statisticsLosetaCardClass,
  statisticsSectionHeadingClassNames,
} from "@/components/statistics/statisticsWorkspaceStyles"
import type { StatisticsSegment } from "@/app/[siteId]/[popId]/statistics/actions"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"

const segmentColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function StatisticsSegmentList({
  title = "Segmentación",
  description,
  segments,
  loading,
  valueFormat = "money",
}: {
  title?: string
  description?: string
  segments: StatisticsSegment[]
  loading?: boolean
  valueFormat?: "money" | "number"
}) {
  const { title: titleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()

  return (
    <div
      className={cn(
        statisticsLosetaCardClass,
        statisticsLosetaCardBodyClass,
        "flex h-full w-full flex-col",
      )}
    >
      <div>
        <h3 className={titleClass}>{title}</h3>
        {description ? <p className={descriptionClass}>{description}</p> : null}
      </div>
      {loading ? (
        <ul className="mt-4 flex min-h-[220px] flex-1 flex-col justify-center space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className={cn("h-8 rounded-lg", dataWorkspaceBlocksSkeletonTone.bar)} />
          ))}
        </ul>
      ) : segments.length > 0 ? (
        <ul className="mt-4 flex min-h-[220px] flex-1 flex-col justify-center space-y-3 overflow-y-auto">
          {segments.map((seg, i) => {
            const color = segmentColors[i % segmentColors.length]
            return (
              <li key={seg.label}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="flex min-w-0 items-center gap-2 text-rootsy-bruma-700">
                    <span
                      className="size-2 shrink-0 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate">{seg.label}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-medium tabular-nums",
                      dataWorkspaceEntityCardStatValueClass,
                      "text-sm",
                    )}
                  >
                    {seg.percent.toLocaleString("es-AR")}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-rootsy-bruma-100">
                  <div
                    className="h-full rounded-full transition-[width]"
                    style={{
                      width: `${Math.min(seg.percent, 100)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <p className="mt-1 text-[11px] tabular-nums text-rootsy-bruma-500">
                  {valueFormat === "money"
                    ? formatReportMoneyAr(seg.value)
                    : seg.value.toLocaleString("es-AR")}
                </p>
              </li>
            )
          })}
        </ul>
      ) : (
        <p
          className={cn(
            statisticsEmptyTextClass,
            "mt-4 flex min-h-[220px] flex-1 items-center justify-center text-center",
          )}
        >
          Sin segmentos para mostrar en este período
        </p>
      )}
    </div>
  )
}
