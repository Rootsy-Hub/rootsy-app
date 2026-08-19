"use client"

import type { ExpenseListRow } from "@/app/[siteId]/[popId]/expenses/actions"
import {
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardsGridClass,
  workspaceTableNatureStockWarningClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

type CategoryProgress = {
  name: string
  total: number
  paid: number
  pct: number
}

function computeSummary(
  rows: ExpenseListRow[],
  totalDue: number,
  totalPaid: number,
) {
  const active = rows.filter((r) => r.status !== "voided")
  const pendingAmount = Math.max(0, totalDue - totalPaid)
  const progressPct =
    totalDue > 0
      ? Math.min(100, Math.round((totalPaid / totalDue) * 1000) / 10)
      : 0
  const pendingCount = active.filter(
    (r) => r.status === "pending" || r.status === "partial",
  ).length
  const paidCount = active.filter((r) => r.status === "paid").length

  const byCategory = new Map<string, { total: number; paid: number }>()
  for (const row of active) {
    const current = byCategory.get(row.categoryName) ?? { total: 0, paid: 0 }
    current.total += row.amount
    current.paid += row.paidTotal
    byCategory.set(row.categoryName, current)
  }

  const categories: CategoryProgress[] = [...byCategory.entries()]
    .map(([name, values]) => ({
      name,
      total: values.total,
      paid: values.paid,
      pct:
        values.total > 0
          ? Math.min(100, Math.round((values.paid / values.total) * 1000) / 10)
          : 0,
    }))
    .sort((a, b) => b.total - a.total)

  return {
    activeCount: active.length,
    pendingAmount,
    progressPct,
    pendingCount,
    paidCount,
    categories,
  }
}

function ProgressTrack({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-rootsy-bruma-100">
      <div
        className="h-full rounded-full bg-[var(--rootsy-savia-600)] transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

type Props = {
  rows: ExpenseListRow[]
  totalDue: number
  totalPaid: number
  monthLabel: string
}

export function ExpenseSummaryDashboard({
  rows,
  totalDue,
  totalPaid,
  monthLabel,
}: Props) {
  const summary = useMemo(
    () => computeSummary(rows, totalDue, totalPaid),
    [rows, totalDue, totalPaid],
  )

  const kpis = [
    {
      label: "Comprometido",
      value: fmt.format(totalDue),
      sub: `${summary.activeCount} ${summary.activeCount === 1 ? "gasto" : "gastos"} · ${monthLabel}`,
      valueClass: "text-rootsy-bruma-900",
    },
    {
      label: "Pagado",
      value: fmt.format(totalPaid),
      sub: `${summary.paidCount} ${summary.paidCount === 1 ? "cerrado" : "cerrados"}`,
      valueClass:
        totalPaid > 0
          ? "text-[var(--rootsy-savia-700)]"
          : "text-rootsy-bruma-900",
    },
    {
      label: "Pendiente",
      value: fmt.format(summary.pendingAmount),
      sub: `${summary.pendingCount} por saldar`,
      valueClass:
        summary.pendingAmount > 0
          ? workspaceTableNatureStockWarningClass
          : "text-rootsy-bruma-900",
    },
  ]

  return (
    <div className="space-y-4">
      <div className={dataWorkspaceEntityCardsGridClass}>
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto px-5 py-4")}
          >
            <p className={dataWorkspaceEntityCardEyebrowClass}>{kpi.label}</p>
            <p className={cn(dataWorkspaceEntityCardStatValueLargeClass, "mt-2", kpi.valueClass)}>
              {kpi.value}
            </p>
            <p className="mt-1 font-canopy text-xs text-rootsy-bruma-500">
              {kpi.sub}
            </p>
          </article>
        ))}
      </div>

      <article className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto px-5 py-4")}>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="font-canopy text-sm font-semibold text-rootsy-bruma-900">
              Cobertura del mes
            </h3>
            <p className="font-canopy text-[11px] text-rootsy-bruma-500">
              Pagos registrados vs total comprometido
            </p>
          </div>
          <span className="font-numeric text-lg font-semibold tabular-nums text-[var(--rootsy-savia-700)]">
            {summary.progressPct}%
          </span>
        </div>

        <ProgressTrack pct={summary.progressPct} />

        <p className="mt-2 font-numeric text-xs tabular-nums text-rootsy-bruma-500">
          {fmt.format(totalPaid)} de {fmt.format(totalDue)}
        </p>

        {summary.categories.length > 0 ? (
          <ul className="mt-5 space-y-4 border-t border-rootsy-bruma-200 pt-4">
            {summary.categories.map((category) => (
              <li key={category.name}>
                <div className="mb-1.5 flex justify-between gap-2 text-xs">
                  <span className="truncate font-canopy text-rootsy-bruma-800">
                    {category.name}
                  </span>
                  <span className="shrink-0 font-numeric font-medium tabular-nums text-[var(--rootsy-savia-700)]">
                    {category.pct}%
                  </span>
                </div>
                <ProgressTrack pct={category.pct} />
                <p className="mt-1 font-numeric text-[11px] tabular-nums text-rootsy-bruma-500">
                  {fmt.format(category.paid)} de {fmt.format(category.total)}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    </div>
  )
}
