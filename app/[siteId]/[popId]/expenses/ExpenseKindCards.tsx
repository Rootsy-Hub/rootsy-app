"use client"

import type {
  ExpenseCategoryKind,
  ExpenseListRow,
  ExpenseStatus,
} from "@/app/[siteId]/[popId]/expenses/actions"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  workspaceTableNatureStockWarningClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import { WorkspaceTableStatusBadge } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  RootsDangerSubtleButton,
  RootsDefaultButton,
  RootsPrimaryButton,
} from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Ban, ChevronDown, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const KIND_META: Record<
  ExpenseCategoryKind,
  { title: string; hint: string }
> = {
  variable: {
    title: "Gastos variables",
    hint: "Rubros que cambian mes a mes.",
  },
  fijo: {
    title: "Gastos fijos",
    hint: "Compromisos recurrentes del período.",
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

function statusTone(
  status: ExpenseStatus,
): "activo" | "inactivo" | "pendiente" {
  switch (status) {
    case "paid":
      return "activo"
    case "voided":
      return "inactivo"
    default:
      return "pendiente"
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
      <WorkspaceTableStatusBadge status={statusTone(row.status)}>
        {statusLabel(row.status)}
      </WorkspaceTableStatusBadge>
      {row.status === "partial" && remaining > 0 ? (
        <span className={cn("font-numeric text-[11px] tabular-nums", workspaceTableNatureStockWarningClass)}>
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
    <DataWorkspaceBlocksSection
      title={meta.title}
      description={meta.hint}
      action={
        <span className="font-canopy text-xs tabular-nums text-rootsy-bruma-500">
          {listBusy
            ? "…"
            : `${activeRows.length} ${activeRows.length === 1 ? "gasto" : "gastos"} · ${progressPct}%`}
        </span>
      }
    >
      {listBusy ? (
        <p className={dataWorkspaceBlocksEmptyStateClass}>Cargando…</p>
      ) : activeRows.length === 0 && voidedRows.length === 0 ? (
        <div className={dataWorkspaceBlocksEmptyStateClass}>
          <p>
            No hay {kind === "variable" ? "gastos variables" : "gastos fijos"} en
            este mes.
          </p>
          {canCreate && onCreate ? (
            <div className="mt-3">
              <RootsPrimaryButton type="button" size="compact" onClick={onCreate}>
                Nuevo gasto
              </RootsPrimaryButton>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => {
            const isOpen = openCategories.has(category.key)
            return (
              <Collapsible
                key={category.key}
                open={isOpen}
                onOpenChange={(open) => toggleCategory(category.key, open)}
              >
                <article
                  className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto")}
                >
                  <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-rootsy-bruma-500 transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-canopy text-sm font-semibold text-rootsy-bruma-900">
                          {category.categoryName}
                        </span>
                        {category.categoryDeletedAt ? (
                          <WorkspaceTableStatusBadge status="inactivo">
                            Eliminada
                          </WorkspaceTableStatusBadge>
                        ) : null}
                        {category.pendingCount > 0 ? (
                          <WorkspaceTableStatusBadge status="pendiente">
                            {category.pendingCount} por pagar
                          </WorkspaceTableStatusBadge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 font-numeric text-[11px] tabular-nums text-rootsy-bruma-500">
                        {category.items.length}{" "}
                        {category.items.length === 1 ? "ítem" : "ítems"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-numeric text-sm font-semibold tabular-nums",
                        category.pendingCount > 0
                          ? workspaceTableNatureStockWarningClass
                          : "text-[var(--rootsy-savia-700)]",
                      )}
                    >
                      {fmt.format(category.totalDue)}
                    </span>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="border-t border-rootsy-bruma-200">
                    <ul className="divide-y divide-rootsy-bruma-200">
                      {category.items.map((row) => (
                        <li
                          key={row.id}
                          className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-canopy text-sm text-rootsy-bruma-900">
                              {row.description.trim() || "Sin descripción"}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="font-canopy text-[11px] text-rootsy-bruma-500">
                                {formatDate(row.expenseDate)}
                              </span>
                              <ExpenseStatusBadge row={row} />
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                            <div className="text-right">
                              <p
                                className={cn(
                                  "font-numeric text-sm font-semibold tabular-nums",
                                  row.status === "paid"
                                    ? "text-[var(--rootsy-savia-700)]"
                                    : "text-rootsy-bruma-900",
                                )}
                              >
                                {fmt.format(row.amount)}
                              </p>
                              {row.paidTotal > 0 ? (
                                <p className="font-numeric text-[11px] tabular-nums text-[var(--rootsy-savia-700)]">
                                  pagado {fmt.format(row.paidTotal)}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-1">
                              {row.status !== "paid" && canUpdate ? (
                                <RootsDefaultButton
                                  type="button"
                                  size="compact"
                                  onClick={() => onPay(row)}
                                >
                                  Pagar
                                </RootsDefaultButton>
                              ) : null}
                              {canUpdate ? (
                                <RootsDangerSubtleButton
                                  type="button"
                                  size="compact"
                                  aria-label="Anular gasto"
                                  onClick={() => onVoid(row)}
                                >
                                  <Ban className="size-3.5" aria-hidden />
                                </RootsDangerSubtleButton>
                              ) : null}
                              {row.paidTotal <= 0 && canDelete ? (
                                <RootsDangerSubtleButton
                                  type="button"
                                  size="compact"
                                  aria-label="Eliminar gasto"
                                  onClick={() => onDelete(row)}
                                >
                                  <Trash2 className="size-3.5" aria-hidden />
                                </RootsDangerSubtleButton>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </article>
              </Collapsible>
            )
          })}

          {voidedRows.length > 0 ? (
            <Collapsible open={voidedOpen} onOpenChange={setVoidedOpen}>
              <article
                className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto")}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-rootsy-bruma-500 transition-transform duration-200",
                        voidedOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                    <span className="font-canopy text-sm font-medium text-rootsy-bruma-500">
                      Anulados ({voidedRows.length})
                    </span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t border-rootsy-bruma-200">
                  <ul className="divide-y divide-rootsy-bruma-200">
                    {voidedRows.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 opacity-70"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-canopy text-sm text-rootsy-bruma-800">
                            {row.description.trim() || "Sin descripción"}
                          </p>
                          <p className="font-canopy text-[11px] text-rootsy-bruma-500">
                            {row.categoryName} · {formatDate(row.expenseDate)}
                          </p>
                        </div>
                        <span className="shrink-0 font-numeric text-sm tabular-nums text-rootsy-bruma-500">
                          {fmt.format(row.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </article>
            </Collapsible>
          ) : null}
        </div>
      )}
    </DataWorkspaceBlocksSection>
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
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
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
