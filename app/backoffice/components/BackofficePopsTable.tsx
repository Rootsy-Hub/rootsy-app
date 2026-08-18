"use client"

import type { BackofficePopRow } from "@/app/backoffice/actions"
import {
  BackofficeStatusBadge,
  formatBackofficeDate,
  formatBackofficeMoney,
} from "@/app/backoffice/components/BackofficeSection"
import { buildPaginationItems } from "@/components/data-workspace/buildPaginationItems"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import { RootsIconButton, RootsLinkButton } from "@/components/rootsy-button"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownMenu,
  RootsDropdownSeparator,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ARGENTINA_COUNTRY_LABEL } from "@/lib/argentinaLocalities"
import { cn } from "@/lib/utils"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useId, useMemo, type ReactNode } from "react"

const COUNTRY_LABELS: Record<string, string> = {
  AR: ARGENTINA_COUNTRY_LABEL,
}

function formatPopCountry(country: string | null): string {
  if (!country?.trim()) return "—"
  const code = country.trim().toUpperCase()
  return COUNTRY_LABELS[code] ?? code
}

function formatBillingCycleLabel(
  cycle: BackofficePopRow["billingCycle"],
): string {
  if (cycle === "yearly") return "Anual"
  if (cycle === "monthly") return "Mensual"
  return "—"
}

function formatSubscriptionStatusLabel(status: string | null): string {
  switch (status) {
    case "trial":
      return "Prueba"
    case "active":
      return "Activo"
    case "past_due":
      return "Impago"
    case "canceled":
      return "Cancelado"
    case "pending":
      return "Pendiente"
    default:
      return status ?? "—"
  }
}

function SubscriptionStatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="text-xs text-[var(--rootsy-bruma-500)]">Sin subscripción</span>
    )
  }

  const tone =
    status === "active" || status === "trial"
      ? "bg-[color-mix(in_srgb,var(--rootsy-savia-500)_14%,transparent)] text-[var(--rootsy-savia-700)]"
      : status === "past_due"
        ? "bg-amber-100 text-amber-800"
        : status === "canceled"
          ? "bg-[var(--rootsy-bruma-200)] text-[var(--rootsy-bruma-600)]"
          : "bg-[var(--rootsy-bruma-100)] text-[var(--rootsy-bruma-700)]"

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
        tone,
      )}
    >
      {formatSubscriptionStatusLabel(status)}
    </span>
  )
}

function CellPrimary({ children }: { children: ReactNode }) {
  return (
    <div className="font-medium text-[var(--rootsy-bruma-900)]">{children}</div>
  )
}

function CellSecondary({ children }: { children: ReactNode }) {
  return (
    <div className="mt-0.5 text-xs text-[var(--rootsy-bruma-500)]">
      {children}
    </div>
  )
}

function formatPopPrice(row: BackofficePopRow): string {
  const isYearly = row.billingCycle === "yearly"
  const amount = isYearly ? row.priceYearly : row.priceMonthly
  const suffix = isYearly ? "/ año" : "/ mes"
  if (amount <= 0) return "—"
  return `${formatBackofficeMoney(amount)}${suffix}`
}

type BackofficePopsTableProps = {
  rows: BackofficePopRow[]
  listFetching: boolean
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions: readonly number[]
  onViewDetails: (popId: string) => void
  onEdit: (row: BackofficePopRow) => void
  onDelete: (row: BackofficePopRow) => void
}

