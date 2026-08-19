"use client"

import type {
  ExpenseCategoryKind,
  ExpenseCategoryRow,
  ExpenseListRow,
  ExpenseStatus,
} from "@/app/[siteId]/[popId]/expenses/actions"
import { EXPENSE_WORLD_ORDER, EXPENSE_WORLDS } from "@/app/[siteId]/[popId]/expenses/expenseWorlds"
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

type CategoryGroup = {
  key: string
  categoryId: string | null
  categoryName: string
  categoryDeletedAt: string | null
  readOnly: boolean
  items: ExpenseListRow[]
  totalDue: number
  totalPaid: number
  pendingCount: number
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function todayIso(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
}

function emptyGroup(
  key: string,
  categoryId: string | null,
  categoryName: string,
  categoryDeletedAt: string | null,
  readOnly = false,
): CategoryGroup {
  return {
    key,
    categoryId,
    categoryName,
    categoryDeletedAt,
    readOnly,
    items: [],
    totalDue: 0,
    totalPaid: 0,
    pendingCount: 0,
  }
}

function sortPromises(items: ExpenseListRow[]): ExpenseListRow[] {
  return [...items].sort((a, b) => {
    const aPending = a.status === "pending" || a.status === "partial" ? 0 : 1
    const bPending = b.status === "pending" || b.status === "partial" ? 0 : 1
    if (aPending !== bPending) return aPending - bPending
    return b.expenseDate.localeCompare(a.expenseDate)
  })
}

function groupsForKind(
  kind: ExpenseCategoryKind,
  catalog: ExpenseCategoryRow[],
  rows: ExpenseListRow[],
  ledgerByCategoryId: Record<string, number>,
): CategoryGroup[] {
  const ofKind = catalog
    .filter((category) => category.deletedAt == null && category.kind === kind)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))

  const map = new Map<string, CategoryGroup>()
  for (const category of ofKind) {
    const readOnly = category.readOnly || category.kind === "otro"
    const group = emptyGroup(
      category.id,
      category.id,
      category.name,
      null,
      readOnly,
    )
    if (readOnly) {
      group.totalDue = roundMoney(ledgerByCategoryId[category.id] ?? 0)
    }
    map.set(category.id, group)
  }

  if (kind !== "otro") {
    for (const row of rows) {
      if (row.status === "voided") continue
      const key = row.categoryId || row.categoryName
      const current =
        map.get(key) ??
        emptyGroup(
          key,
          row.categoryId || null,
          row.categoryName,
          row.categoryDeletedAt,
        )
      current.items.push(row)
      current.totalDue = roundMoney(current.totalDue + row.amount)
      current.totalPaid = roundMoney(current.totalPaid + row.paidTotal)
      if (row.status === "pending" || row.status === "partial") {
        current.pendingCount += 1
      }
      map.set(key, current)
    }
  }

  const ordered = ofKind.map((category) => map.get(category.id)!)
  const extras = [...map.values()].filter(
    (group) => !ofKind.some((category) => category.id === group.key),
  )
  return [...ordered, ...extras].map((group) => ({
    ...group,
    items: sortPromises(group.items),
  }))
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
        <span
          className={cn(
            "font-numeric text-[11px] tabular-nums",
            workspaceTableNatureStockWarningClass,
          )}
        >
          falta {fmt.format(remaining)}
        </span>
      ) : null}
    </div>
  )
}

function ExpenseDueHint({
  dueDate,
  status,
  formatDate,
}: {
  dueDate: string | null
  status: ExpenseStatus
  formatDate: (iso: string) => string
}) {
  if (!dueDate || status === "paid" || status === "voided") return null
  const overdue = dueDate < todayIso()
  return (
    <span
      className={cn(
        "font-canopy text-[11px]",
        overdue
          ? workspaceTableNatureStockWarningClass
          : "text-rootsy-bruma-500",
      )}
    >
      {overdue ? `Vencido ${formatDate(dueDate)}` : `Vence ${formatDate(dueDate)}`}
    </span>
  )
}

