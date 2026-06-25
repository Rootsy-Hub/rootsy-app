import type {
  OperationExpenseLedgerRow,
  OperationPurchaseRow,
  OperationSaleRow,
} from "@/app/[siteId]/[popId]/operations/actions"
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
    view === "sales" ? "ventas" : view === "purchases" ? "compras" : "gastos"
  return `${base}-${stamp}.csv`
}

export function exportOperationsSalesCsv(rows: OperationSaleRow[]): void {
  const headers = [
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
  ] as const

  const body = rows.map((sale) => {
    const when = formatOperationSaleDateTime(sale.soldAt)
    return [
      when.primary,
      when.secondary ?? "",
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
  })

  downloadCsv(csvFilename("sales"), buildCsv(headers, body))
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
): void {
  const headers = [
    "Fecha",
    "Hora",
    "Categoría",
    "Tipo",
    "Descripción",
    "Importe",
    "Forma de pago",
    "ID asiento",
    "ID gasto",
  ] as const

  const body = rows.map((row) => {
    const when = formatOperationSaleDateTime(row.operationAt)
    return [
      when.primary,
      when.secondary ?? "",
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

export function exportOperationsCsv(
  view: OperationsViewId,
  rows: OperationSaleRow[] | OperationPurchaseRow[] | OperationExpenseLedgerRow[],
): void {
  if (view === "sales") {
    exportOperationsSalesCsv(rows as OperationSaleRow[])
  } else if (view === "purchases") {
    exportOperationsPurchasesCsv(rows as OperationPurchaseRow[])
  } else {
    exportOperationsExpensesCsv(rows as OperationExpenseLedgerRow[])
  }
}
