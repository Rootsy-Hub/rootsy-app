"use client"

import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import type { StatisticsSegment } from "@/app/[siteId]/[popId]/statistics/actions"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function StatisticsSegmentList({
  title = "Segmentación",
  segments,
  loading,
  valueFormat = "money",
}: {
  title?: string
  segments: StatisticsSegment[]
  loading?: boolean
  valueFormat?: "money" | "number"
}) {
  return (
    <div className={cn(dataWorkspaceShellCard, "p-4 sm:p-5")}>
      <h3 className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
        {title}
      </h3>
      {loading ? (
        <ul className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="h-8 animate-pulse rounded-lg bg-[var(--rootsy-bruma-50)]"
            />
          ))}
        </ul>
      ) : segments.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {segments.map((seg, i) => (
            <li key={seg.label}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-2 text-[var(--rootsy-bruma-700)]">
                  <span
                    className="size-2 shrink-0 rounded-sm"
                    style={{ backgroundColor: pieColors[i % pieColors.length] }}
                  />
                  <span className="truncate">{seg.label}</span>
                </span>
                <span className="shrink-0 font-numeric font-medium tabular-nums text-[var(--rootsy-bruma-900)]">
                  {seg.percent.toLocaleString("es-AR")}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--rootsy-bruma-100)]">
                <div
                  className="h-full rounded-full bg-[var(--rootsy-savia-600)]"
                  style={{ width: `${Math.min(seg.percent, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] tabular-nums text-[var(--rootsy-bruma-500)]">
                {valueFormat === "money"
                  ? formatReportMoneyAr(seg.value)
                  : seg.value.toLocaleString("es-AR")}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[var(--rootsy-bruma-500)]">—</p>
      )}
    </div>
  )
}
