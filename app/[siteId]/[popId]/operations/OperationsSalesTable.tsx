"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  lightTableThClass,
  tdMoneyClass,
  workspaceDataTableClassName,
  workspaceTableBodyRowClassNames,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { Eye, FileText } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
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

function formatQty(n: number) {
  const t = Math.round(n * 1e6) / 1e6
  if (Number.isInteger(t)) return String(t)
  return t.toLocaleString("es-AR", { maximumFractionDigits: 6 })
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
      <DialogContent className="max-h-[min(90vh,760px)] gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Detalle de venta
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {when.primary}
            {when.secondary ? ` · ${when.secondary}` : ""} —{" "}
            <span className="font-mono">{formatOperationShortId(sale.id)}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[min(calc(90vh-5rem),640px)] overflow-y-auto px-6 py-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Estado
              </p>
              <p className="text-sm font-medium text-foreground">
                {saleStatusLabel(sale.status)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Cliente
              </p>
              <p className="text-sm font-medium text-foreground">
                {sale.customerName ?? "Consumidor final"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {sale.accruesOutputVat ? "Subtotal (neto)" : "Importe"}
              </p>
              <p className={cn("text-sm font-medium", tdMoneyClass)}>
                {fmt.format(sale.subtotal)}
              </p>
            </div>
            {sale.accruesOutputVat ? (
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  IVA
                </p>
                <p className={cn("text-sm font-medium", tdMoneyClass)}>
                  {fmt.format(sale.taxTotal)}
                </p>
              </div>
            ) : null}
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total
              </p>
              <p className={cn("text-sm font-semibold text-primary", tdMoneyClass)}>
                {fmt.format(sale.total)}
              </p>
            </div>
          </div>

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

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ítems ({sale.lineItems.length})
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
                      P. unit.
                    </th>
                    {sale.accruesOutputVat ? (
                      <th className="px-3 py-2 text-right text-xs font-semibold text-foreground">
                        IVA %
                      </th>
                    ) : null}
                    <th className="px-3 py-2 text-right text-xs font-semibold text-foreground">
                      Desc.
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-foreground">
                      Línea
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sale.lineItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={sale.accruesOutputVat ? 6 : 5}
                        className="px-3 py-6 text-center text-muted-foreground"
                      >
                        Sin líneas en el comprobante.
                      </td>
                    </tr>
                  ) : (
                    sale.lineItems.map((line, li) => (
                      <tr key={`${sale.id}-line-${li}`} className="border-b border-border/60">
                        <td className="max-w-[220px] px-3 py-2">
                          <span className="font-medium text-foreground">
                            {line.nameSnapshot}
                          </span>
                          {line.comment ? (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {line.comment}
                            </span>
                          ) : null}
                        </td>
                        <td className={cn("px-3 py-2 text-right", tdMoneyClass)}>
                          {formatQty(line.quantity)}
                        </td>
                        <td className={cn("px-3 py-2 text-right", tdMoneyClass)}>
                          {fmt.format(line.unitPrice)}
                        </td>
                        {sale.accruesOutputVat ? (
                          <td className={cn("px-3 py-2 text-right", tdMoneyClass)}>
                            {line.iva > 0 ? `${line.iva}%` : "—"}
                          </td>
                        ) : null}
                        <td className={cn("px-3 py-2 text-right", tdMoneyClass)}>
                          {fmt.format(line.lineDiscount)}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-2 text-right font-medium text-primary",
                            tdMoneyClass,
                          )}
                        >
                          {fmt.format(line.lineTotal)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
      <DialogContent className="max-h-[min(90vh,720px)] gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Comprobante
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {tipo !== "—" ? tipo : "Sin tipo fiscal registrado"}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[min(calc(90vh-5rem),580px)] overflow-y-auto px-6 py-4">
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
  hasActiveFilters,
}: {
  siteId: string
  popId: string
  rows: OperationSaleRow[]
  listFetching: boolean
  totalCount: number
  hasActiveFilters: boolean
}) {
  const [detailSale, setDetailSale] = useState<OperationSaleRow | null>(null)
  const [invoiceSale, setInvoiceSale] = useState<OperationSaleRow | null>(null)

  const emptyMessage = useMemo(
    () =>
      hasActiveFilters
        ? "No hay ventas que coincidan con los filtros."
        : "No hay ventas registradas en este punto.",
    [hasActiveFilters],
  )

  return (
    <>
      <table
        className={cn(workspaceDataTableClassName, "min-w-[88rem]")}
        aria-busy={listFetching}
      >
        <TableHeader>
          <TableRow className="border-0 hover:bg-transparent">
            <TableHead className={cn(lightTableThClass, "w-[5.5rem] text-left")}>
              ID
            </TableHead>
            <TableHead className={cn(lightTableThClass, "w-[7.5rem] text-left")}>
              Fecha
            </TableHead>
            <TableHead className={cn(lightTableThClass, "min-w-[10rem] text-left")}>
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {listFetching ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="py-12 text-center text-muted-foreground"
              >
                Cargando ventas…
              </TableCell>
            </TableRow>
          ) : totalCount === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="py-12 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
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
                  <TableCell className="px-3 py-2.5">
                    <span
                      className="font-mono text-xs text-muted-foreground"
                      title={sale.id}
                    >
                      {formatOperationShortId(sale.id)}
                    </span>
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
                    {sale.clientId && sale.customerName ? (
                      <Link
                        href={clientsSearchHref(siteId, popId, sale.customerName)}
                        className="truncate font-medium text-primary underline-offset-2 hover:underline"
                        title={`Ver ${sale.customerName} en Clientes`}
                      >
                        {clientLabel}
                      </Link>
                    ) : (
                      <span className="truncate text-foreground">{clientLabel}</span>
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                          aria-label={`Ver comprobante ${comprobante}`}
                          onClick={() => setInvoiceSale(sale)}
                        >
                          <FileText className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "px-3 py-2.5 text-right text-sm font-semibold text-primary",
                      tdMoneyClass,
                    )}
                  >
                    {fmt.format(sale.total)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "px-3 py-2.5 text-right text-sm text-foreground",
                      tdMoneyClass,
                    )}
                  >
                    {sale.discountTotal > 0 ? fmt.format(sale.discountTotal) : "—"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "px-3 py-2.5 text-right text-sm text-foreground",
                      tdMoneyClass,
                    )}
                  >
                    {sale.accruesOutputVat && sale.taxTotal > 0
                      ? fmt.format(sale.taxTotal)
                      : "—"}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </table>

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