export function BackofficePopsTable({
  rows,
  listFetching,
  totalCount,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  onViewDetails,
  onEdit,
  onDelete,
}: BackofficePopsTableProps) {
  const pageSizeLabelId = useId()
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalCount)
  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, page),
    [totalPages, page],
  )

  const headCellClass = "align-top"
  const bodyCellClass = "align-top py-3"

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--rootsy-bruma-200)] hover:bg-transparent">
              <TableHead className={cn("min-w-[160px]", headCellClass)}>POP</TableHead>
              <TableHead className={cn("min-w-[140px]", headCellClass)}>Tipo</TableHead>
              <TableHead className={cn("min-w-[180px]", headCellClass)}>Organización</TableHead>
              <TableHead className={cn("min-w-[180px]", headCellClass)}>Plan</TableHead>
              <TableHead className={cn("min-w-[160px]", headCellClass)}>Facturación</TableHead>
              <TableHead className={cn("min-w-[130px]", headCellClass)}>Creación</TableHead>
              <TableHead className={cn("w-[72px] text-right", headCellClass)}>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-[var(--rootsy-bruma-100)] hover:bg-[var(--rootsy-bruma-50)]/80"
              >
                <TableCell className={bodyCellClass}>
                  <CellPrimary>{row.name}</CellPrimary>
                  <CellSecondary>{formatPopCountry(row.country)}</CellSecondary>
                </TableCell>

                <TableCell className={bodyCellClass}>
                  <CellPrimary>
                    {row.businessTypeDisplayName ?? row.businessTypeName ?? "—"}
                  </CellPrimary>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <SubscriptionStatusBadge status={row.subscriptionStatus} />
                    {!row.isActive ? (
                      <BackofficeStatusBadge active={false} inactiveLabel="POP inactivo" />
                    ) : null}
                  </div>
                </TableCell>

                <TableCell className={bodyCellClass}>
                  <CellPrimary>
                    {row.organizationName ?? "—"}
                  </CellPrimary>
                  <CellSecondary>
                    {row.organizationOwnerName ?? row.ownerName}
                  </CellSecondary>
                </TableCell>

                <TableCell className={bodyCellClass}>
                  <CellPrimary>
                    {row.planDisplayName ?? row.planName ?? "—"}
                  </CellPrimary>
                  <CellSecondary>
                    {formatBillingCycleLabel(row.billingCycle)}
                  </CellSecondary>
                  {row.extraModules.length > 0 ? (
                    <CellSecondary>
                      Extras:{" "}
                      {row.extraModules.map((mod) => mod.label).join(", ")}
                    </CellSecondary>
                  ) : null}
                </TableCell>

                <TableCell className={bodyCellClass}>
                  <div className="flex flex-col items-start">
                    <CellPrimary>{formatPopPrice(row)}</CellPrimary>
                    <RootsLinkButton
                      type="button"
                      size="compact"
                      className="!mt-0.5 !h-auto !min-h-0 !justify-start !self-start !px-0"
                      onClick={() => onViewDetails(row.id)}
                    >
                      Detalles
                    </RootsLinkButton>
                  </div>
                </TableCell>

                <TableCell className={cn(bodyCellClass, "text-sm text-[var(--rootsy-bruma-700)]")}>
                  {formatBackofficeDate(row.createdAt)}
                </TableCell>

                <TableCell className={bodyCellClass}>
                  <div className="flex items-start justify-end">
                    <RootsDropdownMenu>
                      <RootsDropdownTrigger asChild>
                        <RootsIconButton
                          type="button"
                          label={`Acciones para ${row.name}`}
                          rowIntent="neutral"
                          size="compact"
                          tone="light"
                        >
                          <MoreHorizontal />
                        </RootsIconButton>
                      </RootsDropdownTrigger>
                      <RootsDropdownContent theme="light" align="end" className="w-44">
                        <RootsDropdownItem
                          theme="light"
                          className="gap-2"
                          onSelect={() => onEdit(row)}
                        >
                          <Pencil className="size-4" aria-hidden />
                          Editar
                        </RootsDropdownItem>
                        <RootsDropdownSeparator theme="light" />
                        <RootsDropdownItem
                          theme="light"
                          variant="destructive"
                          className="gap-2"
                          disabled={!row.isActive}
                          onSelect={() => onDelete(row)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                          Eliminar
                        </RootsDropdownItem>
                      </RootsDropdownContent>
                    </RootsDropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DataWorkspaceListPaginationFooter
        listFetching={listFetching}
        totalCount={totalCount}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        paginationItems={paginationItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeLabelId={pageSizeLabelId}
      />
    </div>
  )
}
