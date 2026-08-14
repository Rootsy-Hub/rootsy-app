"use server"

import { getAccountingIncomeStatement } from "@/app/[siteId]/[popId]/accounting/actions"
import {
  getOperationsList,
  type OperationExpenseLedgerRow,
  type OperationPurchaseRow,
  type OperationSaleRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import { validatePopAccess } from "@/lib/popHelpers"
import { displayOperationSaleCollected } from "@/lib/channelOperationSales"
import {
  statisticsSectionById,
  type StatisticsSectionId,
} from "@/lib/statisticsCatalog"
import {
  computePreviousSummaryDateBounds,
  summaryDeltaPercent,
  type SummaryDatePreset,
} from "@/lib/summaryDateFilter"
import {
  sumExpensesReportAmount,
  sumPurchasesReportPaid,
} from "@/lib/purchasesExpensesReportExportData"
import {
  expandCalendarBoundsForOperationalFetch,
  filterSalesByOperationalPeriod,
  operationalDayKey,
  operationalHourSlotIndex,
  operationalHourSlotLabel,
} from "@/lib/popOperationalDay"
import { addCalendarDays } from "@/lib/entryDateTimezone"
import { createClient } from "@/utils/supabase/server"
import { loadPopOperationalContext } from "@/lib/popTimezoneServer"

export type StatisticsCompareMetric = {
  id: string
  label: string
  value: number
  previousValue: number
  deltaPercent: number | null
  deltaPoints: number | null
  format: "money" | "number" | "percent"
}

export type StatisticsEvolutionPoint = {
  label: string
  value: number
}

export type StatisticsHourlyHeatmapDay = {
  key: string
  label: string
}

export type StatisticsHourlyHeatmapHour = {
  slot: number
  label: string
}

export type StatisticsHourlyHeatmapCell = {
  dayKey: string
  hourSlot: number
  value: number
}

export type StatisticsHourlyHeatmap = {
  days: StatisticsHourlyHeatmapDay[]
  hours: StatisticsHourlyHeatmapHour[]
  cells: StatisticsHourlyHeatmapCell[]
  maxValue: number
}

export type StatisticsSegment = {
  label: string
  value: number
  percent: number
}

export type StatisticsRankRow = {
  rank: number
  label: string
  value: number
  secondaryLabel?: string
  secondaryValue?: number
}

export type StatisticsSectionData = {
  sectionId: StatisticsSectionId
  title: string
  description: string
  comparison: StatisticsCompareMetric[]
  evolution: StatisticsEvolutionPoint[]
  hourlyEvolution: StatisticsEvolutionPoint[]
  hourlyHeatmap: StatisticsHourlyHeatmap
  segments: StatisticsSegment[]
  rankings: StatisticsRankRow[]
  unavailable: string[]
}

export type StatisticsFilters = {
  channel: string | null
  seller: string | null
  client: string | null
  supplier: string | null
  product: string | null
  category: string | null
  paymentMethod: string | null
}

export type StatisticsQueryInput = {
  popId: string
  sectionId: StatisticsSectionId
  preset: SummaryDatePreset
  from: string | null
  to: string | null
  compareEnabled: boolean
  filters: StatisticsFilters
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function compareMetric(
  id: string,
  label: string,
  value: number,
  previousValue: number,
  format: StatisticsCompareMetric["format"],
  deltaPoints: number | null = null,
): StatisticsCompareMetric {
  return {
    id,
    label,
    value,
    previousValue,
    deltaPercent: summaryDeltaPercent(value, previousValue),
    deltaPoints,
    format,
  }
}

function saleChannelLabel(channel: OperationSaleRow["saleChannel"]): string {
  if (channel === "table") return "Mesas"
  if (channel === "counter") return "Mostrador"
  return "POS"
}

function filterSales(
  sales: OperationSaleRow[],
  filters: StatisticsFilters,
): OperationSaleRow[] {
  return sales.filter((sale) => {
    if (filters.channel && saleChannelLabel(sale.saleChannel) !== filters.channel) {
      return false
    }
    if (filters.seller && sale.soldByName !== filters.seller) return false
    if (filters.client && (sale.customerName ?? "") !== filters.client) return false
    if (
      filters.paymentMethod &&
      !sale.payments.some((p) => p.methodName === filters.paymentMethod) &&
      sale.paymentMethodLabel !== filters.paymentMethod
    ) {
      return false
    }
    if (filters.product) {
      const hasProduct = sale.lineItems.some((li) =>
        li.nameSnapshot.toLowerCase().includes(filters.product!.toLowerCase()),
      )
      if (!hasProduct) return false
    }
    return true
  })
}

function filterPurchases(
  purchases: OperationPurchaseRow[],
  filters: StatisticsFilters,
): OperationPurchaseRow[] {
  return purchases.filter((purchase) => {
    if (filters.supplier && purchase.supplierName !== filters.supplier) {
      return false
    }
    if (filters.product) {
      const hasProduct = purchase.lineItems.some((li) =>
        li.nameSnapshot.toLowerCase().includes(filters.product!.toLowerCase()),
      )
      if (!hasProduct) return false
    }
    return true
  })
}

function salesTotal(sales: OperationSaleRow[]): number {
  return roundMoney(
    sales.reduce((acc, row) => acc + displayOperationSaleCollected(row), 0),
  )
}

function avgTicket(sales: OperationSaleRow[]): number {
  if (sales.length === 0) return 0
  return roundMoney(salesTotal(sales) / sales.length)
}

function buildDailyEvolution(
  sales: OperationSaleRow[],
  from: string | null,
  to: string | null,
  valueFn: (daySales: OperationSaleRow[]) => number,
  timeZone: string,
  operationalDayCloseTime: string,
): StatisticsEvolutionPoint[] {
  const buckets = new Map<string, OperationSaleRow[]>()
  for (const sale of sales) {
    const day = operationalDayKey(sale.soldAt, timeZone, operationalDayCloseTime)
    const list = buckets.get(day) ?? []
    list.push(sale)
    buckets.set(day, list)
  }

  if (!from || !to) {
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, daySales]) => ({
        label: `${day.slice(8, 10)}/${day.slice(5, 7)}`,
        value: roundMoney(valueFn(daySales)),
      }))
  }

  const points: StatisticsEvolutionPoint[] = []
  let cursor = from
  while (cursor <= to) {
    points.push({
      label: `${cursor.slice(8, 10)}/${cursor.slice(5, 7)}`,
      value: roundMoney(valueFn(buckets.get(cursor) ?? [])),
    })
    cursor = addCalendarDays(cursor, 1)
  }
  return points
}

