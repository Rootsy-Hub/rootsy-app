"use client"

import type {
  OperationSaleRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import { OperationAccountingViewButton } from "@/app/[siteId]/[popId]/operations/OperationAccountingModal"
import { OperationsSalesSkeletonRows } from "@/app/[siteId]/[popId]/operations/OperationsTableSkeleton"
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
  tdMoneyClass,
  tdMoneyDiscountClass,
  tdMoneyMutedClass,
  tdMoneyTotalClass,
  tdMoneyVatClass,
  tdClientAnonymousClass,
  tdClientLinkedClass,
  tdClientNamedClass,
  tdTruncatedNameCellClass,
  tdTruncatedTextCellClass,
  workspaceTableBodyRowClassNames,
  workspaceTableHeaderRowClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceListTableFrame, DataWorkspaceTableIconAction } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { Eye, FileText } from "lucide-react"
import Link from "next/link"
import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SaleDetailTicketView } from "@/app/[siteId]/[popId]/operations/SaleDetailTicketView"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const SALE_STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  completed: "Completada",
  cancelled: "Anulada",
}

const INVOICE_STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  pending_afip: "Pendiente AFIP",
  authorized: "Autorizada",
  rejected: "Rechazada",
  cancelled: "Anulada",
}

function saleStatusLabel(s: string) {
  return SALE_STATUS_LABEL[s] ?? s
}

function invoiceStatusLabel(s: string) {
  return INVOICE_STATUS_LABEL[s] ?? s
}

export function formatOperationShortId(id: string | null | undefined) {
  if (!id) return "—"
  return id.length > 10 ? `${id.slice(0, 8)}…` : id
}

export function formatOperationSaleDateTime(iso: string) {
  if (!iso) return { primary: "—", secondary: null as string | null }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return { primary: iso, secondary: null }
  }

  const now = new Date()
  const time = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)

  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  if (isToday) return { primary: "Hoy", secondary: time }
  if (isYesterday) return { primary: "Ayer", secondary: time }

  const primary = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" as const } : {}),
  }).format(d)

  return { primary, secondary: time }
}

function formatCbteFch(s: string) {
  if (!s) return "—"
  if (/^\d{8}$/.test(s)) {
    const y = s.slice(0, 4)
    const m = s.slice(4, 6)
    const d = s.slice(6, 8)
    return `${d}/${m}/${y}`
  }
  const parsed = new Date(s)
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(
      parsed,
    )
  }
  return s
}

function clientsSearchHref(
  siteId: string,
  popId: string,
  query: string,
): string {
  const base = popScopedHref(siteId, popId, "clients")
  const q = query.trim()
  if (!q) return base
  return `${base}?${new URLSearchParams({ q }).toString()}`
}

function saleComprobanteLabel(sale: OperationSaleRow): string {
  if (sale.arcaInvoice?.tipoLabel) return sale.arcaInvoice.tipoLabel
  if (sale.invoiceTypeLabel) return sale.invoiceTypeLabel
  return "—"
}

function saleHasComprobante(sale: OperationSaleRow): boolean {
  return Boolean(sale.arcaInvoice || sale.invoiceTypeLabel)
}

const opsDialogLight = "rootsy-app-light text-foreground"
const opsDialogSurfaceMd = cn(
  opsDialogLight,
  "gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-2xl ring-1 ring-black/[0.04] sm:max-w-2xl",
  "max-h-[min(90vh,760px)] flex flex-col overflow-hidden",
)
const opsDialogSurfaceLg = cn(
  opsDialogLight,
  "gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-2xl ring-1 ring-black/[0.04] sm:max-w-lg",
  "max-h-[min(90vh,720px)] flex flex-col overflow-hidden",
)
const opsDialogHeader =
  "shrink-0 space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"
const opsDialogBody =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4"

