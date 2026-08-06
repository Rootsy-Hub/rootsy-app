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
  workspaceTableLayoutClassName,
  workspaceTableNatureCheckboxClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutListSurfaceClass,
  workspaceTableLayoutSelectBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { DataWorkspaceListTableFrame } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  WorkspaceTableHead,
  WorkspaceTableBodyRow,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSortHead } from "@/components/data-workspace/WorkspaceTableSortHead"
import type { WorkspaceTableSortDisplayDirection } from "@/lib/workspaceTableSort"
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
import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import {
  TableBody,
  TableCell,
} from "@/components/ui/table"

import {
  OperationTableClientLine,
  OperationTableEmptyComprobanteCell,
  OperationTableMoneyCell,
  OperationTableStackCell,
  OperationTableVerMas,
  operationTableLayoutPlaceholderLineClass,
  operationTablePrimaryClass,
  operationTableSecondaryClass,
} from "@/app/[siteId]/[popId]/operations/operationsTableCells"
import {
  operationsTableComprobanteColumnClass,
  operationsTableDateColumnClass,
  operationsTableDetailColumnClass,
  operationsTableHeaderClass,
  operationsTableMoneyColumnClass,
} from "@/app/[siteId]/[popId]/operations/operationsTableLayout"
import {
  OperationTableActionsCell,
  OperationTableActionsHead,
  OperationTableRowOptionsMenu,
  type OperationTableRowOptionItem,
} from "@/app/[siteId]/[popId]/operations/operationsTableRowOptions"
import { PanelRightOpen, Receipt } from "lucide-react"

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
  const customerName = sale.customerName?.trim() || null
  const ivaAmount =
    sale.accruesOutputVat && sale.taxTotal > 0 ? sale.taxTotal : null

  return (
    <>
      <TableCell className={workspaceTableLayoutSelectBodyCellClass}>
        <div className={selectColumnInnerClass}>
          <Checkbox
            className={workspaceTableNatureCheckboxClass}
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
      <OperationTableStackCell className={operationsTableDateColumnClass}>
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
      <OperationTableStackCell className={operationsTableDetailColumnClass}>
        {customerName ? (
          <OperationTableClientLine
            name={customerName}
            asPrimary
            href={
              sale.clientId && customerName
                ? clientsSearchHref(siteId, popId, customerName)
                : null
            }
          />
        ) : (
          <p className={operationTableLayoutPlaceholderLineClass} aria-hidden>
            {"\u00A0"}
          </p>
        )}
        <OperationTableVerMas
          label={` de la venta ${sale.id}`}
          onClick={() => onOpenDetail(sale)}
        />
      </OperationTableStackCell>
      {hasComprobante ? (
        <OperationTableStackCell className={operationsTableComprobanteColumnClass}>
          <p
            className={operationTablePrimaryClass}
            title={`${comprobanteTipo} · ${sale.customerIvaConditionLabel}`}
          >
            {comprobanteTipo}
          </p>
          <OperationTableVerMas
            label={` del comprobante ${comprobanteTipo}`}
            onClick={() => onOpenComprobante(sale)}
          />
        </OperationTableStackCell>
      ) : (
        <OperationTableEmptyComprobanteCell />
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
  const customerName = sale.customerName?.trim() || null
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
      <TableCell className={workspaceTableLayoutSelectBodyCellClass}>
        <div className={selectColumnInnerClass}>
          <Checkbox
            className={workspaceTableNatureCheckboxClass}
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
          <OperationTableStackCell className={operationsTableDateColumnClass}>
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
          <OperationTableStackCell className={operationsTableDateColumnClass}>
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
        <OperationTableStackCell className={operationsTableDateColumnClass}>
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
      <OperationTableStackCell className={operationsTableDetailColumnClass}>
        {customerName ? (
          <OperationTableClientLine
            name={customerName}
            asPrimary
            title={placeLine}
            href={
              sale.clientId && customerName
                ? clientsSearchHref(siteId, popId, customerName)
                : null
            }
          />
        ) : (
          <p className={operationTablePrimaryClass} title={placeLine}>
            {placeLine}
          </p>
        )}
        <OperationTableVerMas
          label={` de la venta ${sale.id}`}
          onClick={() => onOpenDetail(sale)}
        />
      </OperationTableStackCell>
      {hasComprobante ? (
        <OperationTableStackCell className={operationsTableComprobanteColumnClass}>
          <p
            className={operationTablePrimaryClass}
            title={`${comprobanteTipo} · ${sale.customerIvaConditionLabel}`}
          >
            {comprobanteTipo}
          </p>
          <OperationTableVerMas
            label={` del comprobante ${comprobanteTipo}`}
            onClick={() => onOpenComprobante(sale)}
          />
        </OperationTableStackCell>
      ) : (
        <OperationTableEmptyComprobanteCell />
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

function buildSaleRowOptions(
  sale: OperationSaleRow,
  onOpenDetail: (sale: OperationSaleRow) => void,
  onOpenComprobante: (sale: OperationSaleRow) => void,
): OperationTableRowOptionItem[] {
  const items: OperationTableRowOptionItem[] = [
    {
      id: "detail",
      label: "Ver detalle",
      icon: PanelRightOpen,
      onSelect: () => onOpenDetail(sale),
    },
  ]

  if (saleHasComprobante(sale)) {
    items.push({
      id: "comprobante",
      label: "Ver comprobante",
      icon: Receipt,
      onSelect: () => onOpenComprobante(sale),
    })
  }

  return items
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
  sortable = false,
  sortDirection,
  onSortColumn,
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
  sortable?: boolean
  sortDirection?: (column: "sold_at" | "total") => WorkspaceTableSortDisplayDirection
  onSortColumn?: (column: "sold_at" | "total") => void
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
      <DataWorkspaceListTableFrame className={workspaceTableLayoutListSurfaceClass}>
        <table
          className={cn(workspaceTableLayoutClassName, "min-w-[80rem]")}
          aria-busy={listFetching}
        >
          <WorkspaceTableHeader>
            <WorkspaceTableHeaderRow>
              <WorkspaceTableSelectHead
                tone="nature"
                className={operationsTableHeaderClass()}
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
                ariaLabel="Seleccionar filas visibles"
              />
              {showTableColumn ? (
                <>
                  <WorkspaceTableHead
                    tone="nature"
                    className={operationsTableHeaderClass(operationsTableDateColumnClass)}
                  >
                    Apertura
                  </WorkspaceTableHead>
                  <WorkspaceTableHead
                    tone="nature"
                    className={operationsTableHeaderClass(operationsTableDateColumnClass)}
                  >
                    Cierre
                  </WorkspaceTableHead>
                </>
              ) : sortable && !showOrderColumn ? (
                <WorkspaceTableSortHead
                  tone="nature"
                  label="Fecha"
                  direction={sortDirection?.("sold_at") ?? "none"}
                  onSort={
                    onSortColumn ? () => onSortColumn("sold_at") : undefined
                  }
                  className={operationsTableHeaderClass(operationsTableDateColumnClass)}
                />
              ) : (
                <WorkspaceTableHead
                  tone="nature"
                  className={operationsTableHeaderClass(operationsTableDateColumnClass)}
                >
                  {showOrderColumn ? "Estado" : "Fecha"}
                </WorkspaceTableHead>
              )}
              {useDetailColumnLayout ? (
                <>
                  <WorkspaceTableHead
                    tone="nature"
                    className={operationsTableHeaderClass(operationsTableDetailColumnClass)}
                  >
                    Detalle
                  </WorkspaceTableHead>
                  <WorkspaceTableHead
                    tone="nature"
                    className={operationsTableHeaderClass(operationsTableComprobanteColumnClass)}
                  >
                    Comprobante
                  </WorkspaceTableHead>
                  <WorkspaceTableHead
                    tone="nature"
                    align="right"
                    className={operationsTableHeaderClass(operationsTableMoneyColumnClass)}
                  >
                    Descuento
                  </WorkspaceTableHead>
                  <WorkspaceTableHead
                    tone="nature"
                    align="right"
                    className={operationsTableHeaderClass(operationsTableMoneyColumnClass)}
                  >
                    IVA
                  </WorkspaceTableHead>
                  {sortable ? (
                    <WorkspaceTableSortHead
                      tone="nature"
                      label="Total"
                      align="right"
                      direction={sortDirection?.("total") ?? "none"}
                      onSort={
                        onSortColumn ? () => onSortColumn("total") : undefined
                      }
                      className={operationsTableHeaderClass(
                        operationsTableMoneyColumnClass,
                      )}
                    />
                  ) : (
                    <WorkspaceTableHead
                      tone="nature"
                      align="right"
                      className={operationsTableHeaderClass(operationsTableMoneyColumnClass)}
                    >
                      Total
                    </WorkspaceTableHead>
                  )}
                </>
              ) : null}
              <OperationTableActionsHead />
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
                <WorkspaceTableBodyRow
                        key={sale.id}
                        index={i}
                        selected={selected.has(sale.id)}
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
                  <OperationTableActionsCell>
                    <OperationTableRowOptionsMenu
                      rowLabel={`venta ${sale.id}`}
                      items={buildSaleRowOptions(
                        sale,
                        setDetailSale,
                        setInvoiceSale,
                      )}
                    />
                  </OperationTableActionsCell>
                </WorkspaceTableBodyRow>
              ))
            )}
          </TableBody>
        </table>
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