function buildHourlyEvolution(
  sales: OperationSaleRow[],
  timeZone: string,
  operationalDayCloseTime: string,
  valueFn: (hourSales: OperationSaleRow[]) => number,
): StatisticsEvolutionPoint[] {
  const buckets = new Map<number, OperationSaleRow[]>()
  for (const sale of sales) {
    const slot = operationalHourSlotIndex(
      sale.soldAt,
      timeZone,
      operationalDayCloseTime,
    )
    const list = buckets.get(slot) ?? []
    list.push(sale)
    buckets.set(slot, list)
  }

  return Array.from({ length: 24 }, (_, slot) => ({
    label: operationalHourSlotLabel(slot, operationalDayCloseTime),
    value: roundMoney(valueFn(buckets.get(slot) ?? [])),
  }))
}

function emptyHourlyHeatmap(): StatisticsHourlyHeatmap {
  return { days: [], hours: [], cells: [], maxValue: 0 }
}

function buildHourlyHeatmap(
  sales: OperationSaleRow[],
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
  valueFn: (hourSales: OperationSaleRow[]) => number,
): StatisticsHourlyHeatmap {
  const buckets = new Map<string, OperationSaleRow[]>()
  for (const sale of sales) {
    const day = operationalDayKey(sale.soldAt, timeZone, operationalDayCloseTime)
    const slot = operationalHourSlotIndex(
      sale.soldAt,
      timeZone,
      operationalDayCloseTime,
    )
    const key = `${day}|${slot}`
    const list = buckets.get(key) ?? []
    list.push(sale)
    buckets.set(key, list)
  }

  const days: StatisticsHourlyHeatmapDay[] = []
  if (from && to) {
    let cursor = from
    while (cursor <= to) {
      days.push({
        key: cursor,
        label: `${cursor.slice(8, 10)}/${cursor.slice(5, 7)}`,
      })
      cursor = addCalendarDays(cursor, 1)
    }
  } else {
    const dayKeys = new Set<string>()
    for (const sale of sales) {
      dayKeys.add(operationalDayKey(sale.soldAt, timeZone, operationalDayCloseTime))
    }
    for (const day of [...dayKeys].sort()) {
      days.push({
        key: day,
        label: `${day.slice(8, 10)}/${day.slice(5, 7)}`,
      })
    }
  }

  const hours = Array.from({ length: 24 }, (_, slot) => ({
    slot,
    label: operationalHourSlotLabel(slot, operationalDayCloseTime),
  }))

  const cells: StatisticsHourlyHeatmapCell[] = []
  let maxValue = 0
  for (const day of days) {
    for (const hour of hours) {
      const value = roundMoney(
        valueFn(buckets.get(`${day.key}|${hour.slot}`) ?? []),
      )
      maxValue = Math.max(maxValue, value)
      cells.push({
        dayKey: day.key,
        hourSlot: hour.slot,
        value,
      })
    }
  }

  return { days, hours, cells, maxValue }
}

