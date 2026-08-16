import type {
  OperationExpenseLedgerRow,
  OperationPurchaseRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import {
  buildExpenseReportRowModel,
  buildPurchaseReportRowModel,
  displayPurchaseReportPaid,
} from "@/lib/purchasesExpensesReportFormatters"
import { expenseKindLabel } from "@/app/[siteId]/[popId]/operations/operationExpenseUi"

function formatExportMoney(n: number): string {
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const PURCHASES_REPORT_CSV_HEADERS = [
  "Fecha",
  "Proveedor",
  "Tipo",
  "Comprobante",
  "Número comprobante",
  "Cobro",
  "Descuento",
  "IVA",
  "Total pagado",
  "ID",
] as const

export const EXPENSES_REPORT_CSV_HEADERS = [
  "Fecha",
  "Categoría",
  "Detalle",
  "Tipo",
  "Cobro",
  "Importe",
  "ID asiento",
  "ID gasto",
] as const

export const PURCHASES_REPORT_PDF_HEADERS = [
  "Fecha",
  "Proveedor",
  "Tipo",
  "Comprobante",
  "Cobro",
  "Descuento",
  "IVA",
  "Total",
] as const

export const EXPENSES_REPORT_PDF_HEADERS = [
  "Fecha",
  "Categoría",
  "Detalle",
  "Cobro",
  "Importe",
] as const

export function purchasesExpensesExportFilename(
  kind: "purchases" | "expenses",
  extension: "csv" | "pdf",
  periodSummary: string,
): string {
  const stamp = new Date().toISOString().slice(0, 10)
  const slug = periodSummary
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
  const base = kind === "purchases" ? "compras" : "gastos"
  return slug
    ? `${base}-${slug}-${stamp}.${extension}`
    : `${base}-${stamp}.${extension}`
}

function joinLines(primary: string, secondary: string | null | undefined): string {
  const extra = secondary?.trim()
  if (!extra) return primary
  return `${primary}\n${extra}`
}

export function buildPurchasesReportCsvRows(
  rows: OperationPurchaseRow[],
  timeZone?: string,
): string[][] {
  return rows.map((purchase) => {
    const model = buildPurchaseReportRowModel(purchase, timeZone)
    return [
      model.when,
      model.supplier,
      model.kind,
      model.comprobante,
      model.comprobanteSecondary ?? "",
      model.payment,
      model.discount > 0 ? formatExportMoney(model.discount) : "",
      model.iva > 0 ? formatExportMoney(model.iva) : "",
      formatExportMoney(model.paid),
      purchase.id,
    ]
  })
}

export function buildExpensesReportCsvRows(
  rows: OperationExpenseLedgerRow[],
  timeZone?: string,
): string[][] {
  return rows.map((expense) => {
    const model = buildExpenseReportRowModel(expense, timeZone)
    return [
      model.when,
      model.category,
      model.detail,
      expenseKindLabel(expense.sourceType),
      model.payment,
      formatExportMoney(model.amount),
      expense.entryId,
      expense.expenseId ?? "",
    ]
  })
}

export function buildPurchasesReportPdfRows(
  rows: OperationPurchaseRow[],
  timeZone?: string,
): string[][] {
  return rows.map((purchase) => {
    const model = buildPurchaseReportRowModel(purchase, timeZone)
    return [
      joinLines(model.when, model.dateSecondary),
      joinLines(model.supplier, model.supplierSecondary),
      model.kind,
      joinLines(model.comprobante, model.comprobanteSecondary),
      model.payment,
      model.discount > 0 ? formatExportMoney(model.discount) : "—",
      model.iva > 0 ? formatExportMoney(model.iva) : "—",
      formatExportMoney(model.paid),
    ]
  })
}

export function buildExpensesReportPdfRows(
  rows: OperationExpenseLedgerRow[],
  timeZone?: string,
): string[][] {
  return rows.map((expense) => {
    const model = buildExpenseReportRowModel(expense, timeZone)
    return [
      joinLines(model.when, model.dateSecondary),
      model.category,
      joinLines(model.detail, model.detailSecondary),
      model.payment,
      formatExportMoney(model.amount),
    ]
  })
}

export function sumPurchasesReportPaid(rows: OperationPurchaseRow[]): number {
  return rows.reduce((acc, row) => acc + displayPurchaseReportPaid(row), 0)
}

export function sumExpensesReportAmount(rows: OperationExpenseLedgerRow[]): number {
  return rows.reduce((acc, row) => acc + row.amount, 0)
}
