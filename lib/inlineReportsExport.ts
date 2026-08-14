"use client"

import type {
  AccountType,
  CashFlowRow,
  ChartOfAccountsReportRow,
  FinancialSummaryRow,
  JournalEntrySummaryRow,
  LedgerMovementRow,
  TrialBalanceRow,
  VatPositionRow,
} from "@/app/[siteId]/[popId]/accounting/actions"
import type { TreasuryPeriodReportRow } from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import type { BalanceSheetDisplayRow } from "@/lib/balanceSheetReportHierarchy"
import type { IncomeStatementDisplayRow } from "@/lib/incomeStatementReportHierarchy"
import { formatAccountingSourceType } from "@/lib/accountingSourceTypeLabels"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import {
  exportInlineReportDocument,
  type ReportTableDocumentExportOptions,
} from "@/lib/reportTableDocumentExport"
import type { ReportExportContext } from "@/lib/reportExportContext"
import { treasuryKindLabel } from "@/lib/treasuryAccountKinds"

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  activo_corriente: "Activo corriente",
  activo_no_corriente: "Activo no corriente",
  pasivo_corriente: "Pasivo corriente",
  pasivo_no_corriente: "Pasivo no corriente",
  patrimonio_neto: "Patrimonio neto",
  ingresos: "Ingresos",
  costos: "Costos",
  gastos: "Gastos",
}

const CHART_NATURE_LABELS = {
  deudora: "Deudora",
  acreedora: "Acreedora",
} as const

function formatExportMoney(value: number): string {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatOptionalMoney(value: number | null | undefined): string {
  if (value == null) return "—"
  return formatExportMoney(value)
}

function formatJournalDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(d)
}

function flattenHierarchyRows(
  rows: IncomeStatementDisplayRow[] | BalanceSheetDisplayRow[],
): string[][] {
  return rows.flatMap((row) => {
    switch (row.kind) {
      case "section-header":
        return [[row.label, "", ""]]
      case "group-header":
        return [[row.label, row.prefix, formatExportMoney(row.total)]]
      case "account":
        return [
          [
            row.line.accountName,
            row.line.accountCode,
            formatExportMoney(row.line.balance),
          ],
        ]
      case "section-total":
        return [[row.label, "", formatExportMoney(row.total)]]
      case "result-total":
        return [[row.label, "", formatExportMoney(row.total)]]
      case "balance-equation":
        return [
          ["Total activo", "", formatExportMoney(row.totalActivo)],
          [
            "Total pasivo + patrimonio + resultado",
            "",
            formatExportMoney(row.totalPasivoPatrimonioYResultado),
          ],
          ["Diferencia de cuadre", "", formatExportMoney(row.diferenciaCuadre)],
        ]
      default:
        return []
    }
  })
}

type InlineExportBase = {
  periodLabel: string
  exportContext: ReportExportContext
  timeZone?: string
  subtitleLines?: string[]
}

async function runExport(
  format: "csv" | "pdf",
  options: ReportTableDocumentExportOptions,
) {
  await exportInlineReportDocument(format, options)
}

export async function exportTrialBalanceReportDocument(
  rows: TrialBalanceRow[],
  format: "csv" | "pdf",
  options: InlineExportBase,
) {
  await runExport(format, {
    title: "Sumas y saldos",
    periodLabel: options.periodLabel,
    filenameBase: "sumas-y-saldos",
    headers: ["Código", "Cuenta", "Tipo", "Debe", "Haber", "Saldo"],
    rows: rows.map((row) => [
      row.accountCode,
      row.accountName,
      ACCOUNT_TYPE_LABELS[row.accountType],
      formatExportMoney(row.sumDebit),
      formatExportMoney(row.sumCredit),
      formatExportMoney(row.balance),
    ]),
    exportContext: options.exportContext,
    subtitleLines: options.subtitleLines,
    landscape: true,
    timeZone: options.timeZone,
  })
}

export async function exportVatPositionReportDocument(
  rows: VatPositionRow[],
  format: "csv" | "pdf",
  options: InlineExportBase,
) {
  await runExport(format, {
    title: "Posición IVA",
    periodLabel: options.periodLabel,
    filenameBase: "posicion-iva",
    headers: ["Código", "Cuenta", "Tipo", "Débito", "Crédito", "Saldo"],
    rows: rows.map((row) => [
      row.accountCode,
      row.accountName,
      ACCOUNT_TYPE_LABELS[row.accountType],
      formatExportMoney(row.sumDebit),
      formatExportMoney(row.sumCredit),
      formatExportMoney(row.balance),
    ]),
    exportContext: options.exportContext,
    subtitleLines: options.subtitleLines,
    landscape: true,
    timeZone: options.timeZone,
  })
}

export async function exportCashFlowReportDocument(
  rows: CashFlowRow[],
  format: "csv" | "pdf",
  options: InlineExportBase,
) {
  await runExport(format, {
    title: "Flujo de caja",
    periodLabel: options.periodLabel,
    filenameBase: "flujo-de-caja",
    headers: ["Código", "Cuenta", "Entidad", "Entradas", "Salidas", "Neto"],
    rows: rows.map((row) => [
      row.accountCode,
      row.accountName,
      row.entityName ?? "—",
      formatExportMoney(row.entradas),
      formatExportMoney(row.salidas),
      formatExportMoney(row.neto),
    ]),
    exportContext: options.exportContext,
    subtitleLines: options.subtitleLines,
    landscape: true,
    timeZone: options.timeZone,
  })
}

