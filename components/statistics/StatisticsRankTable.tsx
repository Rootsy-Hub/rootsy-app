"use client"

import {
  dataWorkspaceBlocksSkeletonTone,
  dataWorkspaceEntityCardStatValueClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  statisticsEmptyTextClass,
  statisticsLosetaCardClass,
  statisticsRankBadgeClass,
  statisticsRankBadgeTopClass,
  statisticsSectionHeadingClassNames,
} from "@/components/statistics/statisticsWorkspaceStyles"
import type { StatisticsRankRow } from "@/app/[siteId]/[popId]/statistics/actions"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"

export function StatisticsRankTable({
  title = "Ranking",
  description,
  rows,
  loading,
  valueFormat = "money",
}: {
  title?: string
  description?: string
  rows: StatisticsRankRow[]
  loading?: boolean
  valueFormat?: "money" | "number"
}) {
  const { title: titleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()

  return (
    <div className={cn(statisticsLosetaCardClass, "overflow-hidden")}>
      <div className="border-b border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-5">
        <h3 className={titleClass}>{title}</h3>
        {description ? <p className={descriptionClass}>{description}</p> : null}
      </div>
      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn("h-10 rounded-lg", dataWorkspaceBlocksSkeletonTone.bar)}
            />
          ))}
        </div>
      ) : rows.length > 0 ? (
        <ul className="divide-y divide-[var(--rootsy-bruma-200)]">
          {rows.map((row) => (
            <li
              key={`${row.rank}-${row.label}`}
              className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    row.rank <= 3 ? statisticsRankBadgeTopClass : statisticsRankBadgeClass,
                  )}
                >
                  {row.rank}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-rootsy-bruma-900">
                    {row.label}
                  </p>
                  {row.secondaryLabel && row.secondaryValue != null ? (
                    <p className="text-[11px] text-rootsy-bruma-500">
                      {row.secondaryLabel}:{" "}
                      {row.secondaryValue.toLocaleString("es-AR")}
                    </p>
                  ) : null}
                </div>
              </div>
              <span className={cn("shrink-0 text-sm", dataWorkspaceEntityCardStatValueClass)}>
                {valueFormat === "money"
                  ? formatReportMoneyAr(row.value)
                  : row.value.toLocaleString("es-AR")}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={cn(statisticsEmptyTextClass, "px-4 py-8 text-center sm:px-5")}>
          Sin datos para armar el ranking en este período
        </p>
      )}
    </div>
  )
}