function SaleDetailDialog({
  sale,
  open,
  onOpenChange,
}: {
  sale: OperationSaleRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!sale) return null

  const when = formatOperationSaleDateTime(sale.soldAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={opsDialogSurfaceMd}>
        <DialogHeader className={opsDialogHeader}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Detalle de venta
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {when.primary}
            {when.secondary ? ` · ${when.secondary}` : ""} ·{" "}
            {sale.customerName ?? "Consumidor final"} ·{" "}
            {saleStatusLabel(sale.status)}
          </DialogDescription>
        </DialogHeader>
        <div className={opsDialogBody}>
          <p className="mb-4 break-all font-mono text-[11px] text-muted-foreground">
            {sale.id}
          </p>

          <SaleDetailTicketView sale={sale} />

          {sale.payments.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cobros
              </p>
              <ul className="space-y-1 rounded-lg border border-border bg-muted/30 px-3 py-2">
                {sale.payments.map((p, pi) => (
                  <li
                    key={`${sale.id}-pay-${pi}`}
                    className="flex justify-between text-sm text-foreground"
                  >
                    <span>{p.methodName}</span>
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

function SaleInvoiceDialog({
  sale,
  open,
  onOpenChange,
}: {
  sale: OperationSaleRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!sale) return null

  const inv = sale.arcaInvoice
  const tipo = saleComprobanteLabel(sale)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={opsDialogSurfaceLg}>
        <DialogHeader className={opsDialogHeader}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Comprobante
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {tipo !== "—" ? tipo : "Sin tipo fiscal registrado"}
          </DialogDescription>
        </DialogHeader>
        <div className={opsDialogBody}>
          {!saleHasComprobante(sale) ? (
            <p className="text-sm text-muted-foreground">
              Esta venta no tiene comprobante fiscal asociado.
            </p>
          ) : inv ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Punto / Nº
                  </p>
                  <p className={cn("text-sm font-medium text-foreground", tdMoneyClass)}>
                    {inv.ptoVta} — {inv.cbteNro}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Fecha cbte.
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatCbteFch(inv.cbteFch)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Receptor
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {inv.receptorRazonSocial || sale.customerName || "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Doc. receptor
                  </p>
                  <p className="text-sm font-medium tabular-nums text-foreground">
                    {inv.docTipo != null ? `Tipo ${inv.docTipo}` : "—"}{" "}
                    {inv.docNro || sale.customerTaxId || ""}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Neto
                  </p>
                  <p className={cn("text-sm font-medium", tdMoneyClass)}>
                    {fmt.format(inv.impNeto)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    IVA
                  </p>
                  <p className={cn("text-sm font-medium", tdMoneyClass)}>
                    {fmt.format(inv.impIva)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total
                  </p>
                  <p className={cn("text-sm font-semibold text-primary", tdMoneyClass)}>
                    {fmt.format(inv.impTotal)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  CAE
                </p>
                <p className="font-mono text-sm text-foreground">
                  {inv.cae ?? "—"}
                </p>
                {inv.caeFchVto ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Vto. {formatCbteFch(inv.caeFchVto)}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  Estado: {invoiceStatusLabel(inv.status)}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tipo seleccionado en venta
                </p>
                <p className="text-sm font-medium text-foreground">
                  {sale.invoiceTypeLabel}
                </p>
              </div>
              {sale.accruesOutputVat ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Aún no hay comprobante electrónico autorizado en ARCA para
                    esta venta. Los importes del comprobante interno son:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Neto
                      </p>
                      <p className={cn("text-sm font-medium", tdMoneyClass)}>
                        {fmt.format(sale.subtotal)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        IVA
                      </p>
                      <p className={cn("text-sm font-medium", tdMoneyClass)}>
                        {fmt.format(sale.taxTotal)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Total
                      </p>
                      <p
                        className={cn(
                          "text-sm font-semibold text-primary",
                          tdMoneyClass,
                        )}
                      >
                        {fmt.format(sale.total)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Esta venta no registra IVA fiscal. El importe total es:
                  </p>
                  <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Total
                    </p>
                    <p
                      className={cn(
                        "text-sm font-semibold text-primary",
                        tdMoneyClass,
                      )}
                    >
                      {fmt.format(sale.total)}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function OperationsSalesTable({
  siteId,
  popId,
  rows,
  listFetching,
  totalCount,
  skeletonRowCount,
  selected,
  onSelectedChange,
  onOpenAccounting,
  showTableColumn = false,
}: {
  siteId: string
  popId: string
  rows: OperationSaleRow[]
  listFetching: boolean
  totalCount: number
  skeletonRowCount: number
  selected: Set<string>
  onSelectedChange: Dispatch<SetStateAction<Set<string>>>
  onOpenAccounting: (sale: OperationSaleRow) => void
  showTableColumn?: boolean
}) {
  const [detailSale, setDetailSale] = useState<OperationSaleRow | null>(null)
  const [invoiceSale, setInvoiceSale] = useState<OperationSaleRow | null>(null)

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
            {showTableColumn ? (
              <TableHead className={cn(lightTableThClass, "w-[6rem] text-left")}>
                Mesa
              </TableHead>
            ) : null}
            <TableHead className={cn(lightTableThClass, "w-[14rem] min-w-0 max-w-[14rem] text-left")}>
              Cliente
            </TableHead>
            <TableHead className={cn(lightTableThClass, "w-[6.5rem] text-center")}>
              Detalle
            </TableHead>
            <TableHead className={cn(lightTableThClass, "min-w-[11rem] text-left")}>
              Comprobante
            </TableHead>
            <TableHead className={cn(lightTableThClass, "text-right")}>
              Total
            </TableHead>
            <TableHead className={cn(lightTableThClass, "text-right")}>
              Descuento
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
            <OperationsSalesSkeletonRows rowCount={skeletonRowCount} />
          ) : totalCount === 0 ? (
            null
          ) : (
            rows.map((sale, i) => {
              const when = formatOperationSaleDateTime(sale.soldAt)
              const clientLabel = sale.customerName ?? "Consumidor final"
              const comprobante = saleComprobanteLabel(sale)

              return (
                <TableRow
                  key={sale.id}
                  className={workspaceTableBodyRowClassNames(i)}
                >
                  <TableCell className="w-12 !px-0 py-2.5 align-middle">
                    <div className={selectColumnInnerClass}>
                      <Checkbox
                        className={tableRowSelectCheckboxClass}
                        checked={selected.has(sale.id)}
                        onCheckedChange={(checked) => {
                          onSelectedChange((prev) => {
                            const next = new Set(prev)
                            if (checked === true) next.add(sale.id)
                            else next.delete(sale.id)
                            return next
                          })
                        }}
                        aria-label={`Seleccionar venta ${sale.id}`}
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
                  {showTableColumn ? (
                    <TableCell className="px-3 py-2.5">
                      <span
                        className="block truncate text-sm font-medium text-foreground"
                        title={sale.tableLabel ?? undefined}
                      >
                        {sale.tableLabel ?? "—"}
                      </span>
                    </TableCell>
                  ) : null}
                  <TableCell className={tdTruncatedNameCellClass}>
                    {sale.clientId && sale.customerName ? (
                      <Link
                        href={clientsSearchHref(siteId, popId, sale.customerName)}
                        className={tdClientLinkedClass}
                        title={clientLabel}
                      >
                        {clientLabel}
                      </Link>
                    ) : sale.customerName ? (
                      <span className={tdClientNamedClass} title={clientLabel}>
                        {clientLabel}
                      </span>
                    ) : (
                      <span className={tdClientAnonymousClass}>{clientLabel}</span>
                    )}
                  </TableCell>
                  <TableCell className="px-2 py-2.5 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 px-2.5 text-xs"
                      onClick={() => setDetailSale(sale)}
                    >
                      <Eye className="size-3.5" aria-hidden />
                      Ver
                    </Button>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="min-w-0 flex-1 truncate text-sm text-foreground"
                        title={comprobante !== "—" ? comprobante : undefined}
                      >
                        {comprobante}
                      </span>
                      {saleHasComprobante(sale) ? (
                        <DataWorkspaceTableIconAction
                          label={`Ver comprobante ${comprobante}`}
                          icon={FileText}
                          variant="neutral"
                          onClick={() => setInvoiceSale(sale)}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "px-3 py-2.5 text-right text-sm",
                      tdMoneyTotalClass,
                    )}
                  >
                    {fmt.format(sale.total)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right text-sm">
                    {sale.discountTotal > 0 ? (
                      <span className={tdMoneyDiscountClass}>
                        {fmt.format(sale.discountTotal)}
                      </span>
                    ) : (
                      <span className={tdMoneyMutedClass}>—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right text-sm">
                    {sale.accruesOutputVat && sale.taxTotal > 0 ? (
                      <span className={tdMoneyVatClass}>
                        {fmt.format(sale.taxTotal)}
                      </span>
                    ) : (
                      <span className={tdMoneyMutedClass}>—</span>
                    )}
                  </TableCell>
                  <TableCell className={cn(tdTruncatedTextCellClass, "text-foreground")}>
                    {sale.paymentMethodLabel !== "—" ? (
                      <span
                        className="block truncate"
                        title={sale.paymentMethodLabel}
                      >
                        {sale.paymentMethodLabel}
                      </span>
                    ) : (
                      <span className={tdMoneyMutedClass}>—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-2 py-2.5 text-center">
                    <OperationAccountingViewButton
                      onClick={() => onOpenAccounting(sale)}
                      label={`Ver asientos contables de la venta ${sale.id}`}
                    />
                  </TableCell>
                  <TableCell className="min-w-[19rem] whitespace-nowrap px-3 py-2.5 pr-5">
                    <span className="font-mono text-[11px] leading-snug text-muted-foreground">
                      {sale.id}
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

      <SaleDetailDialog
        sale={detailSale}
        open={detailSale != null}
        onOpenChange={(open) => {
          if (!open) setDetailSale(null)
        }}
      />
      <SaleInvoiceDialog
        sale={invoiceSale}
        open={invoiceSale != null}
        onOpenChange={(open) => {
          if (!open) setInvoiceSale(null)
        }}
      />
    </>
  )
}
