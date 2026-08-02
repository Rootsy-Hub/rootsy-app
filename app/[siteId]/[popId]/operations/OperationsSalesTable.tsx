"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { OperationSaleDetailDialog } from "@/app/[siteId]/[popId]/operations/OperationSaleDetailDialog"
import { OperationSaleInvoiceDialog } from "@/app/[siteId]/[popId]/operations/OperationSaleInvoiceDialog"
import {
  counterOrderStatusLabel,
  formatChannelPlaceLine,
} from "@/app/[siteId]/[popId]/operations/operationSaleDetailUi"
import { OperationsSalesSkeletonRows } from "@/app/[siteId]/[popId]/operations/OperationsTableSkeleton"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { Checkbox } from "@/components/ui/checkbox"
import {
  selectColumnInnerClass,
  tableRowSelectCheckboxClass,
  tdMoneyMutedClass,
  tdClientAnonymousClass,
  tdClientLinkedClass,
  tdClientNamedClass,
  workspaceDataTableClassName,
  workspaceTableBodyCellClass,
  workspaceTableBodyRowClassNames,
  workspaceTableSelectBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceListTableFrame } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { displayOperationSaleTotal } from "@/lib/channelOperationSales"
import {
  saleComprobanteLabel,
  saleHasComprobante,
} from "@/lib/operationSaleComprobante"
import { popScopedHref } from "@/lib/popRoutes"
import { toISODateLocal } from "@/lib/dataWorkspaceDateFilter"
import {
  addCalendarDays,
  popTimeIntlOptions,
  todayPopCalendarDate,
  toPopCalendarDate,
} from "@/lib/popTimezone"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"

import {
  OperationTableMoneyCell,
  OperationTableStackCell,
  OperationTableVerMas,
  operationTablePrimaryClass,
  operationTableSecondaryClass,
} from "@/app/[siteId]/[popId]/operations/operationsTableCells"

export function formatOperationShortId(id: string | null | undefined) {
  if (!id) return "—"
  return id.length > 10 ? `${id.slice(0, 8)}…` : id
}

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