function buildHourlySalesViews(
  sales: OperationSaleRow[],
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
  valueFn: (hourSales: OperationSaleRow[]) => number,
): Pick<StatisticsSectionData, "hourlyEvolution" | "hourlyHeatmap"> {
  return {
    hourlyEvolution: buildHourlyEvolution(
      sales,
      timeZone,
      operationalDayCloseTime,
      valueFn,
    ),
    hourlyHeatmap: buildHourlyHeatmap(
      sales,
      from,
      to,
      timeZone,
      operationalDayCloseTime,
      valueFn,
    ),
  }
}

function buildSegments(
  entries: Map<string, number>,
  limit = 8,
): StatisticsSegment[] {
  const total = [...entries.values()].reduce((a, b) => a + b, 0)
  if (total <= 0) return []
  return [...entries.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({
      label,
      value: roundMoney(value),
      percent: Math.round((value / total) * 1000) / 10,
    }))
}

function buildRankings(
  entries: Map<string, number>,
  secondary?: Map<string, number>,
  limit = 10,
): StatisticsRankRow[] {
  return [...entries.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value], index) => ({
      rank: index + 1,
      label,
      value: roundMoney(value),
      secondaryLabel: secondary ? "Cantidad" : undefined,
      secondaryValue: secondary?.get(label),
    }))
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

async function fetchIncomeTotals(
  popId: string,
  from: string | null,
  to: string | null,
) {
  const res = await getAccountingIncomeStatement(popId, from, to)
  if (!res.success) {
    return { ingresos: 0, costos: 0, gastos: 0, resultado: 0, margen: 0 }
  }
  const ingresos = res.data.totalIngresos
  const costos = res.data.totalCostos
  const gastos = res.data.totalGastos
  const ganancia = roundMoney(ingresos - costos)
  const margen = ingresos > 0 ? roundMoney((ganancia / ingresos) * 100) : 0
  return {
    ingresos,
    costos,
    gastos,
    resultado: res.data.resultadoNeto,
    margen,
  }
}

