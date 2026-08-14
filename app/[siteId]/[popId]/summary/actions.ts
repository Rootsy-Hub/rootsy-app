"use server"

import { getAccountingIncomeStatement } from "@/app/[siteId]/[popId]/accounting/actions"
import { getTreasuryPeriodReport } from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import {
  getOperationsList,
  type OperationExpenseLedgerRow,
  type OperationPurchaseRow,
  type OperationSaleRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import { validatePopAccess } from "@/lib/popHelpers"
import { displayOperationSaleCollected } from "@/lib/channelOperationSales"
import {
  CHART_CUENTAS_POR_COBRAR_CODES,
  CHART_PROVEEDORES_CODES,
  CHART_TARJETAS_COBRAR_CODES,
  CHART_TARJETAS_CREDITO_A_PAGAR_CODES,
} from "@/lib/argV3DefaultChartAccounts"
import {
  computePreviousSummaryDateBounds,
  summaryDeltaPercent,
  type SummaryDatePreset,
} from "@/lib/summaryDateFilter"
import {
  sumExpensesReportAmount,
  sumPurchasesReportPaid,
} from "@/lib/purchasesExpensesReportExportData"
import { addCalendarDays } from "@/lib/entryDateTimezone"
import { operationalDayKey } from "@/lib/popOperationalDay"
import { loadPopOperationalContext } from "@/lib/popTimezoneServer"
import { createClient } from "@/utils/supabase/server"

export type SummaryMetricDelta = {
  value: number
  deltaPercent: number | null
}

export type SummaryPeriodResults = {
  ventas: SummaryMetricDelta
  costoVentas: SummaryMetricDelta
  gananciaBruta: SummaryMetricDelta
  gastos: SummaryMetricDelta
  resultado: SummaryMetricDelta
}

export type SummaryActivityMetric = {
  label: string
  value: string
  moduleKey?: string
}

export type SummaryFinancialMetric = {
  label: string
  value: string
  hint?: string
}

export type SummaryStockMetric = {
  label: string
  value: string
}

export type SummaryChartPoint = {
  label: string
  ventas: number
  ingresos: number
  egresos: number
}

export type SummaryChannelShare = {
  label: string
  percent: number
}

export type SummaryAlertItem = {
  label: string
  value: string
  severity: "warning" | "danger" | "info"
}

export type SummaryDashboardData = {
  periodResults: SummaryPeriodResults
  activity: SummaryActivityMetric[]
  financial: SummaryFinancialMetric[]
  stock: SummaryStockMetric[]
  salesChart: SummaryChartPoint[]
  channelShares: SummaryChannelShare[] | null
  alerts: SummaryAlertItem[]
}

export type SummaryDashboardInput = {
  popId: string
  preset: SummaryDatePreset
  from: string | null
  to: string | null
  enabledModuleKeys: string[]
}

type PeriodFinancials = {
  ventas: number
  costoVentas: number
  gastos: number
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function metricWithDelta(
  current: number,
  previous: number,
): SummaryMetricDelta {
  return {
    value: current,
    deltaPercent: summaryDeltaPercent(current, previous),
  }
}

async function fetchIncomeStatementTotals(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<PeriodFinancials | null> {
  const res = await getAccountingIncomeStatement(popId, from, to)
  if (!res.success) return null
  return {
    ventas: res.data.totalIngresos,
    costoVentas: res.data.totalCostos,
    gastos: res.data.totalGastos,
  }
}

async function fetchAllSales(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<OperationSaleRow[]> {
  const rows: OperationSaleRow[] = []
  let page = 1
  while (page <= 50) {
    const res = await getOperationsList(popId, {
      view: "sales-report",
      dateFrom: from,
      dateTo: to,
      search: "",
      page,
      pageSize: 100,
      sort: "sold_at",
      ord: "desc",
    })
    if (!res.success) break
    rows.push(...res.sales)
    if (page * 100 >= res.totalCount) break
    page += 1
  }
  return rows
}

async function fetchAllPurchases(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<OperationPurchaseRow[]> {
  const rows: OperationPurchaseRow[] = []
  let page = 1
  while (page <= 50) {
    const res = await getOperationsList(popId, {
      view: "purchases",
      dateFrom: from,
      dateTo: to,
      search: "",
      page,
      pageSize: 100,
      sort: "received_at",
      ord: "desc",
    })
    if (!res.success) break
    rows.push(...res.purchases)
    if (page * 100 >= res.totalCount) break
    page += 1
  }
  return rows
}

async function fetchAllExpenses(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<OperationExpenseLedgerRow[]> {
  const rows: OperationExpenseLedgerRow[] = []
  let page = 1
  while (page <= 50) {
    const res = await getOperationsList(popId, {
      view: "expenses",
      dateFrom: from,
      dateTo: to,
      search: "",
      page,
      pageSize: 100,
      sort: "entry_date",
      ord: "desc",
    })
    if (!res.success) break
    rows.push(...res.expenseLedger)
    if (page * 100 >= res.totalCount) break
    page += 1
  }
  return rows
}

function buildSalesChart(
  sales: OperationSaleRow[],
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
): SummaryChartPoint[] {
  const buckets = new Map<string, number>()
  for (const sale of sales) {
    const day = operationalDayKey(sale.soldAt, timeZone, operationalDayCloseTime)
    buckets.set(
      day,
      (buckets.get(day) ?? 0) + displayOperationSaleCollected(sale),
    )
  }

  if (!from || !to) {
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, ventas]) => ({
        label: label.slice(8, 10) + "/" + label.slice(5, 7),
        ventas: roundMoney(ventas),
        ingresos: 0,
        egresos: 0,
      }))
  }

  const points: SummaryChartPoint[] = []
  let cursor = from
  while (cursor <= to) {
    points.push({
      label: `${cursor.slice(8, 10)}/${cursor.slice(5, 7)}`,
      ventas: roundMoney(buckets.get(cursor) ?? 0),
      ingresos: 0,
      egresos: 0,
    })
    cursor = addCalendarDays(cursor, 1)
  }
  return points
}

function buildChannelShares(
  sales: OperationSaleRow[],
  enabledModuleKeys: string[],
): SummaryChannelShare[] | null {
  const hasMesas = enabledModuleKeys.includes("mesas")
  const hasMostrador = enabledModuleKeys.includes("mostrador")
  const hasServices = enabledModuleKeys.includes("services")
  if (!hasMesas && !hasMostrador && !hasServices) return null

  const totals = new Map<string, number>()
  let grand = 0
  for (const sale of sales) {
    const amount = displayOperationSaleCollected(sale)
    grand += amount
    let label = "Mostrador"
    if (sale.saleChannel === "table") label = "Mesas"
    else if (sale.saleChannel === "counter") label = "Mostrador"
    else label = "POS"
    totals.set(label, (totals.get(label) ?? 0) + amount)
  }
  if (grand <= 0) return null

  const filtered = [...totals.entries()].filter(([label]) => {
    if (label === "Mesas") return hasMesas
    if (label === "Mostrador") return hasMostrador
    if (label === "Servicios") return hasServices
    return true
  })

  if (filtered.length <= 1) return null

  return filtered
    .map(([label, amount]) => ({
      label,
      percent: Math.round((amount / grand) * 1000) / 10,
    }))
    .sort((a, b) => b.percent - a.percent)
}

async function fetchStockMetrics(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<{
  stock: SummaryStockMetric[]
  alerts: SummaryAlertItem[]
}> {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from("articles")
    .select("id, min_stock_level, sale_price, track_stock")
    .eq("pop_id", popId)
    .eq("is_active", true)

  if (!articles?.length) {
    return {
      stock: [
        { label: "Valor del stock", value: "—" },
        { label: "Stock bajo", value: "—" },
        { label: "Sin stock", value: "—" },
        { label: "Próximos a vencer", value: "—" },
      ],
      alerts: [],
    }
  }

  const articleIds = articles.map((a) => String(a.id))
  const { data: movements } = await supabase
    .from("inventory_movements")
    .select("article_id, quantity_delta, created_at")
    .eq("pop_id", popId)
    .in("article_id", articleIds)

  const onHandAtPeriodEnd = new Map<string, number>()
  let movementsInPeriod = 0

  for (const mv of movements ?? []) {
    const createdAt = String(mv.created_at ?? "")
    const movementDate = createdAt.slice(0, 10)
    if (to && movementDate > to) continue

    const id = String(mv.article_id)
    onHandAtPeriodEnd.set(
      id,
      (onHandAtPeriodEnd.get(id) ?? 0) + Number(mv.quantity_delta ?? 0),
    )

    if (from && movementDate < from) continue
    if (to && movementDate > to) continue
    movementsInPeriod += 1
  }

  let stockValue = 0
  let lowStock = 0
  let outOfStock = 0

  for (const article of articles) {
    if (!article.track_stock) continue
    const id = String(article.id)
    const qty = Math.round((onHandAtPeriodEnd.get(id) ?? 0) * 1e6) / 1e6
    const min =
      article.min_stock_level != null
        ? Number(article.min_stock_level)
        : null
    const price = Number(article.sale_price ?? 0)
    stockValue += qty * price
    if (qty <= 0) outOfStock += 1
    else if (min != null && qty < min) lowStock += 1
  }

  const stock: SummaryStockMetric[] = [
    {
      label: "Valor del stock",
      value: stockValue > 0 ? String(roundMoney(stockValue)) : "—",
    },
    { label: "Stock bajo", value: String(lowStock) },
    { label: "Sin stock", value: String(outOfStock) },
    {
      label: "Movimientos de stock",
      value: movementsInPeriod > 0 ? String(movementsInPeriod) : "—",
    },
  ]

  const alerts: SummaryAlertItem[] = []
  if (lowStock > 0) {
    alerts.push({
      label: "Stock bajo",
      value: `${lowStock} artículos`,
      severity: "warning",
    })
  }
  if (outOfStock > 0) {
    alerts.push({
      label: "Sin stock",
      value: `${outOfStock} artículos`,
      severity: "danger",
    })
  }

  return { stock, alerts }
}

async function fetchChartAccountBalanceAsOf(
  popId: string,
  codes: readonly string[],
  asOfDate: string | null,
): Promise<number> {
  const supabase = await createClient()
  const { data: accounts } = await supabase
    .from("accounting_chart_of_accounts")
    .select("id, code")
    .eq("pop_id", popId)
    .in("code", [...codes])

  if (!accounts?.length) return 0
  const ids = accounts.map((a) => String(a.id))

  let entryQuery = supabase
    .from("accounting_entries")
    .select("id")
    .eq("pop_id", popId)
    .eq("status", "posted")

  if (asOfDate?.trim()) {
    entryQuery = entryQuery.lte("entry_date", asOfDate.trim())
  }

  const { data: entries } = await entryQuery
  const entryIds = (entries ?? []).map((e) => String(e.id))
  if (entryIds.length === 0) return 0

  const { data: lines } = await supabase
    .from("accounting_entry_lines")
    .select("debit, credit, accounting_chart_account_id, accounting_entry_id")
    .in("accounting_chart_account_id", ids)
    .in("accounting_entry_id", entryIds)

  let balance = 0
  for (const line of lines ?? []) {
    balance += Number(line.debit ?? 0) - Number(line.credit ?? 0)
  }
  return roundMoney(balance)
}

async function fetchPeriodFinancialMetrics(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<SummaryFinancialMetric[]> {
  const asOf = to?.trim() || null

  const [
    treasuryReport,
    porCobrarLedger,
    tarjetasCobrarLedger,
    porPagarLedger,
    tarjetasPagarLedger,
  ] = await Promise.all([
    getTreasuryPeriodReport(popId, { from, to }),
    fetchChartAccountBalanceAsOf(popId, CHART_CUENTAS_POR_COBRAR_CODES, asOf),
    fetchChartAccountBalanceAsOf(popId, CHART_TARJETAS_COBRAR_CODES, asOf),
    fetchChartAccountBalanceAsOf(popId, CHART_PROVEEDORES_CODES, asOf),
    fetchChartAccountBalanceAsOf(
      popId,
      CHART_TARJETAS_CREDITO_A_PAGAR_CODES,
      asOf,
    ),
  ])

  let cashBalance = 0
  let bankBalance = 0
  let posReceivable = 0
  let cardPayable = 0

  if (treasuryReport.success) {
    for (const row of treasuryReport.data.rows) {
      if (!row.isActive) continue
      if (row.kind === "cash") cashBalance += row.closingBalance
      else if (row.kind === "bank" || row.kind === "wallet") {
        bankBalance += row.closingBalance
      }
      posReceivable += row.toLiquidateBalance ?? 0
      cardPayable += row.toPayBalance ?? 0
    }
  }

  const totalPorCobrar = roundMoney(
    porCobrarLedger + tarjetasCobrarLedger + posReceivable,
  )
  const totalPorPagar = roundMoney(
    porPagarLedger + tarjetasPagarLedger + cardPayable,
  )

  return [
    {
      label: "Cajas",
      value: cashBalance !== 0 ? String(cashBalance) : "—",
    },
    {
      label: "Cuentas / Bancos",
      value: bankBalance !== 0 ? String(bankBalance) : "—",
    },
    {
      label: "Por cobrar",
      value: totalPorCobrar > 0 ? String(totalPorCobrar) : "—",
    },
    {
      label: "Por pagar",
      value: totalPorPagar > 0 ? String(totalPorPagar) : "—",
    },
    {
      label: "Cheques pendientes",
      value: "—",
      hint: "—",
    },
  ]
}

export async function getSummaryDashboardData(
  input: SummaryDashboardInput,
): Promise<
  | { success: true; data: SummaryDashboardData }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(input.popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const { popId, from, to, preset, enabledModuleKeys } = input
    const prevBounds = computePreviousSummaryDateBounds(preset, {
      from,
      to,
    })

    const supabase = await createClient()
    const { timeZone, operationalDayCloseTime } =
      await loadPopOperationalContext(supabase, popId)

    const [
      currentFinancials,
      previousFinancials,
      sales,
      purchases,
      expenses,
      financial,
      stockResult,
    ] = await Promise.all([
      fetchIncomeStatementTotals(popId, from, to),
      fetchIncomeStatementTotals(popId, prevBounds.from, prevBounds.to),
      fetchAllSales(popId, from, to),
      fetchAllPurchases(popId, from, to),
      fetchAllExpenses(popId, from, to),
      fetchPeriodFinancialMetrics(popId, from, to),
      fetchStockMetrics(popId, from, to),
    ])

    const ventas = currentFinancials?.ventas ?? 0
    const costoVentas = currentFinancials?.costoVentas ?? 0
    const gastos = currentFinancials?.gastos ?? 0
    const gananciaBruta = roundMoney(ventas - costoVentas)
    const resultado = roundMoney(gananciaBruta - gastos)

    const prevVentas = previousFinancials?.ventas ?? 0
    const prevCosto = previousFinancials?.costoVentas ?? 0
    const prevGastos = previousFinancials?.gastos ?? 0
    const prevGanancia = roundMoney(prevVentas - prevCosto)
    const prevResultado = roundMoney(prevGanancia - prevGastos)

    const salesTotal = sales.reduce(
      (acc, row) => acc + displayOperationSaleCollected(row),
      0,
    )
    const salesCount = sales.length
    const avgTicket = salesCount > 0 ? roundMoney(salesTotal / salesCount) : 0
    const purchasesTotal = sumPurchasesReportPaid(purchases)
    const purchasesCount = purchases.length
    const expensesCount = expenses.length
    const expensesTotal = sumExpensesReportAmount(expenses)

    const activity: SummaryActivityMetric[] = [
      {
        label: "Ventas realizadas",
        value: salesCount.toLocaleString("es-AR"),
      },
      {
        label: "Ticket promedio",
        value: avgTicket > 0 ? String(avgTicket) : "—",
      },
      {
        label: "Compras realizadas",
        value: purchasesCount.toLocaleString("es-AR"),
      },
      {
        label: "Compras",
        value: purchasesTotal > 0 ? String(purchasesTotal) : "—",
      },
      {
        label: "Gastos registrados",
        value: expensesCount.toLocaleString("es-AR"),
      },
    ]

    if (enabledModuleKeys.includes("services")) {
      activity.push({
        label: "Servicios vendidos",
        value: "—",
        moduleKey: "services",
      })
    }
    if (enabledModuleKeys.includes("mesas")) {
      const tableSales = sales.filter((s) => s.saleChannel === "table").length
      activity.push({
        label: "Ventas en mesas",
        value: tableSales.toLocaleString("es-AR"),
        moduleKey: "mesas",
      })
    }
    if (enabledModuleKeys.includes("manufacturing")) {
      activity.push({
        label: "Órdenes fabricadas",
        value: "—",
        moduleKey: "manufacturing",
      })
    }

    const salesChartRaw = buildSalesChart(
      sales,
      from,
      to,
      timeZone,
      operationalDayCloseTime,
    )
    const dayCount = salesChartRaw.length || 1
    const dailyOutflow = roundMoney((purchasesTotal + expensesTotal) / dayCount)
    const salesChart = salesChartRaw.map((point) => ({
      ...point,
      ingresos: point.ventas,
      egresos: dailyOutflow,
    }))

    const channelShares = buildChannelShares(sales, enabledModuleKeys)
    const alerts = [...stockResult.alerts]

    return {
      success: true,
      data: {
        periodResults: {
          ventas: metricWithDelta(ventas, prevVentas),
          costoVentas: metricWithDelta(costoVentas, prevCosto),
          gananciaBruta: metricWithDelta(gananciaBruta, prevGanancia),
          gastos: metricWithDelta(gastos, prevGastos),
          resultado: metricWithDelta(resultado, prevResultado),
        },
        activity,
        financial,
        stock: stockResult.stock,
        salesChart,
        channelShares,
        alerts,
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
