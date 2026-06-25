"use client"

import type { OperationPurchaseRow } from "@/app/[siteId]/[popId]/operations/actions"
import { OperationAccountingViewButton } from "@/app/[siteId]/[popId]/operations/OperationAccountingModal"
import { OperationsPurchasesSkeletonRows } from "@/app/[siteId]/[popId]/operations/OperationsTableSkeleton"
import { formatOperationSaleDateTime } from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  lightTableThClass,
  selectColumnInnerClass,
  tableRowSelectCheckboxClass,
  tdClientNamedClass,
  tdMoneyClass,
  tdMoneyMutedClass,
  tdMoneyTotalClass,
  tdMoneyVatClass,
  workspaceTableBodyRowClassNames,
  workspaceTableHeaderRowClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceListTableFrame } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"
import Link from "next/link"
import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const PURCHASE_KIND_LABEL: Record<string, string> = {
  merchandise: "Mercadería",
  raw_material: "Materia prima",
  supply: "Insumo",
}

function purchaseKindLabel(k: string) {
  return PURCHASE_KIND_LABEL[k] ?? k
}

function formatLedgerDate(d: string) {
  if (!d || d.length < 10) return "—"
  const y = Number(d.slice(0, 4))
  const m = Number(d.slice(5, 7))
  const day = Number(d.slice(8, 10))
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) {
    return "—"
  }
  return new Date(y, m - 1, day).toLocaleDateString("es-AR")
}

function formatQty(n: number) {
  const t = Math.round(n * 1e6) / 1e6
  if (Number.isInteger(t)) return String(t)
  return t.toLocaleString("es-AR", { maximumFractionDigits: 6 })
}

function suppliersSearchHref(
  siteId: string,
  popId: string,
  query: string,
): string {
  const base = popScopedHref(siteId, popId, "suppliers")
  const q = query.trim()
  if (!q) return base
  return `${base}?${new URLSearchParams({ q }).toString()}`
}

const opsDialogSurfaceMd = cn(
  "rootsy-app-light gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl ring-1 ring-black/[0.04] sm:max-w-2xl",
  "max-h-[min(90vh,760px)] flex flex-col overflow-hidden",
)
const opsDialogHeader =
  "shrink-0 space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"
const opsDialogBody =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4"

const detailLineMoneyClass = cn("font-medium text-foreground", tdMoneyClass)

const detailTotalMoneyClass = cn(
  "text-base font-semibold text-primary",
  tdMoneyClass,
)