function buildSalesSection(
  sales: OperationSaleRow[],
  prevSales: OperationSaleRow[],
  from: string | null,
  to: string | null,
  compareEnabled: boolean,
  timeZone: string,
  operationalDayCloseTime: string,
): StatisticsSectionData {
  const total = salesTotal(sales)
  const prevTotal = compareEnabled ? salesTotal(prevSales) : 0
  const count = sales.length
  const prevCount = compareEnabled ? prevSales.length : 0
  const ticket = avgTicket(sales)
  const prevTicket = compareEnabled ? avgTicket(prevSales) : 0

  const channelTotals = new Map<string, number>()
  for (const sale of sales) {
    const label = saleChannelLabel(sale.saleChannel)
    channelTotals.set(
      label,
      (channelTotals.get(label) ?? 0) + displayOperationSaleCollected(sale),
    )
  }

  const paymentTotals = new Map<string, number>()
  for (const sale of sales) {
    for (const payment of sale.payments) {
      paymentTotals.set(
        payment.methodName,
        (paymentTotals.get(payment.methodName) ?? 0) + payment.amount,
      )
    }
  }

  const sellerTotals = new Map<string, number>()
  for (const sale of sales) {
    const name = sale.soldByName?.trim() || "Sin vendedor"
    sellerTotals.set(
      name,
      (sellerTotals.get(name) ?? 0) + displayOperationSaleCollected(sale),
    )
  }

  return {
    sectionId: "sales",
    title: "Ventas",
    description: "Evolución de ventas, facturación y ticket promedio",
    comparison: [
      compareMetric("total", "Ventas", total, prevTotal, "money"),
      compareMetric("count", "Cantidad", count, prevCount, "number"),
      compareMetric("ticket", "Ticket promedio", ticket, prevTicket, "money"),
    ],
    evolution: buildDailyEvolution(
      sales,
      from,
      to,
      salesTotal,
      timeZone,
      operationalDayCloseTime,
    ),
    ...buildHourlySalesViews(
      sales,
      from,
      to,
      timeZone,
      operationalDayCloseTime,
      salesTotal,
    ),
    segments: buildSegments(channelTotals),
    rankings: buildRankings(sellerTotals),
    unavailable: ["Facturación fiscal detallada"],
  }
}

function buildProfitabilitySection(
  current: Awaited<ReturnType<typeof fetchIncomeTotals>>,
  previous: Awaited<ReturnType<typeof fetchIncomeTotals>>,
  compareEnabled: boolean,
  from: string | null,
  to: string | null,
): StatisticsSectionData {
  const prev = compareEnabled ? previous : { ingresos: 0, costos: 0, gastos: 0, resultado: 0, margen: 0 }
  const ganancia = roundMoney(current.ingresos - current.costos)
  const prevGanancia = roundMoney(prev.ingresos - prev.costos)

  return {
    sectionId: "profitability",
    title: "Rentabilidad",
    description: "Margen, costos, gastos y resultado del negocio",
    comparison: [
      compareMetric("gross", "Ganancia bruta", ganancia, prevGanancia, "money"),
      compareMetric(
        "margin",
        "Margen",
        current.margen,
        prev.margen,
        "percent",
        compareEnabled ? roundMoney(current.margen - prev.margen) : null,
      ),
      compareMetric("costs", "Costo de ventas", current.costos, prev.costos, "money"),
      compareMetric("expenses", "Gastos", current.gastos, prev.gastos, "money"),
      compareMetric("result", "Resultado", current.resultado, prev.resultado, "money"),
    ],
    evolution: [],
    hourlyEvolution: [],
    hourlyHeatmap: emptyHourlyHeatmap(),
    segments: [
      { label: "Ingresos", value: current.ingresos, percent: 100 },
      { label: "Costos", value: current.costos, percent: current.ingresos > 0 ? roundMoney((current.costos / current.ingresos) * 100) : 0 },
      { label: "Gastos", value: current.gastos, percent: current.ingresos > 0 ? roundMoney((current.gastos / current.ingresos) * 100) : 0 },
    ].filter((s) => s.value > 0),
    rankings: [],
    unavailable: from && to ? ["Evolución diaria de rentabilidad"] : [],
  }
}

function buildProductsSection(sales: OperationSaleRow[]): StatisticsSectionData {
  const productTotals = new Map<string, number>()
  const productQty = new Map<string, number>()
  for (const sale of sales) {
    for (const item of sale.lineItems) {
      const name = item.nameSnapshot.trim() || "Sin nombre"
      productTotals.set(name, (productTotals.get(name) ?? 0) + item.lineTotal)
      productQty.set(name, (productQty.get(name) ?? 0) + item.quantity)
    }
  }

  return {
    sectionId: "products",
    title: "Productos / Rubros",
    description: "Facturación y cantidad por producto",
    comparison: [
      compareMetric(
        "products",
        "Productos distintos",
        productTotals.size,
        0,
        "number",
      ),
      compareMetric(
        "revenue",
        "Facturación productos",
        roundMoney([...productTotals.values()].reduce((a, b) => a + b, 0)),
        0,
        "money",
      ),
    ],
    evolution: [],
    hourlyEvolution: [],
    hourlyHeatmap: emptyHourlyHeatmap(),
    segments: buildSegments(productTotals, 6),
    rankings: buildRankings(productTotals, productQty),
    unavailable: ["Rubros / categorías", "Rentabilidad por producto"],
  }
}

