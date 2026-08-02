"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { OperationAccountingViewButton } from "@/app/[siteId]/[popId]/operations/OperationAccountingModal"
import { OperationsSalesSkeletonRows } from "@/app/[siteId]/[popId]/operations/OperationsTableSkeleton"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  workspaceDataTableClassName,
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
import { OperationSaleDetailDialog } from "@/app/[siteId]/[popId]/operations/OperationSaleDetailDialog"
import { OperationSaleInvoiceDialog } from "@/app/[siteId]/[popId]/operations/OperationSaleInvoiceDialog"
import {
  displayOperationSalePaid,
  displayOperationSaleTotal,
} from "@/lib/channelOperationSales"
import {
  saleComprobanteLabel,
  saleHasComprobante,
} from "@/lib/operationSaleComprobante"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

export function formatOperationShortId(id: string | null | undefined) {
  if (!id) return "—"
  return id.length > 10 ? `${id.slice(0, 8)}…` : id
}

import {
  addCalendarDays,
  popTimeIntlOptions,
  todayPopCalendarDate,
  toPopCalendarDate,
} from "@/lib/popTimezone"
import { toISODateLocal } from "@/lib/dataWorkspaceDateFilter"

export function formatOperationSaleDateTime(iso: string, timeZone?: string) {
  if (!iso) return { primary: "—", secondary: null as string | null }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return { primary: iso, secondary: null }
  }

  const time = new Intl.DateTimeFormat("es-AR", popTimeIntlOptions(timeZone)).format(
    d,
  )

  const now = new Date()
  const saleDate = timeZone
    ? toPopCalendarDate(iso, timeZone)
    : iso.slice(0, 10)
  const todayDate = timeZone
    ? todayPopCalendarDate(timeZone)
    : toISODateLocal(now)
  const yesterdayDate = timeZone
    ? addCalendarDays(todayDate, -1)
    : toISODateLocal(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))

  if (saleDate === todayDate) return { primary: "Hoy", secondary: time }
  if (saleDate === yesterdayDate) return { primary: "Ayer", secondary: time }

  const primary = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" as const } : {}),
    ...(timeZone ? { timeZone } : {}),
  }).format(d)

  return { primary, secondary: time }
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
  showOrderColumn = false,
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
  showOrderColumn?: boolean
}) {
  const timeZone = usePopTimeZone()
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
        className={workspaceDataTableClassName}
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
            {showOrderColumn ? (
              <TableHead className={cn(lightTableThClass, "w-[6rem] text-left")}>
                Pedido
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
            <OperationsSalesSkeletonRows
              rowCount={skeletonRowCount}
              showTableColumn={showTableColumn}
              showOrderColumn={showOrderColumn}
            />
          ) : totalCount === 0 ? (
            null
          ) : (
            rows.map((sale, i) => {
              const when = formatOperationSaleDateTime(sale.soldAt, timeZone)
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
                  {showOrderColumn ? (
                    <TableCell className="px-3 py-2.5">
                      <span
                        className="block truncate text-sm font-medium text-foreground"
                        title={sale.counterOrderLabel ?? undefined}
                      >
                        {sale.counterOrderLabel ?? "—"}
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
                    <span className="block">{fmt.format(displayOperationSaleTotal(sale))}</span>
                    {displayOperationSalePaid(sale) != null ? (
                      <span className="block text-xs text-muted-foreground">
                        Pagado {fmt.format(displayOperationSalePaid(sale)!)}
                      </span>
                    ) : null}
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
                    <span className="text-[11px] leading-snug text-muted-foreground">
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

      <OperationSaleDetailDialog
        sale={detailSale}
        open={detailSale != null}
        onOpenChange={(open) => {
          if (!open) setDetailSale(null)
        }}
        siteId={siteId}
        popId={popId}
        timeZone={timeZone}
      />
      <OperationSaleInvoiceDialog
        sale={invoiceSale}
        open={invoiceSale != null}
        onOpenChange={(open) => {
          if (!open) setInvoiceSale(null)
        }}
      />
    </>
  )
}