function PurchaseDetailTotalsRow({
  label,
  value,
  emphasize = false,
  valueClassName,
}: {
  label: string
  value: string
  emphasize?: boolean
  valueClassName?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span
        className={cn(
          "text-sm text-muted-foreground",
          emphasize && "font-semibold text-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "shrink-0 tabular-nums",
          emphasize
            ? detailTotalMoneyClass
            : cn("text-sm font-medium text-foreground", tdMoneyClass),
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  )
}

function PurchaseDetailDialog({
  purchase,
  open,
  onOpenChange,
}: {
  purchase: OperationPurchaseRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!purchase) return null

  const when = formatOperationSaleDateTime(purchase.operationAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={opsDialogSurfaceMd}>
        <DialogHeader className={opsDialogHeader}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Detalle de compra
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {when.primary}
            {when.secondary ? ` · ${when.secondary}` : ""} · {purchase.supplierName}{" "}
            · {purchaseKindLabel(purchase.purchaseKind)}
          </DialogDescription>
        </DialogHeader>
        <div className={opsDialogBody}>
          <p className="mb-4 break-all font-mono text-[11px] text-muted-foreground">
            {purchase.id}
          </p>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ítems
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">
                    Producto
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-foreground">
                    Cant.
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-foreground">
                    Costo unit.
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-foreground">
                    IVA %
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-foreground">
                    Línea
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchase.lineItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-muted-foreground"
                    >
                      Sin líneas registradas.
                    </td>
                  </tr>
                ) : (
                  purchase.lineItems.map((line, li) => (
                    <tr
                      key={`${purchase.id}-line-${li}`}
                      className="border-b border-border/60"
                    >
                      <td className="max-w-[200px] px-3 py-2">
                        <span className="font-medium text-foreground">
                          {line.nameSnapshot}
                        </span>
                      </td>
                      <td className={cn("px-3 py-2 text-right", tdMoneyClass)}>
                        {formatQty(line.quantity)}
                      </td>
                      <td className={cn("px-3 py-2 text-right", tdMoneyClass)}>
                        {fmt.format(line.unitCost)}
                      </td>
                      <td className={cn("px-3 py-2 text-right", tdMoneyClass)}>
                        {line.iva > 0 ? `${line.iva}%` : "—"}
                      </td>
                      <td className={cn("px-3 py-2 text-right", detailLineMoneyClass)}>
                        {fmt.format(line.lineTotal)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-muted/20 px-4 py-3">
            <PurchaseDetailTotalsRow
              label="Total"
              value={fmt.format(purchase.total)}
              emphasize
            />
            {purchase.taxTotal > 0 ? (
              <PurchaseDetailTotalsRow
                label="IVA"
                value={fmt.format(purchase.taxTotal)}
                valueClassName={tdMoneyVatClass}
              />
            ) : null}
            <PurchaseDetailTotalsRow
              label="Forma de pago"
              value={purchase.paymentMethodLabel}
            />
          </div>

          {purchase.payments.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pagos
              </p>
              <ul className="space-y-1 rounded-lg border border-border bg-muted/30 px-3 py-2">
                {purchase.payments.map((p, pi) => (
                  <li
                    key={`${purchase.id}-pay-${pi}`}
                    className="flex justify-between text-sm text-foreground"
                  >
                    <span>
                      {p.methodName}
                      {p.paidAt ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {formatLedgerDate(p.paidAt)}
                        </span>
                      ) : null}
                    </span>
                    <span className={tdMoneyClass}>{fmt.format(p.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function OperationsPurchasesTable({
  siteId,
  popId,
  rows,
  listFetching,
  totalCount,
  skeletonRowCount,
  selected,
  onSelectedChange,
  onOpenAccounting,
}: {
  siteId: string
  popId: string
  rows: OperationPurchaseRow[]
  listFetching: boolean
  totalCount: number
  skeletonRowCount: number
  selected: Set<string>
  onSelectedChange: Dispatch<SetStateAction<Set<string>>>
  onOpenAccounting: (purchase: OperationPurchaseRow) => void
}) {
  const [detailPurchase, setDetailPurchase] =
    useState<OperationPurchaseRow | null>(null)

  const visibleIds = useMemo(() => rows.map((row) => row.id), [rows])
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleSelected = visibleIds.some((id) => selected.has(id))

  return (
    <>
      <DataWorkspaceListTableFrame>
      <table
        className={cn(
          "relative w-max min-w-full caption-bottom text-sm",
          "[&_th:last-child]:pr-5 [&_td:last-child]:pr-5",
        )}
        aria-busy={listFetching}
      >
        <TableHeader>
          <TableRow className={workspaceTableHeaderRowClass}>
            <TableHead className={cn(lightTableThClass, "w-12 !px-0 text-center")}>
              <div className={cn(selectColumnInnerClass, "min-h-10")}>
                <Checkbox
                  className={tableRowSelectCheckboxClass}
                  checked={
                    allVisibleSelected
                      ? true
                      : someVisibleSelected
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={(checked) => {
                    onSelectedChange((prev) => {
                      const next = new Set(prev)
                      if (checked === true) {
                        visibleIds.forEach((id) => next.add(id))
                      } else {
                        visibleIds.forEach((id) => next.delete(id))
                      }
                      return next
                    })
                  }}
                  disabled={
                    listFetching || totalCount === 0 || rows.length === 0
                  }
                  aria-label="Seleccionar filas visibles"
                />
              </div>
            </TableHead>
            <TableHead className={cn(lightTableThClass, "w-[7.5rem] text-left")}>
              Fecha
            </TableHead>
            <TableHead className={cn(lightTableThClass, "min-w-[10rem] text-left")}>
              Proveedor
            </TableHead>
            <TableHead className={cn(lightTableThClass, "w-[6.5rem] text-center")}>
              Detalle
            </TableHead>
            <TableHead className={cn(lightTableThClass, "min-w-[9rem] text-left")}>
              Comprobante
            </TableHead>
            <TableHead className={cn(lightTableThClass, "text-right")}>
              Total
            </TableHead>
            <TableHead className={cn(lightTableThClass, "text-right")}>
              IVA
            </TableHead>
            <TableHead className={cn(lightTableThClass, "min-w-[8rem] text-left")}>
              Forma de pago
            </TableHead>
            <TableHead className={cn(lightTableThClass, "w-[6.5rem] text-center")}>
              Asientos
            </TableHead>
            <TableHead className={cn(lightTableThClass, "min-w-[19rem] text-left")}>
              ID
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listFetching ? (
            <OperationsPurchasesSkeletonRows rowCount={skeletonRowCount} />
          ) : totalCount === 0 ? (
            null
          ) : (
            rows.map((purchase, i) => {
              const when = formatOperationSaleDateTime(purchase.operationAt)

              return (
              <TableRow
                key={purchase.id}
                className={workspaceTableBodyRowClassNames(i)}
              >
                <TableCell className="w-12 !px-0 py-2.5 align-middle">
                  <div className={selectColumnInnerClass}>
                    <Checkbox
                      className={tableRowSelectCheckboxClass}
                      checked={selected.has(purchase.id)}
                      onCheckedChange={(checked) => {
                        onSelectedChange((prev) => {
                          const next = new Set(prev)
                          if (checked === true) next.add(purchase.id)
                          else next.delete(purchase.id)
                          return next
                        })
                      }}
                      aria-label={`Seleccionar compra ${purchase.id}`}
                    />
                  </div>
                </TableCell>
                <TableCell className="px-3 py-2.5">
                  <span className="block text-sm font-medium text-foreground">
                    {when.primary}
                  </span>
                  {when.secondary ? (
                    <span className="block text-xs tabular-nums text-muted-foreground">
                      {when.secondary}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="max-w-[14rem] px-3 py-2.5 text-sm">
                  {purchase.supplierId && purchase.supplierName !== "—" ? (
                    <Link
                      href={suppliersSearchHref(
                        siteId,
                        popId,
                        purchase.supplierName,
                      )}
                      className={tdClientNamedClass}
                      title={`Ver ${purchase.supplierName} en Proveedores`}
                    >
                      {purchase.supplierName}
                    </Link>
                  ) : purchase.supplierName !== "—" ? (
                    <span
                      className={tdClientNamedClass}
                      title={purchase.supplierName}
                    >
                      {purchase.supplierName}
                    </span>
                  ) : (
                    <span className={tdMoneyMutedClass}>—</span>
                  )}
                </TableCell>
                <TableCell className="px-2 py-2.5 text-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 px-2.5 text-xs"
                    onClick={() => setDetailPurchase(purchase)}
                  >
                    <Eye className="size-3.5" aria-hidden />
                    Ver
                  </Button>
                </TableCell>
                <TableCell className="max-w-[140px] truncate px-3 py-2.5 text-sm text-foreground">
                  {purchase.documentNumber ?? "—"}
                </TableCell>
                <TableCell
                  className={cn("px-3 py-2.5 text-right text-sm", tdMoneyTotalClass)}
                >
                  {fmt.format(purchase.total)}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right text-sm">
                  {purchase.taxTotal > 0 ? (
                    <span className={tdMoneyVatClass}>
                      {fmt.format(purchase.taxTotal)}
                    </span>
                  ) : (
                    <span className={tdMoneyMutedClass}>—</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[12rem] px-3 py-2.5 text-sm text-foreground">
                  {purchase.paymentMethodLabel !== "—" ? (
                    <span
                      className="line-clamp-2"
                      title={purchase.paymentMethodLabel}
                    >
                      {purchase.paymentMethodLabel}
                    </span>
                  ) : (
                    <span className={tdMoneyMutedClass}>—</span>
                  )}
                </TableCell>
                <TableCell className="px-2 py-2.5 text-center">
                  <OperationAccountingViewButton
                    onClick={() => onOpenAccounting(purchase)}
                    label={`Ver asientos contables de la compra ${purchase.id}`}
                  />
                </TableCell>
                <TableCell className="min-w-[19rem] whitespace-nowrap px-3 py-2.5 pr-5">
                  <span className="font-mono text-[11px] leading-snug text-muted-foreground">
                    {purchase.id}
                  </span>
                </TableCell>
              </TableRow>
              )
            })
          )}
        </TableBody>
      </table>
      {!listFetching && totalCount === 0 ? (
        <div className="min-h-[12rem] flex-1" aria-hidden />
      ) : null}
      </DataWorkspaceListTableFrame>

      <PurchaseDetailDialog
        purchase={detailPurchase}
        open={detailPurchase != null}
        onOpenChange={(open) => {
          if (!open) setDetailPurchase(null)
        }}
      />
    </>
  )
}