function buildChannelsSection(
  sales: OperationSaleRow[],
  prevSales: OperationSaleRow[],
  from: string | null,
  to: string | null,
  compareEnabled: boolean,
  timeZone: string,
  operationalDayCloseTime: string,
): StatisticsSectionData {
  const channelTotals = new Map<string, number>()
  const prevChannelTotals = new Map<string, number>()
  for (const sale of sales) {
    const label = saleChannelLabel(sale.saleChannel)
    channelTotals.set(
      label,
      (channelTotals.get(label) ?? 0) + displayOperationSaleCollected(sale),
    )
  }
  if (compareEnabled) {
    for (const sale of prevSales) {
      const label = saleChannelLabel(sale.saleChannel)
      prevChannelTotals.set(
        label,
        (prevChannelTotals.get(label) ?? 0) + displayOperationSaleCollected(sale),
      )
    }
  }

  const total = salesTotal(sales)
  const segments = buildSegments(channelTotals)
  const comparison: StatisticsCompareMetric[] = segments.map((seg) =>
    compareMetric(
      seg.label,
      seg.label,
      seg.value,
      prevChannelTotals.get(seg.label) ?? 0,
      "money",
    ),
  )

  return {
    sectionId: "channels",
    title: "Canales de venta",
    description: "Participación y evolución por canal",
    comparison,
    evolution: buildDailyEvolution(
      sales,
      from,
      to,
      salesTotal,
      timeZone,
      operationalDayCloseTime,
    ),
    ...buildHourlySalesViews(
      sales,
      from,
      to,
      timeZone,
      operationalDayCloseTime,
      salesTotal,
    ),
    segments,
    rankings: buildRankings(channelTotals),
    unavailable: ["Servicios como canal"],
  }
}

