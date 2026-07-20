"use client"

import type {
  ExpenseCategoryKind,
  ExpenseListRow,
  ExpenseStatus,
} from "@/app/[siteId]/[popId]/expenses/actions"
import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { Ban, ChevronDown, Plus, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const shellCard = dataWorkspaceShellCard

const KIND_META: Record<
  ExpenseCategoryKind,
  { title: string; hint: string }
> = {
  variable: {
    title: "Gastos variables",
    hint: "Rubros que cambian mes a mes",
  },
  fijo: {
    title: "Gastos fijos",
    hint: "Compromisos recurrentes del período",
  },
}

type CategoryGroup = {
  key: string
  categoryName: string
  categoryDeletedAt: string | null
  items: ExpenseListRow[]
  totalDue: number
  totalPaid: number
  pendingCount: number
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function groupActiveByCategory(rows: ExpenseListRow[]): CategoryGroup[] {
  const map = new Map<string, CategoryGroup>()
  for (const row of rows) {
    if (row.status === "voided") continue
    const key = row.categoryId || row.categoryName
    const current = map.get(key) ?? {
      key,
      categoryName: row.categoryName,
      categoryDeletedAt: row.categoryDeletedAt,
      items: [],
      totalDue: 0,
      totalPaid: 0,
      pendingCount: 0,
    }
    current.items.push(row)
    current.totalDue = roundMoney(current.totalDue + row.amount)
    current.totalPaid = roundMoney(current.totalPaid + row.paidTotal)
    if (row.status === "pending" || row.status === "partial") {
      current.pendingCount += 1
    }
    map.set(key, current)
  }

  return [...map.values()]
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => {
        const aPending =
          a.status === "pending" || a.status === "partial" ? 0 : 1
        const bPending =
          b.status === "pending" || b.status === "partial" ? 0 : 1
        if (aPending !== bPending) return aPending - bPending
        return b.expenseDate.localeCompare(a.expenseDate)
      }),
    }))
    .sort((a, b) => {
      if (a.pendingCount > 0 && b.pendingCount === 0) return -1
      if (b.pendingCount > 0 && a.pendingCount === 0) return 1
      return b.totalDue - a.totalDue
    })
}

function statusBadgeClass(status: ExpenseStatus): string {
  switch (status) {
    case "paid":
      return "border-emerald-200/90 bg-emerald-50/90 text-emerald-700"
    case "partial":
      return "border-amber-200/90 bg-amber-50/90 text-amber-800"
    case "voided":
      return "border-border/60 bg-muted/50 text-muted-foreground"
    default:
      return "border-border/70 bg-muted/30 text-muted-foreground"
  }
}

function statusLabel(status: ExpenseStatus): string {
  switch (status) {
    case "paid":
      return "Pagado"
    case "partial":
      return "Parcial"
    case "voided":
      return "Anulado"
    default:
      return "Pendiente"
  }
}

function ExpenseStatusBadge({ row }: { row: ExpenseListRow }) {
  const remaining = roundMoney(row.amount - row.paidTotal)
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge
        variant="outline"
        className={cn("font-normal", statusBadgeClass(row.status))}
      >
        {statusLabel(row.status)}
      </Badge>
      {row.status === "partial" && remaining > 0 ? (
        <span className="font-mono text-[11px] tabular-nums text-amber-800">
          falta {fmt.format(remaining)}
        </span>
      ) : null}
    </div>
  )
}

