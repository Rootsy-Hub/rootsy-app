"use client"

import {
  dataWorkspaceShellCard,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import type { StatisticsRankRow } from "@/app/[siteId]/[popId]/statistics/actions"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"

export function StatisticsRankTable({
  title = "Ranking",
  rows,
  loading,
  valueFormat = "money",
}: {
  title?: string
  rows: StatisticsRankRow[]
  loading?: boolean
  valueFormat?: "money" | "number"
}) {
  return (
    <div className={cn(dataWorkspaceShellCard, "overflow-hidden")}>
      <div className="border-b border-[var(--rootsy-bruma-100)] px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
          {title}
        </h3>
      </div>
      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-[var(--rootsy-bruma-50)]"
            />
          ))}
        </div>
      ) : rows.length > 0 ? (
        <ul className="divide-y divide-[var(--rootsy-bruma-100)]">
          {rows.map((row) => (
            <li
              key={`${row.rank}-${row.label}`}
              className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--rootsy-bruma-50)] text-xs font-semibold tabular-nums text-[var(--rootsy-bruma-700)]">
                  {row.rank}
                </span>
                <div className="min-w-0">
                  <p className={cn("truncate text-sm", workspaceTableNatureTextPrimaryClass)}>
                    {row.label}
                  </p>
                  {row.secondaryLabel && row.secondaryValue != null ? (
                    <p className={cn("text-[11px]", workspaceTableNatureTextSecondaryClass)}>
                      {row.secondaryLabel}: {row.secondaryValue.toLocaleString("es-AR")}
                    </p>
                  ) : null}
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 text-sm font-medium tabular-nums",
                  workspaceTableNatureMoneyClass,
                )}
              >
                {valueFormat === "money"
                  ? formatReportMoneyAr(row.value)
                  : row.value.toLocaleString("es-AR")}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-8 text-center text-sm text-[var(--rootsy-bruma-500)] sm:px-5">
          —
        </p>
      )}
    </div>
  )
}