function buildPurchasesEvolution(
  purchases: OperationPurchaseRow[],
  from: string | null,
  to: string | null,
): StatisticsEvolutionPoint[] {
  const buckets = new Map<string, number>()
  for (const purchase of purchases) {
    const day = purchase.operationDate.slice(0, 10)
    buckets.set(
      day,
      (buckets.get(day) ?? 0) + sumPurchasesReportPaid([purchase]),
    )
  }

  if (!from || !to) {
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, value]) => ({
        label: `${day.slice(8, 10)}/${day.slice(5, 7)}`,
        value: roundMoney(value),
      }))
  }

  const start = new Date(
    Number(from.slice(0, 4)),
    Number(from.slice(5, 7)) - 1,
    Number(from.slice(8, 10)),
  )
  const end = new Date(
    Number(to.slice(0, 4)),
    Number(to.slice(5, 7)) - 1,
    Number(to.slice(8, 10)),
  )
  const points: StatisticsEvolutionPoint[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`
    points.push({
      label: `${String(cursor.getDate()).padStart(2, "0")}/${String(cursor.getMonth() + 1).padStart(2, "0")}`,
      value: roundMoney(buckets.get(iso) ?? 0),
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return points
}

function buildPurchasesSection(
  purchases: OperationPurchaseRow[],
  prevPurchases: OperationPurchaseRow[],
  from: string | null,
  to: string | null,
  compareEnabled: boolean,
): StatisticsSectionData {
  const total = sumPurchasesReportPaid(purchases)
  const prevTotal = compareEnabled ? sumPurchasesReportPaid(prevPurchases) : 0
  const supplierTotals = new Map<string, number>()
  for (const purchase of purchases) {
    supplierTotals.set(
      purchase.supplierName,
      (supplierTotals.get(purchase.supplierName) ?? 0) +
        sumPurchasesReportPaid([purchase]),
    )
  }

  return {
    sectionId: "purchases",
    title: "Compras",
    description: "Evolución e importes por proveedor",
    comparison: [
      compareMetric("total", "Compras", total, prevTotal, "money"),
      compareMetric("count", "Operaciones", purchases.length, compareEnabled ? prevPurchases.length : 0, "number"),
    ],
    evolution: buildPurchasesEvolution(purchases, from, to),
    hourlyEvolution: [],
    hourlyHeatmap: emptyHourlyHeatmap(),
    segments: buildSegments(supplierTotals, 6),
    rankings: buildRankings(supplierTotals),
    unavailable: ["Compras por categoría / producto"],
  }
}

function buildClientsSection(
  sales: OperationSaleRow[],
  prevSales: OperationSaleRow[],
  compareEnabled: boolean,
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
): StatisticsSectionData {
  const clientTotals = new Map<string, number>()
  const clientIds = new Set<string>()
  const prevClientIds = new Set<string>()

  for (const sale of sales) {
    const key = sale.customerName?.trim() || "Consumidor final"
    clientTotals.set(
      key,
      (clientTotals.get(key) ?? 0) + displayOperationSaleCollected(sale),
    )
    if (sale.clientId) clientIds.add(sale.clientId)
  }
  for (const sale of prevSales) {
    if (sale.clientId) prevClientIds.add(sale.clientId)
  }

  let newClients = 0
  if (compareEnabled) {
    for (const id of clientIds) {
      if (!prevClientIds.has(id)) newClients += 1
    }
  }

  const recurring = [...clientIds].filter((id) => prevClientIds.has(id)).length

  return {
    sectionId: "clients",
    title: "Clientes",
    description: "Nuevos, recurrentes y facturación por cliente",
    comparison: [
      compareMetric("clients", "Clientes activos", clientIds.size, compareEnabled ? prevClientIds.size : 0, "number"),
      compareMetric("new", "Clientes nuevos", newClients, 0, "number"),
      compareMetric("recurring", "Recurrentes", recurring, 0, "number"),
      compareMetric(
        "ticket",
        "Ticket promedio",
        avgTicket(sales),
        compareEnabled ? avgTicket(prevSales) : 0,
        "money",
      ),
    ],
    evolution: [],
    ...buildHourlySalesViews(
      sales,
      from,
      to,
      timeZone,
      operationalDayCloseTime,
      salesTotal,
    ),
    segments: buildSegments(clientTotals, 6),
    rankings: buildRankings(clientTotals),
    unavailable: ["Frecuencia de compra detallada"],
  }
}

function buildFinanceSection(
  sales: OperationSaleRow[],
  purchases: OperationPurchaseRow[],
  expenses: OperationExpenseLedgerRow[],
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
): StatisticsSectionData {
  const ingresos = salesTotal(sales)
  const egresos = roundMoney(
    sumPurchasesReportPaid(purchases) + sumExpensesReportAmount(expenses),
  )

  const paymentTotals = new Map<string, number>()
  for (const sale of sales) {
    for (const payment of sale.payments) {
      paymentTotals.set(
        payment.methodName,
        (paymentTotals.get(payment.methodName) ?? 0) + payment.amount,
      )
    }
  }

  const dailyIn = buildDailyEvolution(
    sales,
    from,
    to,
    salesTotal,
    timeZone,
    operationalDayCloseTime,
  )
  const purchaseByDay = new Map<string, number>()
  for (const p of purchases) {
    const day = p.operationDate.slice(0, 10)
    purchaseByDay.set(day, (purchaseByDay.get(day) ?? 0) + sumPurchasesReportPaid([p]))
  }
  const expenseByDay = new Map<string, number>()
  for (const e of expenses) {
    const day = e.operationDate.slice(0, 10)
    expenseByDay.set(day, (expenseByDay.get(day) ?? 0) + e.amount)
  }

  const evolution = dailyIn.map((point, i) => {
    const iso = from
      ? (() => {
          const start = new Date(
            Number(from.slice(0, 4)),
            Number(from.slice(5, 7)) - 1,
            Number(from.slice(8, 10)),
          )
          start.setDate(start.getDate() + i)
          return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`
        })()
      : ""
    const out = iso
      ? roundMoney((purchaseByDay.get(iso) ?? 0) + (expenseByDay.get(iso) ?? 0))
      : 0
    return { label: point.label, value: roundMoney(point.value - out) }
  })

  return {
    sectionId: "finance",
    title: "Finanzas",
    description: "Ingresos, egresos y medios de pago",
    comparison: [
      compareMetric("in", "Ingresos", ingresos, 0, "money"),
      compareMetric("out", "Egresos", egresos, 0, "money"),
      compareMetric("net", "Neto", roundMoney(ingresos - egresos), 0, "money"),
    ],
    evolution,
    ...buildHourlySalesViews(
      sales,
      from,
      to,
      timeZone,
      operationalDayCloseTime,
      salesTotal,
    ),
    segments: buildSegments(paymentTotals, 8),
    rankings: buildRankings(paymentTotals),
    unavailable: [
      "Cuentas por cobrar / pagar",
      "Cobranzas y pagos pendientes",
    ],
  }
}