function ExpenseKindCard({
  kind,
  rows,
  listBusy,
  canCreate,
  canUpdate,
  canDelete,
  formatDate,
  onPay,
  onVoid,
  onDelete,
  onCreate,
}: {
  kind: ExpenseCategoryKind
  rows: ExpenseListRow[]
  listBusy: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  formatDate: (iso: string) => string
  onPay: (row: ExpenseListRow) => void
  onVoid: (row: ExpenseListRow) => void
  onDelete: (row: ExpenseListRow) => void
  onCreate?: () => void
}) {
  const meta = KIND_META[kind]
  const activeRows = useMemo(
    () => rows.filter((r) => r.status !== "voided"),
    [rows],
  )
  const voidedRows = useMemo(
    () => rows.filter((r) => r.status === "voided"),
    [rows],
  )
  const categories = useMemo(() => groupActiveByCategory(rows), [rows])

  const totalDue = useMemo(
    () => roundMoney(activeRows.reduce((sum, r) => sum + r.amount, 0)),
    [activeRows],
  )
  const totalPaid = useMemo(
    () => roundMoney(activeRows.reduce((sum, r) => sum + r.paidTotal, 0)),
    [activeRows],
  )
  const progressPct =
    totalDue > 0
      ? Math.min(100, Math.round((totalPaid / totalDue) * 1000) / 10)
      : 0

  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(),
  )
  const [voidedOpen, setVoidedOpen] = useState(false)

  useEffect(() => {
    setOpenCategories(
      new Set(categories.filter((c) => c.pendingCount > 0).map((c) => c.key)),
    )
    setVoidedOpen(false)
  }, [categories])

  const toggleCategory = (key: string, open: boolean) => {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (open) next.add(key)
      else next.delete(key)
      return next
    })
  }

  return (
    <div className={cn(shellCard, "flex min-h-0 flex-col")}>
      <div className="border-b border-border/80 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">{meta.title}</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{meta.hint}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 font-normal">
            {listBusy
              ? "…"
              : `${activeRows.length} ${activeRows.length === 1 ? "gasto" : "gastos"}`}
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            {fmt.format(totalPaid)} de {fmt.format(totalDue)}
          </p>
          <span className="font-mono text-sm font-semibold tabular-nums text-primary">
            {progressPct}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/80">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="max-h-[min(70vh,640px)] min-h-48 flex-1 overflow-y-auto px-3 py-3">
        {listBusy ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            Cargando…
          </p>
        ) : activeRows.length === 0 && voidedRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No hay {kind === "variable" ? "gastos variables" : "gastos fijos"} en
              este mes.
            </p>
            {canCreate && onCreate ? (
              <Button type="button" size="sm" variant="outline" onClick={onCreate}>
                <Plus className="size-4" aria-hidden />
                Nuevo gasto
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => {
              const isOpen = openCategories.has(category.key)
              return (
                <Collapsible
                  key={category.key}
                  open={isOpen}
                  onOpenChange={(open) => toggleCategory(category.key, open)}
                  className="rounded-xl border border-border/70 bg-muted/10"
                >
                  <CollapsibleTrigger className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/30">
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {category.categoryName}
                        </span>
                        {category.categoryDeletedAt ? (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                            eliminada
                          </span>
                        ) : null}
                        {category.pendingCount > 0 ? (
                          <span className="text-[11px] font-medium text-amber-800">
                            {category.pendingCount} por pagar
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                        {category.items.length}{" "}
                        {category.items.length === 1 ? "ítem" : "ítems"}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-foreground">
                      {fmt.format(category.totalDue)}
                    </span>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="border-t border-border/60 px-2 pb-2 pt-1">
                    <ul className="divide-y divide-border/50">
                      {category.items.map((row) => (
                        <li
                          key={row.id}
                          className="flex flex-col gap-2 px-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-foreground">
                              {row.description.trim() || "Sin descripción"}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="text-[11px] text-muted-foreground">
                                {formatDate(row.expenseDate)}
                              </span>
                              <ExpenseStatusBadge row={row} />
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                            <div className="text-right">
                              <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                                {fmt.format(row.amount)}
                              </p>
                              {row.paidTotal > 0 ? (
                                <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                                  pagado {fmt.format(row.paidTotal)}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-1">
                              {row.status !== "paid" && canUpdate ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() => onPay(row)}
                                >
                                  Pagar
                                </Button>
                              ) : null}
                              {canUpdate ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="size-8 p-0 text-destructive"
                                  aria-label="Anular gasto"
                                  onClick={() => onVoid(row)}
                                >
                                  <Ban className="size-3.5" aria-hidden />
                                </Button>
                              ) : null}
                              {row.paidTotal <= 0 && canDelete ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="size-8 p-0 text-muted-foreground"
                                  aria-label="Eliminar gasto"
                                  onClick={() => onDelete(row)}
                                >
                                  <Trash2 className="size-3.5" aria-hidden />
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}

            {voidedRows.length > 0 ? (
              <Collapsible
                open={voidedOpen}
                onOpenChange={setVoidedOpen}
                className="rounded-xl border border-dashed border-border/70 bg-muted/5"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/20">
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        voidedOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      Anulados ({voidedRows.length})
                    </span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t border-border/50 px-2 pb-2 pt-1">
                  <ul className="divide-y divide-border/40">
                    {voidedRows.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between gap-3 px-2 py-2.5 opacity-70"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-foreground">
                            {row.description.trim() || "Sin descripción"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {row.categoryName} · {formatDate(row.expenseDate)}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                          {fmt.format(row.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

type PanelProps = {
  rows: ExpenseListRow[]
  listBusy: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  formatDate: (iso: string) => string
  onPay: (row: ExpenseListRow) => void
  onVoid: (row: ExpenseListRow) => void
  onDelete: (row: ExpenseListRow) => void
  onCreate?: () => void
}

export function ExpenseKindCardsPanel({
  rows,
  listBusy,
  canCreate,
  canUpdate,
  canDelete,
  formatDate,
  onPay,
  onVoid,
  onDelete,
  onCreate,
}: PanelProps) {
  const variableRows = useMemo(
    () => rows.filter((r) => r.categoryKind === "variable"),
    [rows],
  )
  const fixedRows = useMemo(
    () => rows.filter((r) => r.categoryKind === "fijo"),
    [rows],
  )

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <ExpenseKindCard
        kind="variable"
        rows={variableRows}
        listBusy={listBusy}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        formatDate={formatDate}
        onPay={onPay}
        onVoid={onVoid}
        onDelete={onDelete}
        onCreate={onCreate}
      />
      <ExpenseKindCard
        kind="fijo"
        rows={fixedRows}
        listBusy={listBusy}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        formatDate={formatDate}
        onPay={onPay}
        onVoid={onVoid}
        onDelete={onDelete}
        onCreate={onCreate}
      />
    </div>
  )
}