function ExpenseKindCard({
  kind,
  catalog,
  rows,
  ledgerByCategoryId,
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
  catalog: ExpenseCategoryRow[]
  rows: ExpenseListRow[]
  ledgerByCategoryId: Record<string, number>
  listBusy: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  formatDate: (iso: string) => string
  onPay: (row: ExpenseListRow) => void
  onVoid: (row: ExpenseListRow) => void
  onDelete: (row: ExpenseListRow) => void
  onCreate?: (kind: ExpenseCategoryKind, categoryId?: string) => void
}) {
  const copy = EXPENSE_WORLDS[kind]
  const isReadOnlyWorld = copy.readOnly
  const voidedRows = useMemo(
    () => (isReadOnlyWorld ? [] : rows.filter((r) => r.status === "voided")),
    [isReadOnlyWorld, rows],
  )
  const categories = useMemo(
    () => groupsForKind(kind, catalog, rows, ledgerByCategoryId),
    [kind, catalog, rows, ledgerByCategoryId],
  )

  const totalDue = useMemo(
    () => roundMoney(categories.reduce((sum, group) => sum + group.totalDue, 0)),
    [categories],
  )

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
    <div id={copy.anchor} className="scroll-mt-28">
      <DataWorkspaceBlocksSection
        title={copy.title}
        action={
          <span className="font-numeric text-sm font-semibold tabular-nums text-rootsy-bruma-900">
            {listBusy ? "…" : fmt.format(totalDue)}
          </span>
        }
      >
        {listBusy ? (
          <p className={dataWorkspaceBlocksEmptyStateClass}>Cargando…</p>
        ) : categories.length === 0 && voidedRows.length === 0 ? (
          <div className={dataWorkspaceBlocksEmptyStateClass}>
            <p className="font-canopy text-sm font-medium text-rootsy-bruma-900">
              {copy.emptyTitle}
            </p>
            <p className="mx-auto mt-1 max-w-xs">{copy.emptyBody}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => {
              const isOpen = openCategories.has(category.key)
              const hasPromises = category.items.length > 0
              const promiseLabel =
                category.items.length === 1
                  ? copy.itemWord.one
                  : copy.itemWord.many
              return (
                <Collapsible
                  key={category.key}
                  open={hasPromises ? isOpen : false}
                  onOpenChange={(open) => {
                    if (hasPromises) toggleCategory(category.key, open)
                  }}
                >
                  <article
                    className={cn(
                      dataWorkspaceEntityCardLosetaSurfaceClass,
                      "h-auto",
                    )}
                  >
                    <div className="flex items-center gap-2 px-4 py-3.5">
                      <CollapsibleTrigger
                        disabled={!hasPromises}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-rootsy-bruma-500 transition-transform duration-200",
                            !hasPromises && "invisible",
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
                            {category.readOnly
                              ? category.totalDue !== 0
                                ? "Registrado este mes"
                                : "Sin movimiento este mes"
                              : hasPromises
                                ? `${category.items.length} ${promiseLabel}`
                                : "Sin promesas este mes"}
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
                      {canCreate &&
                      onCreate &&
                      category.categoryId &&
                      !category.readOnly ? (
                        <RootsDefaultButton
                          type="button"
                          size="compact"
                          onClick={() => onCreate(kind, category.categoryId!)}
                        >
                          Cargar
                        </RootsDefaultButton>
                      ) : null}
                    </div>

                    {hasPromises ? (
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
                                <ExpenseDueHint
                                  dueDate={row.dueDate}
                                  status={row.status}
                                  formatDate={formatDate}
                                />
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
                    ) : null}
                  </article>
                </Collapsible>
              )
            })}

            {voidedRows.length > 0 ? (
              <Collapsible open={voidedOpen} onOpenChange={setVoidedOpen}>
                <article
                  className={cn(
                    dataWorkspaceEntityCardLosetaSurfaceClass,
                    "h-auto",
                  )}
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
    </div>
  )
}

type PanelProps = {
  categories: ExpenseCategoryRow[]
  rows: ExpenseListRow[]
  ledgerByCategoryId: Record<string, number>
  listBusy: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  formatDate: (iso: string) => string
  onPay: (row: ExpenseListRow) => void
  onVoid: (row: ExpenseListRow) => void
  onDelete: (row: ExpenseListRow) => void
  onCreate?: (kind: ExpenseCategoryKind, categoryId?: string) => void
}

export function ExpenseKindCardsPanel({
  categories,
  rows,
  ledgerByCategoryId,
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
  const rowsByKind = useMemo(() => {
    const map: Record<ExpenseCategoryKind, ExpenseListRow[]> = {
      fijo: [],
      variable: [],
      otro: [],
    }
    for (const row of rows) {
      map[row.categoryKind].push(row)
    }
    return map
  }, [rows])

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      {EXPENSE_WORLD_ORDER.map((kind) => (
        <ExpenseKindCard
          key={kind}
          kind={kind}
          catalog={categories}
          rows={rowsByKind[kind]}
          ledgerByCategoryId={ledgerByCategoryId}
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
      ))}
    </div>
  )
}
