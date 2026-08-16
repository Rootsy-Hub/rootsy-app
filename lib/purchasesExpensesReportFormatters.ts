import type {
  OperationExpenseLedgerRow,
  OperationPurchaseRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import { formatOperationSaleDateInline } from "@/app/[siteId]/[popId]/operations/OperationsSalesTable"
import {
  expenseDescriptionLabel,
  expenseKindLabel,
} from "@/app/[siteId]/[popId]/operations/operationExpenseUi"
import {
  purchaseKindLabel,
  resolvePurchaseDisplayTaxTotal,
} from "@/app/[siteId]/[popId]/operations/operationPurchaseUi"

export function displayPurchaseReportPaid(purchase: OperationPurchaseRow): number {
  if (purchase.payments.length > 0) {
    return purchase.payments.reduce((acc, payment) => acc + payment.amount, 0)
  }
  if (purchase.paidTotal > 0) return purchase.paidTotal
  return purchase.total
}

export type PurchaseReportRowModel = {
  when: string
  dateSecondary: string | null
  supplier: string
  supplierSecondary: string | null
  kind: string
  comprobante: string
  comprobanteSecondary: string | null
  payment: string
  discount: number
  iva: number
  paid: number
}

export type ExpenseReportRowModel = {
  when: string
  dateSecondary: string | null
  category: string
  detail: string
  detailSecondary: string | null
  payment: string
  amount: number
  isVoid: boolean
}

export function buildPurchaseReportRowModel(
  purchase: OperationPurchaseRow,
  timeZone?: string,
): PurchaseReportRowModel {
  const supplierName =
    purchase.supplierName.trim() && purchase.supplierName !== "—"
      ? purchase.supplierName.trim()
      : null
  const documentNumber = purchase.documentNumber?.trim() || null
  const comprobanteTipo = purchase.documentKindLabel?.trim() || null
  const ivaAmount = resolvePurchaseDisplayTaxTotal(purchase) ?? 0

  let comprobante = "Sin comprobante"
  let comprobanteSecondary: string | null = null
  if (comprobanteTipo || documentNumber) {
    comprobante = comprobanteTipo ?? documentNumber ?? "Comprobante"
    if (comprobanteTipo && documentNumber) {
      comprobanteSecondary = documentNumber
    } else if (purchase.supplierIvaConditionLabel) {
      comprobanteSecondary = purchase.supplierIvaConditionLabel
    }
  }

  const payment =
    purchase.paymentMethodLabel?.trim() && purchase.paymentMethodLabel !== "—"
      ? purchase.paymentMethodLabel
      : "—"

  return {
    when: formatOperationSaleDateInline(purchase.operationAt, timeZone),
    dateSecondary: purchase.purchasedByName?.trim() || null,
    supplier: supplierName ?? purchaseKindLabel(purchase.purchaseKind),
    supplierSecondary: supplierName ? purchaseKindLabel(purchase.purchaseKind) : null,
    kind: purchaseKindLabel(purchase.purchaseKind),
    comprobante,
    comprobanteSecondary,
    payment,
    discount: purchase.discountTotal,
    iva: ivaAmount,
    paid: displayPurchaseReportPaid(purchase),
  }
}

export function buildExpenseReportRowModel(
  expense: OperationExpenseLedgerRow,
  timeZone?: string,
): ExpenseReportRowModel {
  const isVoid = expense.sourceType === "expense_void"
  const description = expenseDescriptionLabel(expense.description)
  const payment =
    !isVoid &&
    expense.paymentMethodLabel?.trim() &&
    expense.paymentMethodLabel !== "—"
      ? expense.paymentMethodLabel
      : "—"

  return {
    when: formatOperationSaleDateInline(expense.operationAt, timeZone),
    dateSecondary: expense.recordedByName?.trim() || null,
    category: expense.categoryName,
    detail: description !== "Sin descripción" ? description : expense.categoryName,
    detailSecondary:
      description !== "Sin descripción"
        ? expenseKindLabel(expense.sourceType)
        : expenseKindLabel(expense.sourceType),
    payment,
    amount: expense.amount,
    isVoid,
  }
}