async function buildInventorySection(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<StatisticsSectionData> {
  const supabase = await createClient()
  const { data: movements } = await supabase
    .from("inventory_movements")
    .select("article_id, quantity_delta, created_at, articles(name)")
    .eq("pop_id", popId)

  const articleMovement = new Map<string, { qty: number; name: string }>()
  let movementCount = 0

  for (const mv of movements ?? []) {
    const createdAt = String(mv.created_at ?? "")
    const day = createdAt.slice(0, 10)
    if (from && day < from) continue
    if (to && day > to) continue
    movementCount += 1
    const article = mv.articles as { name?: string } | null
    const name = article?.name?.trim() || "Artículo"
    const id = String(mv.article_id)
    const prev = articleMovement.get(id) ?? { qty: 0, name }
    prev.qty += Math.abs(Number(mv.quantity_delta ?? 0))
    articleMovement.set(id, prev)
  }

  const rankMap = new Map<string, number>()
  for (const { name, qty } of articleMovement.values()) {
    rankMap.set(name, (rankMap.get(name) ?? 0) + qty)
  }

  return {
    sectionId: "inventory",
    title: "Inventario",
    description: "Movimiento y artículos con mayor rotación",
    comparison: [
      compareMetric("movements", "Movimientos", movementCount, 0, "number"),
      compareMetric("articles", "Artículos movidos", rankMap.size, 0, "number"),
    ],
    evolution: [],
    hourlyEvolution: [],
    hourlyHeatmap: emptyHourlyHeatmap(),
    segments: buildSegments(rankMap, 6),
    rankings: buildRankings(rankMap),
    unavailable: [
      "Valorización histórica",
      "Rotación en días",
      "Stock al cierre del período",
    ],
  }
}

function buildPlaceholderSection(
  sectionId: StatisticsSectionId,
): StatisticsSectionData {
  const meta = statisticsSectionById(sectionId)
  const unavailableBySection: Partial<Record<StatisticsSectionId, string[]>> = {
    services: [
      "Servicios vendidos",
      "Servicios activos / vencidos",
      "Tipos de servicio",
      "Evolución de facturación",
    ],
    manufacturing: [
      "Cantidad fabricada",
      "Costos de producción",
      "Consumo de insumos",
      "Órdenes por producto",
    ],
  }

  return {
    sectionId,
    title: meta?.label ?? sectionId,
    description: meta?.description ?? "",
    comparison: [],
    evolution: [],
    hourlyEvolution: [],
    hourlyHeatmap: emptyHourlyHeatmap(),
    segments: [],
    rankings: [],
    unavailable: unavailableBySection[sectionId] ?? ["Datos no disponibles"],
  }
}

export async function getStatisticsSectionData(
  input: StatisticsQueryInput,
): Promise<
  | { success: true; data: StatisticsSectionData }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(input.popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const { popId, sectionId, from, to, compareEnabled, filters, preset } = input
    const prevBounds = computePreviousSummaryDateBounds(preset, { from, to })

    if (sectionId === "services" || sectionId === "manufacturing") {
      return { success: true, data: buildPlaceholderSection(sectionId) }
    }

    const supabase = await createClient()
    const { timeZone, operationalDayCloseTime } =
      await loadPopOperationalContext(supabase, popId)

    const salesFetchBounds = expandCalendarBoundsForOperationalFetch(from, to)
    const prevSalesFetchBounds = expandCalendarBoundsForOperationalFetch(
      prevBounds.from,
      prevBounds.to,
    )

    const [sales, prevSales, purchases, prevPurchases, expenses, income, prevIncome] =
      await Promise.all([
        fetchAllSales(popId, salesFetchBounds.from, salesFetchBounds.to),
        compareEnabled
          ? fetchAllSales(
              popId,
              prevSalesFetchBounds.from,
              prevSalesFetchBounds.to,
            )
          : Promise.resolve([] as OperationSaleRow[]),
        sectionId === "purchases" ||
        sectionId === "finance" ||
        sectionId === "profitability"
          ? fetchAllPurchases(popId, from, to)
          : Promise.resolve([] as OperationPurchaseRow[]),
        compareEnabled &&
        (sectionId === "purchases" || sectionId === "finance")
          ? fetchAllPurchases(popId, prevBounds.from, prevBounds.to)
          : Promise.resolve([] as OperationPurchaseRow[]),
        sectionId === "finance"
          ? fetchAllExpenses(popId, from, to)
          : Promise.resolve([] as OperationExpenseLedgerRow[]),
        sectionId === "profitability"
          ? fetchIncomeTotals(popId, from, to)
          : Promise.resolve({ ingresos: 0, costos: 0, gastos: 0, resultado: 0, margen: 0 }),
        compareEnabled && sectionId === "profitability"
          ? fetchIncomeTotals(popId, prevBounds.from, prevBounds.to)
          : Promise.resolve({ ingresos: 0, costos: 0, gastos: 0, resultado: 0, margen: 0 }),
      ])

    const filteredSales = filterSalesByOperationalPeriod(
      filterSales(sales, filters),
      from,
      to,
      timeZone,
      operationalDayCloseTime,
    )
    const filteredPrevSales = filterSalesByOperationalPeriod(
      filterSales(prevSales, filters),
      prevBounds.from,
      prevBounds.to,
      timeZone,
      operationalDayCloseTime,
    )
    const filteredPurchases = filterPurchases(purchases, filters)

    let data: StatisticsSectionData
    switch (sectionId) {
      case "sales":
        data = buildSalesSection(
          filteredSales,
          filteredPrevSales,
          from,
          to,
          compareEnabled,
          timeZone,
          operationalDayCloseTime,
        )
        break
      case "profitability":
        data = buildProfitabilitySection(
          income,
          prevIncome,
          compareEnabled,
          from,
          to,
        )
        break
      case "products":
        data = buildProductsSection(
          filterSalesByOperationalPeriod(
            filterSales(sales, filters),
            from,
            to,
            timeZone,
            operationalDayCloseTime,
          ),
        )
        break
      case "channels":
        data = buildChannelsSection(
          filteredSales,
          filteredPrevSales,
          from,
          to,
          compareEnabled,
          timeZone,
          operationalDayCloseTime,
        )
        break
      case "purchases":
        data = buildPurchasesSection(
          filteredPurchases,
          filterPurchases(prevPurchases, filters),
          from,
          to,
          compareEnabled,
        )
        break
      case "clients":
        data = buildClientsSection(
          filteredSales,
          filteredPrevSales,
          compareEnabled,
          from,
          to,
          timeZone,
          operationalDayCloseTime,
        )
        break
      case "finance":
        data = buildFinanceSection(
          filteredSales,
          filteredPurchases,
          expenses,
          from,
          to,
          timeZone,
          operationalDayCloseTime,
        )
        break
      case "inventory":
        data = await buildInventorySection(popId, from, to)
        break
      default:
        data = buildPlaceholderSection(sectionId)
    }

    return { success: true, data }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