export function formatOperationSaleDateInline(iso: string, timeZone?: string): string {
  const when = formatOperationSaleDateTime(iso, timeZone)
  if (when.primary === "—") return "—"
  if (when.secondary) return `${when.primary} · ${when.secondary}`
  return when.primary
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

function VentasSalesTableRow({
  sale,
  siteId,
  popId,
  timeZone,
  selected,
  onSelectedChange,
  onOpenDetail,
  onOpenComprobante,
}: {
  sale: OperationSaleRow
  siteId: string
  popId: string
  timeZone?: string
  selected: Set<string>
  onSelectedChange: Dispatch<SetStateAction<Set<string>>>
  onOpenDetail: (sale: OperationSaleRow) => void
  onOpenComprobante: (sale: OperationSaleRow) => void
}) {
  const whenInline = formatOperationSaleDateInline(sale.soldAt, timeZone)
  const comprobanteTipo = saleComprobanteLabel(sale)
  const hasComprobante = saleHasComprobante(sale)
  const clientLabel = sale.customerName?.trim() || "—"
  const ivaAmount =
    sale.accruesOutputVat && sale.taxTotal > 0 ? sale.taxTotal : null

  return (
    <>
      <TableCell className={workspaceTableSelectBodyCellClass}>
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
      <OperationTableStackCell className="min-w-[10rem]">
        <p className={cn(operationTablePrimaryClass, "tabular-nums")} title={whenInline}>
          {whenInline}
        </p>
        <p
          className={operationTableSecondaryClass}
          title={sale.soldByName ?? undefined}
        >
          {sale.soldByName ?? "—"}
        </p>
      </OperationTableStackCell>
      <OperationTableStackCell className="min-w-[14rem]">
        <p className={cn(operationTableSecondaryClass, "font-mono")} title={sale.id}>
          {sale.id}
        </p>
        {sale.clientId && sale.customerName ? (
          <Link
            href={clientsSearchHref(siteId, popId, sale.customerName)}
            className={cn(tdClientLinkedClass, "text-xs leading-snug")}
            title={clientLabel}
          >
            {clientLabel}
          </Link>
        ) : sale.customerName ? (
          <p className={cn(tdClientNamedClass, "text-xs leading-snug")} title={clientLabel}>
            {clientLabel}
          </p>
        ) : (
          <p className={cn(tdClientAnonymousClass, "text-xs leading-snug")}>{clientLabel}</p>
        )}
        <OperationTableVerMas
          label={` de la venta ${sale.id}`}
          onClick={() => onOpenDetail(sale)}
        />
      </OperationTableStackCell>
      {hasComprobante ? (
        <OperationTableStackCell className="min-w-[11rem]">
          <p className={operationTablePrimaryClass} title={comprobanteTipo}>
            {comprobanteTipo}
          </p>
          <p
            className={operationTableSecondaryClass}
            title={sale.customerIvaConditionLabel}
          >
            {sale.customerIvaConditionLabel}
          </p>
          <OperationTableVerMas
            label={` del comprobante ${comprobanteTipo}`}
            onClick={() => onOpenComprobante(sale)}
          />
        </OperationTableStackCell>
      ) : (
        <TableCell className={cn(workspaceTableBodyCellClass, "min-w-[11rem] align-middle")}>
          <span className={tdMoneyMutedClass}>—</span>
        </TableCell>
      )}
      <OperationTableMoneyCell amount={sale.discountTotal} />
      <OperationTableMoneyCell amount={ivaAmount ?? 0} />
      <OperationTableMoneyCell
        amount={displayOperationSaleTotal(sale)}
        showDashWhenZero={false}
      />
    </>
  )
}

function ChannelSalesTableRow({
  sale,
  siteId,
  popId,
  timeZone,
  selected,
  onSelectedChange,
  onOpenDetail,
  onOpenComprobante,
  showTableColumn,
}: {
  sale: OperationSaleRow
  siteId: string
  popId: string
  timeZone?: string
  selected: Set<string>
  onSelectedChange: Dispatch<SetStateAction<Set<string>>>
  onOpenDetail: (sale: OperationSaleRow) => void
  onOpenComprobante: (sale: OperationSaleRow) => void
  showTableColumn: boolean
}) {
  const clientLabel = sale.customerName?.trim() || "—"
  const comprobanteTipo = saleComprobanteLabel(sale)
  const hasComprobante = saleHasComprobante(sale)
  const ivaAmount =
    sale.accruesOutputVat && sale.taxTotal > 0 ? sale.taxTotal : null
  const openedInline = formatOperationSaleDateInline(
    sale.channelOpenedAt ?? sale.soldAt,
    timeZone,
  )
  const closedInline = sale.channelClosedAt
    ? formatOperationSaleDateInline(sale.channelClosedAt, timeZone)
    : null
  const placeLine = formatChannelPlaceLine({
    tableLabel: sale.tableLabel,
    counterOrderLabel: sale.counterOrderLabel,
    waiterName: sale.channelWaiterName,
    channel: showTableColumn ? "table" : "counter",
  })

  return (
    <>
      <TableCell className={workspaceTableSelectBodyCellClass}>
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
      {showTableColumn ? (
        <>
          <OperationTableStackCell className="min-w-[10rem]">
            <p className={cn(operationTablePrimaryClass, "tabular-nums")} title={openedInline}>
              {openedInline}
            </p>
            <p
              className={operationTableSecondaryClass}
              title={sale.channelOpenedByName ?? undefined}
            >
              {sale.channelOpenedByName ?? "—"}
            </p>
          </OperationTableStackCell>
          <OperationTableStackCell className="min-w-[10rem]">
            <p
              className={cn(
                operationTablePrimaryClass,
                "tabular-nums",
                !closedInline && "text-muted-foreground",
              )}
              title={closedInline ?? "Cierre pendiente"}
            >
              {closedInline ?? "Cierre pendiente"}
            </p>
            <p
              className={operationTableSecondaryClass}
              title={sale.channelClosedByName ?? undefined}
            >
              {closedInline ? (sale.channelClosedByName ?? "—") : "—"}
            </p>
          </OperationTableStackCell>
        </>
      ) : (
        <OperationTableStackCell className="min-w-[10rem]">
          <p
            className={operationTablePrimaryClass}
            title={counterOrderStatusLabel(sale.channelCounterStatus)}
          >
            {counterOrderStatusLabel(sale.channelCounterStatus)}
          </p>
          <p
            className={operationTableSecondaryClass}
            title={sale.channelOpenedByName ?? undefined}
          >
            {sale.channelOpenedByName ?? "—"}
          </p>
        </OperationTableStackCell>
      )}
      <OperationTableStackCell className="min-w-[14rem]">
        {sale.clientId && sale.customerName ? (
          <Link
            href={clientsSearchHref(siteId, popId, sale.customerName)}
            className={cn(tdClientLinkedClass, "text-xs leading-snug")}
            title={clientLabel}
          >
            {clientLabel}
          </Link>
        ) : sale.customerName ? (
          <p className={cn(tdClientNamedClass, "text-xs leading-snug")} title={clientLabel}>
            {clientLabel}
          </p>
        ) : (
          <p className={cn(tdClientAnonymousClass, "text-xs leading-snug")}>{clientLabel}</p>
        )}
        <p className={operationTablePrimaryClass} title={placeLine}>
          {placeLine}
        </p>
        <OperationTableVerMas
          label={` de la venta ${sale.id}`}
          onClick={() => onOpenDetail(sale)}
        />
      </OperationTableStackCell>
      {hasComprobante ? (
        <OperationTableStackCell className="min-w-[11rem]">
          <p className={operationTablePrimaryClass} title={comprobanteTipo}>
            {comprobanteTipo}
          </p>
          <p
            className={operationTableSecondaryClass}
            title={sale.customerIvaConditionLabel}
          >
            {sale.customerIvaConditionLabel}
          </p>
          <OperationTableVerMas
            label={` del comprobante ${comprobanteTipo}`}
            onClick={() => onOpenComprobante(sale)}
          />
        </OperationTableStackCell>
      ) : (
        <TableCell className={cn(workspaceTableBodyCellClass, "min-w-[11rem] align-middle")}>
          <span className={tdMoneyMutedClass}>—</span>
        </TableCell>
      )}
      <OperationTableMoneyCell amount={sale.discountTotal} />
      <OperationTableMoneyCell amount={ivaAmount ?? 0} />
      <OperationTableMoneyCell
        amount={displayOperationSaleTotal(sale)}
        showDashWhenZero={false}
      />
    </>
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
  showTableColumn?: boolean
  showOrderColumn?: boolean
}) {
  const timeZone = usePopTimeZone()
  const [detailSale, setDetailSale] = useState<OperationSaleRow | null>(null)
  const [invoiceSale, setInvoiceSale] = useState<OperationSaleRow | null>(null)
  const isVentasLayout = !showTableColumn && !showOrderColumn
  const isChannelLayout = showTableColumn || showOrderColumn
  const useDetailColumnLayout = isVentasLayout || isChannelLayout

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
          <WorkspaceTableHeader>
            <WorkspaceTableHeaderRow>
              <WorkspaceTableSelectHead
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
              />
              {showTableColumn ? (
                <>
                  <WorkspaceTableHead className="min-w-[10rem]">Apertura</WorkspaceTableHead>
                  <WorkspaceTableHead className="min-w-[10rem]">Cierre</WorkspaceTableHead>
                </>
              ) : (
                <WorkspaceTableHead className="min-w-[10rem]">
                  {showOrderColumn ? "Estado" : "Fecha"}
                </WorkspaceTableHead>
              )}
              {useDetailColumnLayout ? (
                <>
                  <WorkspaceTableHead className="min-w-[14rem]">Detalle</WorkspaceTableHead>
                  <WorkspaceTableHead className="min-w-[11rem]">Comprobante</WorkspaceTableHead>
                  <WorkspaceTableHead align="right">Descuento</WorkspaceTableHead>
                  <WorkspaceTableHead align="right">IVA</WorkspaceTableHead>
                  <WorkspaceTableHead align="right">Total</WorkspaceTableHead>
                </>
              ) : null}
            </WorkspaceTableHeaderRow>
          </WorkspaceTableHeader>
          <TableBody>
            {listFetching ? (
              <OperationsSalesSkeletonRows
                rowCount={skeletonRowCount}
                showTableColumn={showTableColumn}
                showOrderColumn={showOrderColumn}
                ventasLayout={useDetailColumnLayout}
              />
            ) : totalCount === 0 ? (
              null
            ) : (
              rows.map((sale, i) => (
                <TableRow
                  key={sale.id}
                  className={workspaceTableBodyRowClassNames(i)}
                >
                  {isVentasLayout ? (
                    <VentasSalesTableRow
                      sale={sale}
                      siteId={siteId}
                      popId={popId}
                      timeZone={timeZone}
                      selected={selected}
                      onSelectedChange={onSelectedChange}
                      onOpenDetail={setDetailSale}
                      onOpenComprobante={setInvoiceSale}
                    />
                  ) : (
                    <ChannelSalesTableRow
                      sale={sale}
                      siteId={siteId}
                      popId={popId}
                      timeZone={timeZone}
                      selected={selected}
                      onSelectedChange={onSelectedChange}
                      onOpenDetail={setDetailSale}
                      onOpenComprobante={setInvoiceSale}
                      showTableColumn={showTableColumn}
                    />
                  )}
                </TableRow>
              ))
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
