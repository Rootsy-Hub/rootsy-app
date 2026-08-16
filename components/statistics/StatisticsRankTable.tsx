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
  className,
  scrollableList = false,
  selectedRowId,
  onRowSelect,
}: {
  title?: string
  description?: string
  rows: StatisticsRankRow[]
  loading?: boolean
  valueFormat?: "money" | "number" | "percent"
  className?: string
  scrollableList?: boolean
  selectedRowId?: string | null
  onRowSelect?: (row: StatisticsRankRow) => void
}) {
  const { title: titleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()

  return (
    <div className={cn(statisticsLosetaCardClass, "overflow-hidden", className)}>
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
        <ul
          className={cn(
            "divide-y divide-[var(--rootsy-bruma-200)]",
            scrollableList && "max-h-[360px] overflow-y-auto",
          )}
        >
          {rows.map((row) => {
            const isSelected = Boolean(selectedRowId && row.id === selectedRowId)
            const isInteractive = Boolean(onRowSelect && row.id)

            return (
            <li key={`${row.rank}-${row.label}`}>
              {isInteractive ? (
                <button
                  type="button"
                  onClick={() => onRowSelect?.(row)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors sm:px-5",
                    "hover:bg-rootsy-bruma-100 active:bg-rootsy-bruma-100/80",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,white)] focus-visible:ring-inset",
                    isSelected &&
                      "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_8%,white)] hover:bg-[color-mix(in_srgb,var(--rootsy-savia-600)_12%,white)]",
                  )}
                  aria-pressed={isSelected}
                >
                  <RowContent
                    row={row}
                    valueFormat={valueFormat}
                  />
                </button>
              ) : (
                <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                  <RowContent row={row} valueFormat={valueFormat} />
                </div>
              )}
            </li>
          )})}
        </ul>
      ) : (
        <p className={cn(statisticsEmptyTextClass, "px-4 py-8 text-center sm:px-5")}>
          Sin datos para armar el ranking en este período
        </p>
      )}
    </div>
  )
}

function RowContent({
  row,
  valueFormat,
}: {
  row: StatisticsRankRow
  valueFormat: "money" | "number" | "percent"
}) {
  return (
    <>
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
              {row.secondaryFormat === "money"
                ? formatReportMoneyAr(row.secondaryValue)
                : row.secondaryValue.toLocaleString("es-AR")}
            </p>
          ) : null}
        </div>
      </div>
      <span className={cn("shrink-0 text-sm", dataWorkspaceEntityCardStatValueClass)}>
        {valueFormat === "money"
          ? formatReportMoneyAr(row.value)
          : valueFormat === "percent"
            ? `${row.value.toLocaleString("es-AR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}%`
            : row.value.toLocaleString("es-AR")}
      </span>
    </>
  )
}