export async function exportJournalReportDocument(
  entries: JournalEntrySummaryRow[],
  format: "csv" | "pdf",
  options: InlineExportBase & {
    totalDebit?: number
    totalCredit?: number
  },
) {
  const subtitleLines = [
    ...(options.subtitleLines ?? []),
    `Asientos: ${entries.length.toLocaleString("es-AR")} · Debe: ${formatReportMoneyAr(options.totalDebit ?? 0)} · Haber: ${formatReportMoneyAr(options.totalCredit ?? 0)}`,
  ]

  await runExport(format, {
    title: "Libro diario",
    periodLabel: options.periodLabel,
    filenameBase: "libro-diario",
    headers: ["Fecha", "N.º", "Descripción", "Origen", "Debe", "Haber"],
    rows: entries.map((entry) => [
      formatJournalDate(entry.entryDate),
      String(entry.entryNumber),
      entry.description,
      formatAccountingSourceType(entry.sourceType),
      formatExportMoney(entry.totalDebit),
      formatExportMoney(entry.totalCredit),
    ]),
    exportContext: options.exportContext,
    subtitleLines,
    landscape: true,
    timeZone: options.timeZone,
  })
}

export async function exportLedgerReportDocument(
  rows: LedgerMovementRow[],
  format: "csv" | "pdf",
  options: InlineExportBase & {
    accountCode: string
    accountName: string
  },
) {
  await runExport(format, {
    title: "Mayor general",
    periodLabel: options.periodLabel,
    filenameBase: `mayor-${options.accountCode}`,
    headers: ["Fecha", "N.º", "Referencia", "Debe", "Haber", "Saldo"],
    rows: rows.map((row) => [
      formatJournalDate(row.entryDate),
      String(row.entryNumber),
      row.entryDescription,
      formatExportMoney(row.debitAmount),
      formatExportMoney(row.creditAmount),
      formatExportMoney(row.runningBalance),
    ]),
    exportContext: options.exportContext,
    subtitleLines: [
      `Cuenta: ${options.accountCode} · ${options.accountName}`,
      ...(options.subtitleLines ?? []),
    ],
    landscape: true,
    timeZone: options.timeZone,
  })
}

export async function exportAccountSummariesReportDocument(
  rows: FinancialSummaryRow[],
  format: "csv" | "pdf",
  options: InlineExportBase,
) {
  await runExport(format, {
    title: "Resúmenes por rubro",
    periodLabel: options.periodLabel,
    filenameBase: "resumenes-por-rubro",
    headers: ["Rubro", "Total"],
    rows: rows.map((row) => [row.label, formatExportMoney(row.total)]),
    exportContext: options.exportContext,
    subtitleLines: options.subtitleLines,
    timeZone: options.timeZone,
  })
}

export async function exportIncomeStatementReportDocument(
  displayRows: IncomeStatementDisplayRow[],
  format: "csv" | "pdf",
  options: InlineExportBase & { resultadoNeto?: number },
) {
  await runExport(format, {
    title: "Estado de resultados",
    periodLabel: options.periodLabel,
    filenameBase: "estado-de-resultados",
    headers: ["Concepto", "Código", "Importe"],
    rows: flattenHierarchyRows(displayRows),
    exportContext: options.exportContext,
    subtitleLines: [
      `Resultado neto: ${formatReportMoneyAr(options.resultadoNeto ?? 0)}`,
      ...(options.subtitleLines ?? []),
    ],
    timeZone: options.timeZone,
  })
}

export async function exportBalanceSheetReportDocument(
  displayRows: BalanceSheetDisplayRow[],
  format: "csv" | "pdf",
  options: InlineExportBase,
) {
  await runExport(format, {
    title: "Balance general",
    periodLabel: options.periodLabel,
    filenameBase: "balance-general",
    headers: ["Concepto", "Código", "Importe"],
    rows: flattenHierarchyRows(displayRows),
    exportContext: options.exportContext,
    subtitleLines: options.subtitleLines,
    timeZone: options.timeZone,
  })
}

export async function exportTreasuryReportDocument(
  rows: TreasuryPeriodReportRow[],
  format: "csv" | "pdf",
  options: InlineExportBase,
) {
  await runExport(format, {
    title: "Cuentas y tesorería",
    periodLabel: options.periodLabel,
    filenameBase: "cuentas-y-tesoreria",
    headers: [
      "Cuenta",
      "Tipo",
      "Saldo inicial",
      "Ingresos",
      "Egresos",
      "Saldo al cierre",
      "A liquidar",
      "A pagar",
    ],
    rows: rows.map((row) => [
      row.name,
      treasuryKindLabel(row.kind),
      formatOptionalMoney(row.openingBalance),
      formatExportMoney(row.periodIn),
      formatExportMoney(row.periodOut),
      formatExportMoney(row.closingBalance),
      formatOptionalMoney(row.toLiquidateBalance),
      formatOptionalMoney(row.toPayBalance),
    ]),
    exportContext: options.exportContext,
    subtitleLines: options.subtitleLines,
    landscape: true,
    timeZone: options.timeZone,
  })
}

export async function exportChartOfAccountsReportDocument(
  rows: ChartOfAccountsReportRow[],
  format: "csv" | "pdf",
  options: InlineExportBase,
) {
  await runExport(format, {
    title: "Plan de cuentas",
    periodLabel: options.periodLabel,
    filenameBase: "plan-de-cuentas",
    headers: ["Código", "Nombre", "Rubro", "Naturaleza", "Imputable", "Saldo"],
    rows: rows.map((row) => [
      row.code,
      row.name,
      ACCOUNT_TYPE_LABELS[row.accountType],
      CHART_NATURE_LABELS[row.nature],
      row.isMovementAccount ? "Sí" : "No",
      formatExportMoney(row.balance),
    ]),
    exportContext: options.exportContext,
    subtitleLines: options.subtitleLines,
    landscape: true,
    timeZone: options.timeZone,
  })
}
