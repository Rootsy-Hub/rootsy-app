import type {
  OperationExpenseLedgerRow,
  OperationPurchaseRow,
  OperationSaleRow,
  OperationServiceChargeRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import { SERVICE_CHARGE_STATUS_LABELS } from "@/lib/serviceChargeTypes"
import {
  formatOperationSaleDateTime,
} from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import { buildCsv, downloadCsv } from "@/lib/exportCsv"
import type { OperationsViewId } from "@/lib/operationsViewPreference"

const SALE_STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  completed: "Completada",
  cancelled: "Anulada",
}

const PURCHASE_KIND_LABEL: Record<string, string> = {
  merchandise: "Mercadería",
  raw_material: "Materia prima",
  supply: "Insumo",
  mixed: "Mixta",
}

function saleComprobanteLabel(sale: OperationSaleRow): string {
  if (sale.arcaInvoice?.tipoLabel) return sale.arcaInvoice.tipoLabel
  if (sale.invoiceTypeLabel) return sale.invoiceTypeLabel
  return ""
}

function formatMoney(n: number): string {
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function csvFilename(view: OperationsViewId): string {
  const stamp = new Date().toISOString().slice(0, 10)
  const base =
    view === "sales"
      ? "ventas"
      : view === "tables"
        ? "mesas"
        : view === "counter"
          ? "mostrador"
          : view === "purchases"
            ? "compras"
            : view === "services"
              ? "servicios"
              : "gastos"
  return `${base}-${stamp}.csv`
}

export function exportOperationsSalesCsv(
  rows: OperationSaleRow[],
  options?: { includeTable?: boolean; includeOrder?: boolean; timeZone?: string },
): void {
  const includeTable = options?.includeTable === true
  const includeOrder = options?.includeOrder === true
  const timeZone = options?.timeZone
  const headers = includeTable
    ? ([
        "Fecha",
        "Hora",
        "Mesa",
        "Cliente",
        "CUIT",
        "Comprobante",
        "Total",
        "Descuento",
        "IVA",
        "Forma de pago",
        "Estado",
        "ID",
      ] as const)
    : includeOrder
      ? ([
          "Fecha",
          "Hora",
          "Pedido",
          "Cliente",
          "CUIT",
          "Comprobante",
          "Total",
          "Descuento",
          "IVA",
          "Forma de pago",
          "Estado",
          "ID",
        ] as const)
      : ([
          "Fecha",
          "Hora",
          "Cliente",
          "CUIT",
          "Comprobante",
          "Total",
          "Descuento",
          "IVA",
          "Forma de pago",
          "Estado",
          "ID",
        ] as const)

  const body = rows.map((sale) => {
    const when = formatOperationSaleDateTime(sale.soldAt, timeZone)
    const base = [
      when.primary,
      when.secondary ?? "",
      ...(includeTable ? [sale.tableLabel ?? ""] : []),
      ...(includeOrder ? [sale.counterOrderLabel ?? ""] : []),
      sale.customerName ?? "Consumidor final",
      sale.customerTaxId ?? "",
      saleComprobanteLabel(sale),
      formatMoney(sale.total),
      sale.discountTotal > 0 ? formatMoney(sale.discountTotal) : "",
      sale.accruesOutputVat && sale.taxTotal > 0
        ? formatMoney(sale.taxTotal)
        : "",
      sale.paymentMethodLabel !== "—" ? sale.paymentMethodLabel : "",
      SALE_STATUS_LABEL[sale.status] ?? sale.status,
      sale.id,
    ]
    return base
  })

  downloadCsv(
    csvFilename(
      includeTable ? "tables" : includeOrder ? "counter" : "sales",
    ),
    buildCsv(headers, body),
  )
}

export function exportOperationsPurchasesCsv(rows: OperationPurchaseRow[]): void {
  const headers = [
    "Fecha",
    "Hora",
    "Proveedor",
    "Tipo",
    "Comprobante",
    "Total",
    "IVA",
    "Forma de pago",
    "Estado",
    "ID",
  ] as const

  const body = rows.map((purchase) => {
    const when = formatOperationSaleDateTime(purchase.operationAt)
    return [
      when.primary,
      when.secondary ?? "",
      purchase.supplierName !== "—" ? purchase.supplierName : "",
      PURCHASE_KIND_LABEL[purchase.purchaseKind] ?? purchase.purchaseKind,
      purchase.documentNumber ?? "",
      formatMoney(purchase.total),
      purchase.taxTotal > 0 ? formatMoney(purchase.taxTotal) : "",
      purchase.paymentMethodLabel !== "—" ? purchase.paymentMethodLabel : "",
      purchase.status,
      purchase.id,
    ]
  })

  downloadCsv(csvFilename("purchases"), buildCsv(headers, body))
}

export function exportOperationsExpensesCsv(
  rows: OperationExpenseLedgerRow[],
  options?: { timeZone?: string },
): void {
  const timeZone = options?.timeZone
  const headers = [
    "Fecha",
    "Hora",
    "Usuario",
    "Categoría",
    "Tipo",
    "Descripción",
    "Importe",
    "Forma de pago",
    "ID asiento",
    "ID gasto",
  ] as const

  const body = rows.map((row) => {
    const when = formatOperationSaleDateTime(row.operationAt, timeZone)
    return [
      when.primary,
      when.secondary ?? "",
      row.recordedByName ?? "",
      row.categoryName,
      row.sourceType === "expense_void" ? "Anulación" : "Pago",
      row.description !== "—" ? row.description : "",
      formatMoney(row.amount),
      row.paymentMethodLabel !== "—" ? row.paymentMethodLabel : "",
      row.entryId,
      row.expenseId ?? "",
    ]
  })

  downloadCsv(csvFilename("expenses"), buildCsv(headers, body))
}

export function exportOperationsServicesCsv(
  rows: OperationServiceChargeRow[],
): void {
  const headers = [
    "Fecha",
    "Vencimiento",
    "Cliente",
    "Servicio",
    "Estado",
    "Período",
    "Importe",
    "Cobrado",
    "Saldo",
    "ID",
  ] as const

  const body = rows.map((row) => [
    row.createdAt,
    row.dueDate,
    row.clientName,
    row.serviceName,
    SERVICE_CHARGE_STATUS_LABELS[row.effectiveStatus],
    row.periodDisplay,
    formatMoney(row.amount),
    formatMoney(row.paidTotal),
    formatMoney(row.balance),
    row.id,
  ])

  downloadCsv(csvFilename("services"), buildCsv(headers, body))
}

export function exportOperationsCsv(
  view: OperationsViewId,
  rows:
    | OperationSaleRow[]
    | OperationPurchaseRow[]
    | OperationExpenseLedgerRow[]
    | OperationServiceChargeRow[],
  timeZone?: string,
): void {
  if (view === "sales") {
    exportOperationsSalesCsv(rows as OperationSaleRow[], { timeZone })
  } else if (view === "tables") {
    exportOperationsSalesCsv(rows as OperationSaleRow[], {
      includeTable: true,
      timeZone,
    })
  } else if (view === "counter") {
    exportOperationsSalesCsv(rows as OperationSaleRow[], {
      includeOrder: true,
      timeZone,
    })
  } else if (view === "purchases") {
    exportOperationsPurchasesCsv(rows as OperationPurchaseRow[])
  } else if (view === "services") {
    exportOperationsServicesCsv(rows as OperationServiceChargeRow[])
  } else {
    exportOperationsExpensesCsv(rows as OperationExpenseLedgerRow[], { timeZone })
  }
}
