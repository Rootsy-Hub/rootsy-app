"use client"

import type { ExpenseListRow } from "@/app/[siteId]/[popId]/expenses/actions"
import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useMemo, useState } from "react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const shellCard = dataWorkspaceShellCard

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
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  const summary = useMemo(
    () => computeSummary(rows, totalDue, totalPaid),
    [rows, totalDue, totalPaid],
  )

  const kpis = [
    {
      label: "Comprometido",
      value: fmt.format(totalDue),
      sub: `${summary.activeCount} ${summary.activeCount === 1 ? "gasto" : "gastos"} · ${monthLabel}`,
    },
    {
      label: "Pagado",
      value: fmt.format(totalPaid),
      sub: `${summary.paidCount} ${summary.paidCount === 1 ? "cerrado" : "cerrados"}`,
    },
    {
      label: "Pendiente",
      value: fmt.format(summary.pendingAmount),
      sub: `${summary.pendingCount} por saldar`,
    },
  ]

  return (
    <div className="relative flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={cn(shellCard, "px-5 py-4")}>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-2 font-numeric text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className={cn(shellCard, "p-5")}>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Cobertura del mes
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Pagos registrados vs total comprometido
            </p>
          </div>
          <span className="font-numeric text-lg font-semibold tabular-nums text-primary">
            {summary.progressPct}%
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-muted/80">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${summary.progressPct}%` }}
          />
        </div>

        <p className="mt-2 font-numeric text-xs tabular-nums text-muted-foreground">
          {fmt.format(totalPaid)} de {fmt.format(totalDue)}
        </p>

        <Collapsible
          open={categoriesOpen}
          onOpenChange={setCategoriesOpen}
          className="mt-5 border-t border-border/80 pt-4"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-2 text-left transition-colors hover:bg-muted/40">
            <span className="text-sm font-semibold text-foreground">
              Por categoría
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                categoriesOpen && "rotate-180",
              )}
              aria-hidden
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-3">
            {summary.categories.length === 0 ? (
              <p className="px-1 text-sm text-muted-foreground">
                Sin gastos en este período.
              </p>
            ) : (
              <ul className="flex flex-col gap-5 px-1">
                {summary.categories.map((category) => (
                  <li key={category.name}>
                    <div className="mb-1.5 flex justify-between gap-2 text-xs">
                      <span className="truncate text-foreground">
                        {category.name}
                      </span>
                      <span className="shrink-0 font-numeric font-medium tabular-nums text-primary">
                        {category.pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/80">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${category.pct}%` }}
                      />
                    </div>
                    <p className="mt-1 font-numeric text-[11px] tabular-nums text-muted-foreground">
                      {fmt.format(category.paid)} de {fmt.format(category.total)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
