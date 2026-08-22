"use server"

import { fetchAccountingIncomeStatementServer as getAccountingIncomeStatement } from "@/lib/rootsyApi/reportsServer"
import type {
  OperationExpenseLedgerRow,
  OperationPurchaseLineItem,
  OperationPurchaseRow,
  OperationSaleLineItem,
  OperationSaleRow,
} from "@/app/[siteId]/[popId]/operations/actions"
import { fetchPopOperationsListServer } from "@/lib/rootsyApi/operationsServer"
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
  filterPurchasesByOperationalPeriod,
  isOperationalDayInRange,
  operationalDayKey,
  operationalHourSlotIndex,
  operationalHourSlotLabel,
} from "@/lib/popOperationalDay"
import { addCalendarDays } from "@/lib/entryDateTimezone"
import {
  ARTICLE_ITEM_KINDS,
  isArticleItemKind,
  type ArticleItemKind,
  ARTICLE_ITEM_KIND_STOCK_LABEL,
} from "@/lib/articleItemKind"
import {
  fetchCatalogReferenceUnitCostsByArticleId,
  fetchLatestLayerUnitCostsByArticleId,
  resolveArticleReferenceUnitCostsByArticleId,
} from "@/lib/articleReferenceUnitCost"
import { getTreasuryPeriodReport } from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import {
  CHART_CUENTAS_POR_COBRAR_CODES,
  CHART_DOCUMENTOS_A_PAGAR_CODES,
  CHART_DOCUMENTOS_POR_COBRAR_CODES,
  CHART_PROVEEDORES_CC_CODES,
} from "@/lib/argV3DefaultChartAccounts"
import { isMotherTreasuryAccount } from "@/lib/treasuryAccountKinds"
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
  hint?: string
}

export type StatisticsEvolutionPoint = {
  label: string
  value: number
  count?: number
  profit?: number
}

export type StatisticsEvolutionDualSeries = {
  primaryLabel: string
  secondaryLabel: string
  secondaryFormat: "number" | "percent" | "money"
  tertiaryLabel?: string
}

export type StatisticsWaterfallStep = {
  id: string
  label: string
  kind: "increase" | "decrease" | "subtotal" | "total"
  amount: number
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
  id?: string
}

export type StatisticsRankRow = {
  rank: number
  id?: string
  label: string
  value: number
  secondaryLabel?: string
  secondaryValue?: number
  secondaryFormat?: "money" | "number"
}

export type StatisticsProductTrendOption = {
  key: string
  label: string
}

export type StatisticsSunburstNode = {
  id: string
  label: string
  value: number
  children?: StatisticsSunburstNode[]
}

export type StatisticsSectionData = {
  sectionId: StatisticsSectionId
  title: string
  description: string
  operationalDayCloseTime?: string
  comparison: StatisticsCompareMetric[]
  evolution: StatisticsEvolutionPoint[]
  hourlyEvolution: StatisticsEvolutionPoint[]
  hourlyHeatmap: StatisticsHourlyHeatmap
  segments: StatisticsSegment[]
  rankings: StatisticsRankRow[]
  productSalesRankings?: StatisticsRankRow[]
  productTrendOptions?: StatisticsProductTrendOption[]
  productTrendByKey?: Record<string, StatisticsEvolutionPoint[]>
  defaultProductTrendKey?: string | null
  resultWaterfall?: StatisticsWaterfallStep[]
  costDistribution?: StatisticsSegment[]
  purchaseDistribution?: StatisticsSegment[]
  categoryProfitDistribution?: StatisticsSegment[]
  categorySalesDistribution?: StatisticsSegment[]
  categoryTrendOptions?: StatisticsProductTrendOption[]
  categoryTrendByKey?: Record<string, StatisticsEvolutionPoint[]>
  defaultCategoryTrendKey?: string | null
  stockLevelDistribution?: StatisticsSegment[]
  inventoryValueSunburst?: StatisticsSunburstNode | null
  clientTrendOptions?: StatisticsProductTrendOption[]
  clientTrendByKey?: Record<string, StatisticsEvolutionPoint[]>
  defaultClientTrendKey?: string | null
  clientTopArticlesByKey?: Record<string, StatisticsRankRow[]>
  clientTopCategoriesByKey?: Record<string, StatisticsRankRow[]>
  supplierTrendOptions?: StatisticsProductTrendOption[]
  supplierTrendByKey?: Record<string, StatisticsEvolutionPoint[]>
  defaultSupplierTrendKey?: string | null
  supplierTopArticlesByKey?: Record<string, StatisticsRankRow[]>
  supplierTopCategoriesByKey?: Record<string, StatisticsRankRow[]>
  efficiencyRatios?: StatisticsCompareMetric[]
  commitmentMetrics?: StatisticsCompareMetric[]
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

function ratioOverSales(value: number, ingresos: number): number {
  return ingresos > 0 ? roundMoney((value / ingresos) * 100) : 0
}

function comparePercentMetric(
  id: string,
  label: string,
  value: number,
  previousValue: number,
  compareEnabled: boolean,
): StatisticsCompareMetric {
  let deltaPoints: number | null = null
  if (compareEnabled) {
    if (previousValue !== 0) {
      deltaPoints = roundMoney(value - previousValue)
    } else if (value === 0) {
      deltaPoints = 0
    }
  }

  return compareMetric(
    id,
    label,
    value,
    previousValue,
    "percent",
    deltaPoints,
  )
}

function compareMetric(
  id: string,
  label: string,
  value: number,
  previousValue: number,
  format: StatisticsCompareMetric["format"],
  deltaPoints: number | null = null,
  hint?: string,
): StatisticsCompareMetric {
  return {
    id,
    label,
    value,
    previousValue,
    deltaPercent: summaryDeltaPercent(value, previousValue),
    deltaPoints,
    format,
    hint,
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

function avgPurchaseTicket(purchases: OperationPurchaseRow[]): number {
  if (purchases.length === 0) return 0
  return roundMoney(sumPurchasesReportPaid(purchases) / purchases.length)
}

function buildDailyEvolution(
  sales: OperationSaleRow[],
  from: string | null,
  to: string | null,
  valueFn: (daySales: OperationSaleRow[]) => number,
  timeZone: string,
  operationalDayCloseTime: string,
  countFn?: (daySales: OperationSaleRow[]) => number,
): StatisticsEvolutionPoint[] {
  const buckets = new Map<string, OperationSaleRow[]>()
  for (const sale of sales) {
    const day = operationalDayKey(sale.soldAt, timeZone, operationalDayCloseTime)
    const list = buckets.get(day) ?? []
    list.push(sale)
    buckets.set(day, list)
  }

  const toPoint = (day: string, daySales: OperationSaleRow[]): StatisticsEvolutionPoint => ({
    label: `${day.slice(8, 10)}/${day.slice(5, 7)}`,
    value: roundMoney(valueFn(daySales)),
    ...(countFn ? { count: countFn(daySales) } : {}),
  })

  if (!from || !to) {
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, daySales]) => toPoint(day, daySales))
  }

  const points: StatisticsEvolutionPoint[] = []
  let cursor = from
  while (cursor <= to) {
    points.push(toPoint(cursor, buckets.get(cursor) ?? []))
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

const HEATMAP_WEEKDAYS: StatisticsHourlyHeatmapDay[] = [
  { key: "1", label: "Lun" },
  { key: "2", label: "Mar" },
  { key: "3", label: "Mié" },
  { key: "4", label: "Jue" },
  { key: "5", label: "Vie" },
  { key: "6", label: "Sáb" },
  { key: "7", label: "Dom" },
]

/** ISO weekday 1 = lunes … 7 = domingo, desde YYYY-MM-DD. */
function isoWeekdayFromOperationalDate(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  const jsDay = utc.getUTCDay()
  return jsDay === 0 ? 7 : jsDay
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
  const weekdayOccurrences = new Map<string, number>()

  for (const sale of sales) {
    const day = operationalDayKey(sale.soldAt, timeZone, operationalDayCloseTime)
    const weekday = isoWeekdayFromOperationalDate(day)
    const slot = operationalHourSlotIndex(
      sale.soldAt,
      timeZone,
      operationalDayCloseTime,
    )
    const key = `${weekday}|${slot}`
    const list = buckets.get(key) ?? []
    list.push(sale)
    buckets.set(key, list)
  }

  if (from && to) {
    let cursor = from
    while (cursor <= to) {
      const weekday = String(isoWeekdayFromOperationalDate(cursor))
      weekdayOccurrences.set(
        weekday,
        (weekdayOccurrences.get(weekday) ?? 0) + 1,
      )
      cursor = addCalendarDays(cursor, 1)
    }
  } else {
    const seenDays = new Set<string>()
    for (const sale of sales) {
      const day = operationalDayKey(sale.soldAt, timeZone, operationalDayCloseTime)
      if (seenDays.has(day)) continue
      seenDays.add(day)
      const weekday = String(isoWeekdayFromOperationalDate(day))
      weekdayOccurrences.set(
        weekday,
        (weekdayOccurrences.get(weekday) ?? 0) + 1,
      )
    }
  }

  const days = HEATMAP_WEEKDAYS
  const hours = Array.from({ length: 24 }, (_, slot) => ({
    slot,
    label: operationalHourSlotLabel(slot, operationalDayCloseTime),
  }))

  const cells: StatisticsHourlyHeatmapCell[] = []
  let maxValue = 0
  for (const day of days) {
    const dayCount = weekdayOccurrences.get(day.key) ?? 0
    for (const hour of hours) {
      const total = roundMoney(
        valueFn(buckets.get(`${day.key}|${hour.slot}`) ?? []),
      )
      const value =
        dayCount > 0 ? roundMoney(total / dayCount) : 0
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
    const res = await fetchPopOperationsListServer(popId, {
      view: "sales-report",
      dateFrom: from,
      dateTo: to,
      search: "",
      page,
      pageSize: 100,
      sort: "sold_at",
      ord: "desc",
      include: "full",
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
    const res = await fetchPopOperationsListServer(popId, {
      view: "purchases",
      dateFrom: from,
      dateTo: to,
      search: "",
      page,
      pageSize: 100,
      sort: "received_at",
      ord: "desc",
      include: "full",
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
    const res = await fetchPopOperationsListServer(popId, {
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

const JOURNAL_ENTRY_ID_CHUNK = 400

type DailyIncomeBucket = {
  ingresos: number
  costos: number
}

async function fetchDailyIncomeTotals(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<Map<string, DailyIncomeBucket>> {
  const buckets = new Map<string, DailyIncomeBucket>()
  const supabase = await createClient()

  let entQ = supabase
    .from("accounting_entries")
    .select("id, entry_date")
    .eq("pop_id", popId)
    .eq("status", "posted")
  if (from?.trim()) entQ = entQ.gte("entry_date", from.trim())
  if (to?.trim()) entQ = entQ.lte("entry_date", to.trim())

  const { data: entries, error: eErr } = await entQ
  if (eErr || !entries?.length) return buckets

  const entryDateById = new Map<string, string>()
  for (const entry of entries) {
    const id = String(entry.id)
    const date = String(entry.entry_date ?? "").slice(0, 10)
    if (date) entryDateById.set(id, date)
  }

  const entryIds = [...entryDateById.keys()]
  for (let i = 0; i < entryIds.length; i += JOURNAL_ENTRY_ID_CHUNK) {
    const chunk = entryIds.slice(i, i + JOURNAL_ENTRY_ID_CHUNK)
    const { data: lines, error: lErr } = await supabase
      .from("accounting_entry_lines")
      .select(
        `
        entry_id,
        debit_amount,
        credit_amount,
        accounting_chart_of_accounts ( account_type, nature )
      `,
      )
      .in("entry_id", chunk)
    if (lErr) continue

    for (const line of lines || []) {
      const entryId = String(line.entry_id)
      const day = entryDateById.get(entryId)
      if (!day) continue

      const account = line.accounting_chart_of_accounts as {
        account_type?: string
        nature?: string
      } | null
      const accountType = String(account?.account_type ?? "")
      if (accountType !== "ingresos" && accountType !== "costos") continue

      const debit = Number(line.debit_amount ?? 0)
      const credit = Number(line.credit_amount ?? 0)
      const nature = String(account?.nature ?? "deudora")
      const contribution =
        nature === "deudora"
          ? roundMoney(debit - credit)
          : roundMoney(credit - debit)

      const bucket = buckets.get(day) ?? { ingresos: 0, costos: 0 }
      if (accountType === "ingresos") {
        bucket.ingresos = roundMoney(bucket.ingresos + contribution)
      } else {
        bucket.costos = roundMoney(bucket.costos + contribution)
      }
      buckets.set(day, bucket)
    }
  }

  return buckets
}

function buildProfitabilityDailyEvolution(
  daily: Map<string, DailyIncomeBucket>,
  from: string | null,
  to: string | null,
): StatisticsEvolutionPoint[] {
  const toPoint = (day: string): StatisticsEvolutionPoint => {
    const bucket = daily.get(day) ?? { ingresos: 0, costos: 0 }
    const ganancia = roundMoney(bucket.ingresos - bucket.costos)
    const margen =
      bucket.ingresos > 0
        ? roundMoney((ganancia / bucket.ingresos) * 100)
        : 0
    return {
      label: `${day.slice(8, 10)}/${day.slice(5, 7)}`,
      value: ganancia,
      count: margen,
    }
  }

  if (!from || !to) {
    return [...daily.keys()]
      .sort((a, b) => a.localeCompare(b))
      .map((day) => toPoint(day))
  }

  const points: StatisticsEvolutionPoint[] = []
  let cursor = from
  while (cursor <= to) {
    points.push(toPoint(cursor))
    cursor = addCalendarDays(cursor, 1)
  }
  return points
}

const COST_KIND_LABELS: Record<ArticleItemKind, string> = {
  merchandise: "Mercaderías",
  raw_material: "Materias primas",
  supply: "Insumos",
}

function buildCostKindSegments(
  totals: Map<ArticleItemKind, number>,
): StatisticsSegment[] {
  const grand = ARTICLE_ITEM_KINDS.reduce(
    (acc, kind) => acc + (totals.get(kind) ?? 0),
    0,
  )
  if (grand <= 0) return []

  return ARTICLE_ITEM_KINDS.map((kind) => {
    const value = roundMoney(totals.get(kind) ?? 0)
    return {
      label: COST_KIND_LABELS[kind],
      value,
      percent: roundMoney((value / grand) * 100),
    }
  }).filter((segment) => segment.value > 0)
}

const ARTICLE_ID_CHUNK = 400

async function fetchArticleItemKindsById(
  popId: string,
  articleIds: string[],
): Promise<Map<string, ArticleItemKind>> {
  const kinds = new Map<string, ArticleItemKind>()
  if (!articleIds.length) return kinds

  const supabase = await createClient()
  for (let i = 0; i < articleIds.length; i += ARTICLE_ID_CHUNK) {
    const chunk = articleIds.slice(i, i + ARTICLE_ID_CHUNK)
    const { data, error } = await supabase
      .from("articles")
      .select("id, item_kind")
      .eq("pop_id", popId)
      .in("id", chunk)
    if (error) continue

    for (const row of data ?? []) {
      const kind = String(row.item_kind ?? "")
      if (isArticleItemKind(kind)) {
        kinds.set(String(row.id), kind)
      }
    }
  }

  return kinds
}

async function fetchArticleCategoriesById(
  popId: string,
  articleIds: string[],
): Promise<Map<string, { categoryId: string; categoryName: string }>> {
  const categories = new Map<string, { categoryId: string; categoryName: string }>()
  if (!articleIds.length) return categories

  const supabase = await createClient()
  for (let i = 0; i < articleIds.length; i += ARTICLE_ID_CHUNK) {
    const chunk = articleIds.slice(i, i + ARTICLE_ID_CHUNK)
    const { data, error } = await supabase
      .from("articles")
      .select("id, category_id, categories ( name )")
      .eq("pop_id", popId)
      .in("id", chunk)
    if (error) continue

    for (const row of data ?? []) {
      const cat = row.categories as { name?: string } | null
      categories.set(String(row.id), {
        categoryId: String(row.category_id ?? ""),
        categoryName: cat?.name?.trim() || "Sin categoría",
      })
    }
  }

  return categories
}

async function fetchRecipeCategoriesById(
  popId: string,
  recipeIds: string[],
): Promise<Map<string, { categoryId: string; categoryName: string }>> {
  const categories = new Map<string, { categoryId: string; categoryName: string }>()
  if (!recipeIds.length) return categories

  const supabase = await createClient()
  for (let i = 0; i < recipeIds.length; i += ARTICLE_ID_CHUNK) {
    const chunk = recipeIds.slice(i, i + ARTICLE_ID_CHUNK)
    const { data, error } = await supabase
      .from("recipes")
      .select("id, category_id, recipe_categories ( name )")
      .eq("pop_id", popId)
      .in("id", chunk)
    if (error) continue

    for (const row of data ?? []) {
      const cat = row.recipe_categories as { name?: string } | null
      categories.set(String(row.id), {
        categoryId: String(row.category_id ?? ""),
        categoryName: cat?.name?.trim() || "Sin categoría",
      })
    }
  }

  return categories
}

async function fetchRecipeUnitCostsById(
  popId: string,
  recipeIds: string[],
): Promise<Map<string, number>> {
  const costs = new Map<string, number>()
  if (!recipeIds.length) return costs

  const supabase = await createClient()
  for (let i = 0; i < recipeIds.length; i += ARTICLE_ID_CHUNK) {
    const chunk = recipeIds.slice(i, i + ARTICLE_ID_CHUNK)
    const { data, error } = await supabase
      .from("recipes")
      .select("id, cost_price")
      .eq("pop_id", popId)
      .in("id", chunk)
    if (error) continue

    for (const row of data ?? []) {
      const unitCost = Number(row.cost_price ?? 0)
      if (Number.isFinite(unitCost) && unitCost > 0) {
        costs.set(String(row.id), roundMoney(unitCost))
      }
    }
  }

  return costs
}

async function applyRecipeCostsToBuckets(
  popId: string,
  buckets: Map<string, ProductStatsBucket>,
): Promise<void> {
  const recipeIds = [
    ...new Set(
      [...buckets.values()]
        .map((bucket) => bucket.recipeId)
        .filter((id): id is string => Boolean(id)),
    ),
  ]
  if (!recipeIds.length) return

  const unitCosts = await fetchRecipeUnitCostsById(popId, recipeIds)
  for (const bucket of buckets.values()) {
    if (!bucket.recipeId || bucket.cost > 0) continue
    const unitCost = unitCosts.get(bucket.recipeId) ?? 0
    if (unitCost > 0) {
      bucket.cost = roundMoney(unitCost * bucket.quantity)
    }
  }
}

const PROMOTION_CATEGORY_KEY = "promotion:all"
const PROMOTION_CATEGORY_LABEL = "Promociones"

type ProductStatsBucket = {
  label: string
  articleId: string | null
  recipeId: string | null
  promotionId: string | null
  lineKind: OperationSaleLineItem["lineKind"]
  revenue: number
  cost: number
  quantity: number
}

function saleLineProductKey(item: OperationSaleLineItem): string {
  if (item.articleId) return `a:${item.articleId}`
  if (item.recipeId) return `r:${item.recipeId}`
  if (item.promotionId) return `p:${item.promotionId}`
  const name = item.nameSnapshot.trim().toLowerCase() || "sin-nombre"
  return `n:${name}`
}

type ProductLineKindCounts = {
  articles: number
  promotions: number
  recipes: number
}

function sumProductQuantitiesByKind(sales: OperationSaleRow[]): ProductLineKindCounts {
  const totals = { articles: 0, promotions: 0, recipes: 0 }

  for (const sale of sales) {
    for (const item of sale.lineItems) {
      if (item.lineTotal <= 0 && item.quantity <= 0) continue

      if (item.promotionId || item.lineKind === "promotion") {
        totals.promotions += item.quantity
      } else if (item.recipeId || item.lineKind === "recipe") {
        totals.recipes += item.quantity
      } else {
        totals.articles += item.quantity
      }
    }
  }

  return {
    articles: roundMoney(totals.articles),
    promotions: roundMoney(totals.promotions),
    recipes: roundMoney(totals.recipes),
  }
}

function accumulateProductBucketsFromSales(
  sales: OperationSaleRow[],
  buckets: Map<string, ProductStatsBucket>,
): void {
  for (const sale of sales) {
    for (const item of sale.lineItems) {
      if (item.lineTotal <= 0 && item.quantity <= 0) continue
      const key = saleLineProductKey(item)
      const prev = buckets.get(key)
      const label = item.nameSnapshot.trim() || "Sin nombre"
      buckets.set(key, {
        label: prev?.label ?? label,
        articleId: item.articleId ?? prev?.articleId ?? null,
        recipeId: item.recipeId ?? prev?.recipeId ?? null,
        promotionId: item.promotionId ?? prev?.promotionId ?? null,
        lineKind: item.lineKind ?? prev?.lineKind ?? null,
        revenue: roundMoney((prev?.revenue ?? 0) + item.lineTotal),
        cost: prev?.cost ?? 0,
        quantity: roundMoney((prev?.quantity ?? 0) + item.quantity),
      })
    }
  }
}

function applyArticleCostsToBuckets(
  buckets: Map<string, ProductStatsBucket>,
  articleCosts: Map<string, number>,
): void {
  for (const bucket of buckets.values()) {
    if (!bucket.articleId) continue
    const cost = articleCosts.get(bucket.articleId)
    if (cost != null && cost > 0) {
      bucket.cost = cost
    }
  }
}

async function estimateMissingProductCosts(
  popId: string,
  buckets: Map<string, ProductStatsBucket>,
): Promise<void> {
  const needsEstimate = [...buckets.values()].filter(
    (b) => b.articleId && b.cost <= 0 && b.quantity > 0,
  )
  if (!needsEstimate.length) return

  const supabase = await createClient()
  const articleIds = [...new Set(needsEstimate.map((b) => b.articleId!))]
  const layerCosts = await fetchLatestLayerUnitCostsByArticleId(
    supabase,
    popId,
    articleIds,
  )
  const missingIds = articleIds.filter((id) => !layerCosts.has(id))
  const catalogCosts =
    missingIds.length > 0
      ? await fetchCatalogReferenceUnitCostsByArticleId(
          supabase,
          popId,
          missingIds,
        )
      : new Map<string, number>()

  for (const bucket of needsEstimate) {
    const unitCost =
      layerCosts.get(bucket.articleId!) ??
      catalogCosts.get(bucket.articleId!) ??
      0
    if (unitCost > 0) {
      bucket.cost = roundMoney(unitCost * bucket.quantity)
    }
  }
}

async function fetchSaleArticleCostsForPeriod(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<Map<string, number>> {
  const supabase = await createClient()
  const costs = new Map<string, number>()
  const movementIdsWithAlloc = new Set<string>()

  const { data: allocRows, error: allocErr } = await supabase
    .from("inventory_layer_allocations")
    .select(
      `
      quantity,
      unit_cost,
      inventory_movement_id,
      inventory_movements (
        movement_type,
        article_id,
        sale_id,
        sales ( sold_at, status )
      )
    `,
    )
    .eq("pop_id", popId)

  if (allocErr) return costs

  for (const row of allocRows ?? []) {
    const movement = row.inventory_movements as {
      movement_type?: string
      article_id?: string
      sale_id?: string | null
      sales?: { sold_at?: string; status?: string } | null
    } | null
    if (movement?.movement_type !== "sale" || !movement.sale_id) continue

    const sale = movement.sales
    if (!sale || sale.status === "cancelled") continue
    const soldDay = String(sale.sold_at ?? "").slice(0, 10)
    if (from && soldDay < from) continue
    if (to && soldDay > to) continue

    const articleId = String(movement.article_id ?? "")
    if (!articleId) continue

    movementIdsWithAlloc.add(String(row.inventory_movement_id))
    const lineCost = roundMoney(
      Math.abs(Number(row.quantity ?? 0)) * Math.abs(Number(row.unit_cost ?? 0)),
    )
    costs.set(articleId, roundMoney((costs.get(articleId) ?? 0) + lineCost))
  }

  const fallbackArticleIds = new Set<string>()
  const fallbackRows: Array<{ articleId: string; qty: number }> = []

  const { data: movementRows, error: movementErr } = await supabase
    .from("inventory_movements")
    .select(
      `
      id,
      quantity_delta,
      article_id,
      sales ( sold_at, status )
    `,
    )
    .eq("pop_id", popId)
    .eq("movement_type", "sale")
    .not("sale_id", "is", null)

  if (!movementErr) {
    for (const row of movementRows ?? []) {
      const movementId = String(row.id)
      if (movementIdsWithAlloc.has(movementId)) continue

      const sale = row.sales as { sold_at?: string; status?: string } | null
      if (!sale || sale.status === "cancelled") continue
      const soldDay = String(sale.sold_at ?? "").slice(0, 10)
      if (from && soldDay < from) continue
      if (to && soldDay > to) continue

      const articleId = String(row.article_id ?? "")
      if (!articleId) continue

      const qty = Math.abs(Number(row.quantity_delta ?? 0))
      if (qty <= 0) continue

      fallbackArticleIds.add(articleId)
      fallbackRows.push({ articleId, qty })
    }
  }

  if (fallbackRows.length > 0) {
    const articleIds = [...fallbackArticleIds]
    const layerCosts = await fetchLatestLayerUnitCostsByArticleId(
      supabase,
      popId,
      articleIds,
    )
    const missingIds = articleIds.filter((id) => !layerCosts.has(id))
    const catalogCosts =
      missingIds.length > 0
        ? await fetchCatalogReferenceUnitCostsByArticleId(
            supabase,
            popId,
            missingIds,
          )
        : new Map<string, number>()

    for (const row of fallbackRows) {
      const unitCost =
        layerCosts.get(row.articleId) ?? catalogCosts.get(row.articleId) ?? 0
      if (unitCost <= 0) continue
      costs.set(
        row.articleId,
        roundMoney((costs.get(row.articleId) ?? 0) + roundMoney(row.qty * unitCost)),
      )
    }
  }

  return costs
}

function sumProductBucketRevenue(buckets: Map<string, ProductStatsBucket>): number {
  return roundMoney(
    [...buckets.values()].reduce((acc, bucket) => acc + bucket.revenue, 0),
  )
}

function buildProductProfitRankings(
  buckets: Map<string, ProductStatsBucket>,
  limit = 10,
): StatisticsRankRow[] {
  return [...buckets.entries()]
    .map(([key, bucket]) => ({
      key,
      label: bucket.label,
      value: roundMoney(bucket.revenue - bucket.cost),
      quantity: bucket.quantity,
    }))
    .filter((row) => row.value !== 0 || row.quantity > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((row, index) => ({
      rank: index + 1,
      id: row.key,
      label: row.label,
      value: row.value,
      secondaryLabel: "Cantidad",
      secondaryValue: row.quantity,
    }))
}

function buildProductSalesShareRankings(
  buckets: Map<string, ProductStatsBucket>,
  limit = 10,
): StatisticsRankRow[] {
  const totalRevenue = sumProductBucketRevenue(buckets)
  if (totalRevenue <= 0) return []

  return [...buckets.entries()]
    .map(([key, bucket]) => ({
      key,
      label: bucket.label,
      percent: roundMoney((bucket.revenue / totalRevenue) * 100),
      revenue: bucket.revenue,
    }))
    .filter((row) => row.percent > 0 || row.revenue > 0)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, limit)
    .map((row, index) => ({
      rank: index + 1,
      id: row.key,
      label: row.label,
      value: row.percent,
      secondaryLabel: "Ventas",
      secondaryValue: row.revenue,
      secondaryFormat: "money" as const,
    }))
}

function buildProductTrendOptions(
  buckets: Map<string, ProductStatsBucket>,
): StatisticsProductTrendOption[] {
  return [...buckets.entries()]
    .map(([key, bucket]) => ({ key, label: bucket.label }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"))
}

function buildProductDailyTrendPoints(
  metricsByDay: Map<string, { quantity: number; revenue: number; cost: number }>,
  from: string | null,
  to: string | null,
): StatisticsEvolutionPoint[] {
  const toPoint = (day: string): StatisticsEvolutionPoint => {
    const metrics = metricsByDay.get(day) ?? {
      quantity: 0,
      revenue: 0,
      cost: 0,
    }
    const revenue = roundMoney(metrics.revenue)
    const cost = roundMoney(metrics.cost)
    return {
      label: `${day.slice(8, 10)}/${day.slice(5, 7)}`,
      value: revenue,
      count: roundMoney(metrics.quantity),
      profit: roundMoney(revenue - cost),
    }
  }

  if (!from || !to) {
    return [...metricsByDay.keys()]
      .sort((a, b) => a.localeCompare(b))
      .map(toPoint)
  }

  const points: StatisticsEvolutionPoint[] = []
  let cursor = from
  while (cursor <= to) {
    points.push(toPoint(cursor))
    cursor = addCalendarDays(cursor, 1)
  }
  return points
}

function buildProductCostRatioByKey(
  buckets: Map<string, ProductStatsBucket>,
): Map<string, number> {
  const ratios = new Map<string, number>()
  for (const [key, bucket] of buckets) {
    ratios.set(key, bucket.revenue > 0 ? bucket.cost / bucket.revenue : 0)
  }
  return ratios
}

function buildAllProductDailyTrends(
  sales: OperationSaleRow[],
  buckets: Map<string, ProductStatsBucket>,
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
): Record<string, StatisticsEvolutionPoint[]> {
  const costRatioByKey = buildProductCostRatioByKey(buckets)
  const metricsByProductDay = new Map<
    string,
    Map<string, { quantity: number; revenue: number; cost: number }>
  >()

  for (const sale of sales) {
    const day = operationalDayKey(sale.soldAt, timeZone, operationalDayCloseTime)
    for (const item of sale.lineItems) {
      if (item.lineTotal <= 0 && item.quantity <= 0) continue
      const key = saleLineProductKey(item)
      const dayMap =
        metricsByProductDay.get(key) ??
        new Map<string, { quantity: number; revenue: number; cost: number }>()
      const prev = dayMap.get(day) ?? { quantity: 0, revenue: 0, cost: 0 }
      const lineRevenue = roundMoney(item.lineTotal)
      const lineCost = roundMoney(lineRevenue * (costRatioByKey.get(key) ?? 0))
      dayMap.set(day, {
        quantity: roundMoney(prev.quantity + item.quantity),
        revenue: roundMoney(prev.revenue + lineRevenue),
        cost: roundMoney(prev.cost + lineCost),
      })
      metricsByProductDay.set(key, dayMap)
    }
  }

  const result: Record<string, StatisticsEvolutionPoint[]> = {}
  for (const [productKey, dayMap] of metricsByProductDay) {
    result[productKey] = buildProductDailyTrendPoints(dayMap, from, to)
  }
  return result
}

function resolveLineItemCategory(
  item: OperationSaleLineItem,
  articleCategories: Map<string, { categoryId: string; categoryName: string }>,
  recipeCategories: Map<string, { categoryId: string; categoryName: string }>,
): { categoryKey: string; categoryLabel: string } {
  if (item.promotionId || item.lineKind === "promotion") {
    return {
      categoryKey: PROMOTION_CATEGORY_KEY,
      categoryLabel: PROMOTION_CATEGORY_LABEL,
    }
  }
  if (item.recipeId || item.lineKind === "recipe") {
    const category = item.recipeId ? recipeCategories.get(item.recipeId) : null
    return {
      categoryKey: `recipe:${category?.categoryId || "sin-categoria"}`,
      categoryLabel: category?.categoryName || "Sin categoría",
    }
  }
  if (item.articleId || item.lineKind === "article") {
    const category = item.articleId ? articleCategories.get(item.articleId) : null
    return {
      categoryKey: `article:${category?.categoryId || "sin-categoria"}`,
      categoryLabel: category?.categoryName || "Sin categoría",
    }
  }
  return {
    categoryKey: "other:sin-categoria",
    categoryLabel: "Sin categoría",
  }
}

function resolveBucketCategory(
  bucket: ProductStatsBucket,
  articleCategories: Map<string, { categoryId: string; categoryName: string }>,
  recipeCategories: Map<string, { categoryId: string; categoryName: string }>,
): { categoryKey: string; categoryLabel: string } {
  if (bucket.promotionId || bucket.lineKind === "promotion") {
    return {
      categoryKey: PROMOTION_CATEGORY_KEY,
      categoryLabel: PROMOTION_CATEGORY_LABEL,
    }
  }
  if (bucket.recipeId || bucket.lineKind === "recipe") {
    const category = bucket.recipeId ? recipeCategories.get(bucket.recipeId) : null
    return {
      categoryKey: `recipe:${category?.categoryId || "sin-categoria"}`,
      categoryLabel: category?.categoryName || "Sin categoría",
    }
  }
  if (bucket.articleId) {
    const category = articleCategories.get(bucket.articleId)
    return {
      categoryKey: `article:${category?.categoryId || "sin-categoria"}`,
      categoryLabel: category?.categoryName || "Sin categoría",
    }
  }
  return {
    categoryKey: "other:sin-categoria",
    categoryLabel: "Sin categoría",
  }
}

function buildAllCategoryDailyTrends(
  sales: OperationSaleRow[],
  buckets: Map<string, ProductStatsBucket>,
  articleCategories: Map<string, { categoryId: string; categoryName: string }>,
  recipeCategories: Map<string, { categoryId: string; categoryName: string }>,
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
): Record<string, StatisticsEvolutionPoint[]> {
  const costRatioByKey = buildProductCostRatioByKey(buckets)
  const metricsByCategoryDay = new Map<
    string,
    Map<string, { quantity: number; revenue: number; cost: number }>
  >()

  for (const sale of sales) {
    const day = operationalDayKey(sale.soldAt, timeZone, operationalDayCloseTime)
    for (const item of sale.lineItems) {
      if (item.lineTotal <= 0 && item.quantity <= 0) continue
      const { categoryKey } = resolveLineItemCategory(
        item,
        articleCategories,
        recipeCategories,
      )
      const productKey = saleLineProductKey(item)
      const dayMap =
        metricsByCategoryDay.get(categoryKey) ??
        new Map<string, { quantity: number; revenue: number; cost: number }>()
      const prev = dayMap.get(day) ?? { quantity: 0, revenue: 0, cost: 0 }
      const lineRevenue = roundMoney(item.lineTotal)
      const lineCost = roundMoney(lineRevenue * (costRatioByKey.get(productKey) ?? 0))
      dayMap.set(day, {
        quantity: roundMoney(prev.quantity + item.quantity),
        revenue: roundMoney(prev.revenue + lineRevenue),
        cost: roundMoney(prev.cost + lineCost),
      })
      metricsByCategoryDay.set(categoryKey, dayMap)
    }
  }

  const result: Record<string, StatisticsEvolutionPoint[]> = {}
  for (const [categoryKey, dayMap] of metricsByCategoryDay) {
    result[categoryKey] = buildProductDailyTrendPoints(dayMap, from, to)
  }
  return result
}

function buildCategoryTrendOptions(
  categoryTotals: Map<string, { label: string; revenue: number; cost: number }>,
): StatisticsProductTrendOption[] {
  return [...categoryTotals.entries()]
    .filter(([, row]) => row.revenue > 0)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([key, row]) => ({ key, label: row.label }))
}

function buildCategoryTotals(
  buckets: Map<string, ProductStatsBucket>,
  articleCategories: Map<string, { categoryId: string; categoryName: string }>,
  recipeCategories: Map<string, { categoryId: string; categoryName: string }>,
): Map<string, { label: string; revenue: number; cost: number }> {
  const categoryTotals = new Map<
    string,
    { label: string; revenue: number; cost: number }
  >()

  for (const bucket of buckets.values()) {
    const { categoryKey, categoryLabel } = resolveBucketCategory(
      bucket,
      articleCategories,
      recipeCategories,
    )

    const prev = categoryTotals.get(categoryKey)
    categoryTotals.set(categoryKey, {
      label: categoryLabel,
      revenue: roundMoney((prev?.revenue ?? 0) + bucket.revenue),
      cost: roundMoney((prev?.cost ?? 0) + bucket.cost),
    })
  }

  return categoryTotals
}

function buildCategorySalesSegments(
  categoryTotals: Map<string, { label: string; revenue: number; cost: number }>,
): StatisticsSegment[] {
  const totalRevenue = roundMoney(
    [...categoryTotals.values()].reduce((acc, row) => acc + row.revenue, 0),
  )
  if (totalRevenue <= 0) return []

  return [...categoryTotals.entries()]
    .filter(([, row]) => row.revenue > 0)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([id, row]) => ({
      id,
      label: row.label,
      value: row.revenue,
      percent: roundMoney((row.revenue / totalRevenue) * 100),
    }))
}

function buildCategoryProfitSegments(
  categoryTotals: Map<string, { label: string; revenue: number; cost: number }>,
): StatisticsSegment[] {
  const rows = [...categoryTotals.entries()]
    .map(([id, row]) => ({
      id,
      label: row.label,
      profit: roundMoney(row.revenue - row.cost),
    }))
    .filter((row) => row.profit > 0)

  const totalProfit = roundMoney(rows.reduce((acc, row) => acc + row.profit, 0))
  if (totalProfit <= 0) return []

  return rows
    .sort((a, b) => b.profit - a.profit)
    .map((row) => ({
      id: row.id,
      label: row.label,
      value: row.profit,
      percent: roundMoney((row.profit / totalProfit) * 100),
    }))
}

async function hydrateProductBucketsCosts(
  popId: string,
  buckets: Map<string, ProductStatsBucket>,
  from: string | null,
  to: string | null,
): Promise<void> {
  const articleCosts = await fetchSaleArticleCostsForPeriod(popId, from, to)
  applyArticleCostsToBuckets(buckets, articleCosts)
  await estimateMissingProductCosts(popId, buckets)
  await applyRecipeCostsToBuckets(popId, buckets)
}

function purchaseLineProductKey(line: OperationPurchaseLineItem): string {
  if (line.articleId) return `a:${line.articleId}`
  const name = line.nameSnapshot.trim().toLowerCase() || "sin-nombre"
  return `n:${name}`
}

function resolvePurchaseLineCategory(
  line: OperationPurchaseLineItem,
  articleCategories: Map<string, { categoryId: string; categoryName: string }>,
): { categoryKey: string; categoryLabel: string } {
  if (!line.articleId) {
    return {
      categoryKey: "other:sin-categoria",
      categoryLabel: "Sin categoría",
    }
  }
  const category = articleCategories.get(line.articleId)
  return {
    categoryKey: `article:${category?.categoryId || "sin-categoria"}`,
    categoryLabel: category?.categoryName || "Sin categoría",
  }
}

function purchaseLineAmount(line: OperationPurchaseLineItem): number {
  if (line.lineTotal > 0) return line.lineTotal
  return roundMoney(line.quantity * line.unitCost)
}

function buildPurchaseDistributionByItemKind(
  purchases: OperationPurchaseRow[],
  articleKindById: Map<string, ArticleItemKind>,
): StatisticsSegment[] {
  const totals = new Map<ArticleItemKind, number>(
    ARTICLE_ITEM_KINDS.map((kind) => [kind, 0]),
  )

  for (const purchase of purchases) {
    for (const line of purchase.lineItems) {
      if (!line.articleId) continue
      const kind = articleKindById.get(line.articleId)
      if (!kind) continue
      totals.set(
        kind,
        roundMoney((totals.get(kind) ?? 0) + purchaseLineAmount(line)),
      )
    }
  }

  return buildCostKindSegments(totals)
}

async function fetchCostDistributionByItemKind(
  popId: string,
  from: string | null,
  to: string | null,
): Promise<StatisticsSegment[]> {
  const supabase = await createClient()
  const totals = new Map<ArticleItemKind, number>(
    ARTICLE_ITEM_KINDS.map((kind) => [kind, 0]),
  )

  const { data: allocRows, error: allocErr } = await supabase
    .from("inventory_layer_allocations")
    .select(
      `
      quantity,
      unit_cost,
      inventory_movement_id,
      articles ( item_kind ),
      inventory_movements (
        movement_type,
        quantity_delta,
        article_id,
        sale_id,
        sales ( sold_at, status )
      )
    `,
    )
    .eq("pop_id", popId)

  if (allocErr) return []

  const movementIdsWithAlloc = new Set<string>()

  for (const row of allocRows ?? []) {
    const movement = row.inventory_movements as {
      movement_type?: string
      quantity_delta?: number | string
      article_id?: string
      sale_id?: string | null
      sales?: { sold_at?: string; status?: string } | null
    } | null
    if (movement?.movement_type !== "sale" || !movement.sale_id) continue

    const sale = movement.sales
    if (!sale || sale.status === "cancelled") continue
    const soldDay = String(sale.sold_at ?? "").slice(0, 10)
    if (from && soldDay < from) continue
    if (to && soldDay > to) continue

    const article = row.articles as { item_kind?: string } | null
    const kind = article?.item_kind
    if (!kind || !isArticleItemKind(kind)) continue

    movementIdsWithAlloc.add(String(row.inventory_movement_id))
    const lineCost = roundMoney(
      Math.abs(Number(row.quantity ?? 0)) * Math.abs(Number(row.unit_cost ?? 0)),
    )
    totals.set(kind, roundMoney((totals.get(kind) ?? 0) + lineCost))
  }

  const fallbackArticleIds = new Set<string>()
  const fallbackRows: Array<{
    articleId: string
    kind: ArticleItemKind
    qty: number
  }> = []

  const { data: movementRows, error: movementErr } = await supabase
    .from("inventory_movements")
    .select(
      `
      id,
      quantity_delta,
      article_id,
      articles ( item_kind ),
      sales ( sold_at, status )
    `,
    )
    .eq("pop_id", popId)
    .eq("movement_type", "sale")
    .not("sale_id", "is", null)

  if (!movementErr) {
    for (const row of movementRows ?? []) {
      const movementId = String(row.id)
      if (movementIdsWithAlloc.has(movementId)) continue

      const sale = row.sales as { sold_at?: string; status?: string } | null
      if (!sale || sale.status === "cancelled") continue
      const soldDay = String(sale.sold_at ?? "").slice(0, 10)
      if (from && soldDay < from) continue
      if (to && soldDay > to) continue

      const article = row.articles as { item_kind?: string } | null
      const kind = article?.item_kind
      if (!kind || !isArticleItemKind(kind)) continue

      const articleId = String(row.article_id ?? "")
      if (!articleId) continue

      const qty = Math.abs(Number(row.quantity_delta ?? 0))
      if (qty <= 0) continue

      fallbackArticleIds.add(articleId)
      fallbackRows.push({ articleId, kind, qty })
    }
  }

  if (fallbackRows.length > 0) {
    const articleIds = [...fallbackArticleIds]
    const layerCosts = await fetchLatestLayerUnitCostsByArticleId(
      supabase,
      popId,
      articleIds,
    )
    const missingIds = articleIds.filter((id) => !layerCosts.has(id))
    const catalogCosts =
      missingIds.length > 0
        ? await fetchCatalogReferenceUnitCostsByArticleId(
            supabase,
            popId,
            missingIds,
          )
        : new Map<string, number>()

    for (const row of fallbackRows) {
      const unitCost =
        layerCosts.get(row.articleId) ?? catalogCosts.get(row.articleId) ?? 0
      if (unitCost <= 0) continue
      totals.set(
        row.kind,
        roundMoney((totals.get(row.kind) ?? 0) + roundMoney(row.qty * unitCost)),
      )
    }
  }

  return buildCostKindSegments(totals)
}

function buildResultWaterfall(
  ingresos: number,
  costos: number,
  gastos: number,
  resultado: number,
): StatisticsWaterfallStep[] {
  const ganancia = roundMoney(ingresos - costos)
  return [
    { id: "sales", label: "Ventas", kind: "increase", amount: ingresos },
    { id: "costs", label: "Costos de ventas", kind: "decrease", amount: costos },
    { id: "gross", label: "Ganancia bruta", kind: "subtotal", amount: ganancia },
    { id: "expenses", label: "Gastos", kind: "decrease", amount: gastos },
    { id: "net", label: "Resultado neto", kind: "total", amount: resultado },
  ]
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
    description: "",
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
      (daySales) => daySales.length,
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
    unavailable: [],
  }
}

function buildProfitabilitySection(
  current: Awaited<ReturnType<typeof fetchIncomeTotals>>,
  previous: Awaited<ReturnType<typeof fetchIncomeTotals>>,
  compareEnabled: boolean,
  from: string | null,
  to: string | null,
  dailyIncome: Map<string, DailyIncomeBucket>,
  costDistribution: StatisticsSegment[],
): StatisticsSectionData {
  const prev = compareEnabled ? previous : { ingresos: 0, costos: 0, gastos: 0, resultado: 0, margen: 0 }
  const ganancia = roundMoney(current.ingresos - current.costos)
  const prevGanancia = roundMoney(prev.ingresos - prev.costos)
  const marginOnSales = current.margen
  const costsOnSales = ratioOverSales(current.costos, current.ingresos)
  const expensesOnSales = ratioOverSales(current.gastos, current.ingresos)
  const resultOnSales = ratioOverSales(current.resultado, current.ingresos)

  return {
    sectionId: "profitability",
    title: "Rentabilidad",
    description: "",
    comparison: [
      compareMetric("costs", "Costo de ventas", current.costos, prev.costos, "money"),
      compareMetric("gross", "Ganancia bruta", ganancia, prevGanancia, "money"),
      compareMetric("expenses", "Gastos", current.gastos, prev.gastos, "money"),
      compareMetric("result", "Resultado neto", current.resultado, prev.resultado, "money"),
    ],
    efficiencyRatios: [
      comparePercentMetric(
        "margin-on-sales",
        "Margen sobre ventas",
        marginOnSales,
        prev.margen,
        compareEnabled,
      ),
      comparePercentMetric(
        "costs-on-sales",
        "Costos sobre ventas",
        costsOnSales,
        ratioOverSales(prev.costos, prev.ingresos),
        compareEnabled,
      ),
      comparePercentMetric(
        "expenses-on-sales",
        "Gastos sobre ventas",
        expensesOnSales,
        ratioOverSales(prev.gastos, prev.ingresos),
        compareEnabled,
      ),
      comparePercentMetric(
        "result-on-sales",
        "Resultado sobre ventas",
        resultOnSales,
        ratioOverSales(prev.resultado, prev.ingresos),
        compareEnabled,
      ),
    ],
    evolution: buildProfitabilityDailyEvolution(dailyIncome, from, to),
    hourlyEvolution: [],
    hourlyHeatmap: emptyHourlyHeatmap(),
    segments: [
      { label: "Ingresos", value: current.ingresos, percent: 100 },
      { label: "Costos", value: current.costos, percent: current.ingresos > 0 ? roundMoney((current.costos / current.ingresos) * 100) : 0 },
      { label: "Gastos", value: current.gastos, percent: current.ingresos > 0 ? roundMoney((current.gastos / current.ingresos) * 100) : 0 },
    ].filter((s) => s.value > 0),
    rankings: [],
    resultWaterfall: buildResultWaterfall(
      current.ingresos,
      current.costos,
      current.gastos,
      current.resultado,
    ),
    costDistribution,
    unavailable: [],
  }
}

function buildProductsSection(
  buckets: Map<string, ProductStatsBucket>,
  categoryTotals: Map<string, { label: string; revenue: number; cost: number }>,
  currentCounts: ProductLineKindCounts,
  prevCounts: ProductLineKindCounts,
  compareEnabled: boolean,
  productTrendOptions: StatisticsProductTrendOption[],
  productTrendByKey: Record<string, StatisticsEvolutionPoint[]>,
  defaultProductTrendKey: string | null,
  categoryTrendOptions: StatisticsProductTrendOption[],
  categoryTrendByKey: Record<string, StatisticsEvolutionPoint[]>,
  defaultCategoryTrendKey: string | null,
): StatisticsSectionData {
  const rankings = buildProductProfitRankings(buckets)

  return {
    sectionId: "products",
    title: "Productos",
    description: "Rentabilidad y participación por producto y categoría",
    comparison: [
      compareMetric(
        "articles",
        "Artículos vendidos",
        currentCounts.articles,
        compareEnabled ? prevCounts.articles : 0,
        "number",
      ),
      compareMetric(
        "promotions",
        "Promociones vendidas",
        currentCounts.promotions,
        compareEnabled ? prevCounts.promotions : 0,
        "number",
      ),
      compareMetric(
        "recipes",
        "Recetas vendidas",
        currentCounts.recipes,
        compareEnabled ? prevCounts.recipes : 0,
        "number",
      ),
    ],
    evolution: [],
    hourlyEvolution: [],
    hourlyHeatmap: emptyHourlyHeatmap(),
    segments: [],
    rankings,
    productSalesRankings: buildProductSalesShareRankings(buckets),
    productTrendOptions,
    productTrendByKey,
    defaultProductTrendKey,
    categoryProfitDistribution: buildCategoryProfitSegments(categoryTotals),
    categorySalesDistribution: buildCategorySalesSegments(categoryTotals),
    categoryTrendOptions,
    categoryTrendByKey,
    defaultCategoryTrendKey,
    unavailable: [],
  }
}

function buildPurchasesEvolution(
  purchases: OperationPurchaseRow[],
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
): StatisticsEvolutionPoint[] {
  const amountBuckets = new Map<string, number>()
  const countBuckets = new Map<string, number>()
  for (const purchase of purchases) {
    const day = operationalDayKey(
      purchase.operationAt,
      timeZone,
      operationalDayCloseTime,
    )
    amountBuckets.set(
      day,
      (amountBuckets.get(day) ?? 0) + sumPurchasesReportPaid([purchase]),
    )
    countBuckets.set(day, (countBuckets.get(day) ?? 0) + 1)
  }

  const toPoint = (day: string): StatisticsEvolutionPoint => ({
    label: `${day.slice(8, 10)}/${day.slice(5, 7)}`,
    value: roundMoney(amountBuckets.get(day) ?? 0),
    count: countBuckets.get(day) ?? 0,
  })

  if (!from || !to) {
    const days = new Set([...amountBuckets.keys(), ...countBuckets.keys()])
    return [...days]
      .sort((a, b) => a.localeCompare(b))
      .map((day) => toPoint(day))
  }

  const points: StatisticsEvolutionPoint[] = []
  let cursor = from
  while (cursor <= to) {
    points.push(toPoint(cursor))
    cursor = addCalendarDays(cursor, 1)
  }
  return points
}

function buildPurchasesSection(
  purchases: OperationPurchaseRow[],
  prevPurchases: OperationPurchaseRow[],
  from: string | null,
  to: string | null,
  compareEnabled: boolean,
  purchaseDistribution: StatisticsSegment[],
  timeZone: string,
  operationalDayCloseTime: string,
): StatisticsSectionData {
  const total = sumPurchasesReportPaid(purchases)
  const prevTotal = compareEnabled ? sumPurchasesReportPaid(prevPurchases) : 0
  const count = purchases.length
  const prevCount = compareEnabled ? prevPurchases.length : 0
  const ticket = avgPurchaseTicket(purchases)
  const prevTicket = compareEnabled ? avgPurchaseTicket(prevPurchases) : 0

  const buyerTotals = new Map<string, number>()
  const buyerCounts = new Map<string, number>()
  for (const purchase of purchases) {
    const name = purchase.purchasedByName?.trim() || "Sin comprador"
    buyerTotals.set(
      name,
      (buyerTotals.get(name) ?? 0) + sumPurchasesReportPaid([purchase]),
    )
    buyerCounts.set(name, (buyerCounts.get(name) ?? 0) + 1)
  }

  return {
    sectionId: "purchases",
    title: "Compras",
    description: "Evolución e importes del período",
    comparison: [
      compareMetric("total", "Compras", total, prevTotal, "money"),
      compareMetric("count", "Cantidad", count, prevCount, "number"),
      compareMetric("ticket", "Ticket promedio", ticket, prevTicket, "money"),
    ],
    evolution: buildPurchasesEvolution(
      purchases,
      from,
      to,
      timeZone,
      operationalDayCloseTime,
    ),
    hourlyEvolution: [],
    hourlyHeatmap: emptyHourlyHeatmap(),
    segments: buildSegments(buyerTotals, 6),
    rankings: buildRankings(buyerTotals, buyerCounts),
    purchaseDistribution,
    unavailable: [],
  }
}

function buildClientDailyTrendPoints(
  metricsByDay: Map<string, { amount: number; count: number }>,
  from: string | null,
  to: string | null,
): StatisticsEvolutionPoint[] {
  const toPoint = (day: string): StatisticsEvolutionPoint => {
    const metrics = metricsByDay.get(day) ?? { amount: 0, count: 0 }
    return {
      label: `${day.slice(8, 10)}/${day.slice(5, 7)}`,
      value: roundMoney(metrics.amount),
      count: metrics.count,
    }
  }

  if (!from || !to) {
    return [...metricsByDay.keys()]
      .sort((a, b) => a.localeCompare(b))
      .map(toPoint)
  }

  const points: StatisticsEvolutionPoint[] = []
  let cursor = from
  while (cursor <= to) {
    points.push(toPoint(cursor))
    cursor = addCalendarDays(cursor, 1)
  }
  return points
}

function buildClientTrendOptions(
  sales: OperationSaleRow[],
): StatisticsProductTrendOption[] {
  const totals = new Map<string, { label: string; revenue: number }>()
  for (const sale of sales) {
    if (!sale.clientId) continue
    const prev = totals.get(sale.clientId) ?? {
      label: sale.customerName?.trim() || "Cliente",
      revenue: 0,
    }
    prev.revenue = roundMoney(
      prev.revenue + displayOperationSaleCollected(sale),
    )
    totals.set(sale.clientId, prev)
  }

  return [...totals.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([key, { label }]) => ({ key, label }))
}

function buildAllClientDailyTrends(
  sales: OperationSaleRow[],
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
): Record<string, StatisticsEvolutionPoint[]> {
  const metricsByClientDay = new Map<
    string,
    Map<string, { amount: number; count: number }>
  >()

  for (const sale of sales) {
    if (!sale.clientId) continue
    const day = operationalDayKey(sale.soldAt, timeZone, operationalDayCloseTime)
    const dayMap =
      metricsByClientDay.get(sale.clientId) ??
      new Map<string, { amount: number; count: number }>()
    const prev = dayMap.get(day) ?? { amount: 0, count: 0 }
    dayMap.set(day, {
      amount: roundMoney(prev.amount + displayOperationSaleCollected(sale)),
      count: prev.count + 1,
    })
    metricsByClientDay.set(sale.clientId, dayMap)
  }

  const result: Record<string, StatisticsEvolutionPoint[]> = {}
  for (const [clientId, dayMap] of metricsByClientDay) {
    result[clientId] = buildClientDailyTrendPoints(dayMap, from, to)
  }
  return result
}

function buildAllClientTopArticles(
  sales: OperationSaleRow[],
  limit = 10,
): Record<string, StatisticsRankRow[]> {
  const metricsByClient = new Map<
    string,
    Map<string, { label: string; quantity: number; amount: number }>
  >()

  for (const sale of sales) {
    if (!sale.clientId) continue
    const articleMap =
      metricsByClient.get(sale.clientId) ??
      new Map<string, { label: string; quantity: number; amount: number }>()

    for (const item of sale.lineItems) {
      if (item.quantity <= 0 && item.lineTotal <= 0) continue
      const key = saleLineProductKey(item)
      const label = item.nameSnapshot.trim() || "Sin nombre"
      const prev = articleMap.get(key) ?? { label, quantity: 0, amount: 0 }
      articleMap.set(key, {
        label,
        quantity: roundMoney(prev.quantity + item.quantity),
        amount: roundMoney(prev.amount + item.lineTotal),
      })
    }

    metricsByClient.set(sale.clientId, articleMap)
  }

  const result: Record<string, StatisticsRankRow[]> = {}
  for (const [clientId, articleMap] of metricsByClient) {
    result[clientId] = [...articleMap.entries()]
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, limit)
      .map(([id, metrics], index) => ({
        rank: index + 1,
        id,
        label: metrics.label,
        value: metrics.quantity,
        secondaryLabel: "Importe",
        secondaryValue: metrics.amount,
        secondaryFormat: "money" as const,
      }))
  }
  return result
}

function buildAllClientTopCategories(
  sales: OperationSaleRow[],
  articleCategories: Map<string, { categoryId: string; categoryName: string }>,
  recipeCategories: Map<string, { categoryId: string; categoryName: string }>,
  limit = 10,
): Record<string, StatisticsRankRow[]> {
  const metricsByClient = new Map<
    string,
    Map<string, { label: string; quantity: number; amount: number }>
  >()

  for (const sale of sales) {
    if (!sale.clientId) continue
    const categoryMap =
      metricsByClient.get(sale.clientId) ??
      new Map<string, { label: string; quantity: number; amount: number }>()

    for (const item of sale.lineItems) {
      if (item.quantity <= 0 && item.lineTotal <= 0) continue
      const { categoryKey, categoryLabel } = resolveLineItemCategory(
        item,
        articleCategories,
        recipeCategories,
      )
      const prev = categoryMap.get(categoryKey) ?? {
        label: categoryLabel,
        quantity: 0,
        amount: 0,
      }
      categoryMap.set(categoryKey, {
        label: categoryLabel,
        quantity: roundMoney(prev.quantity + item.quantity),
        amount: roundMoney(prev.amount + item.lineTotal),
      })
    }

    metricsByClient.set(sale.clientId, categoryMap)
  }

  const result: Record<string, StatisticsRankRow[]> = {}
  for (const [clientId, categoryMap] of metricsByClient) {
    result[clientId] = [...categoryMap.entries()]
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, limit)
      .map(([id, metrics], index) => ({
        rank: index + 1,
        id,
        label: metrics.label,
        value: metrics.quantity,
        secondaryLabel: "Importe",
        secondaryValue: metrics.amount,
        secondaryFormat: "money" as const,
      }))
  }
  return result
}

async function buildClientsSection(
  popId: string,
  sales: OperationSaleRow[],
  prevSales: OperationSaleRow[],
  compareEnabled: boolean,
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
): Promise<StatisticsSectionData> {
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
  const clientTrendOptions = buildClientTrendOptions(sales)
  const clientTrendByKey = buildAllClientDailyTrends(
    sales,
    from,
    to,
    timeZone,
    operationalDayCloseTime,
  )

  const articleIds = [
    ...new Set(
      sales.flatMap((sale) =>
        sale.lineItems
          .map((item) => item.articleId)
          .filter((id): id is string => Boolean(id)),
      ),
    ),
  ]
  const recipeIds = [
    ...new Set(
      sales.flatMap((sale) =>
        sale.lineItems
          .map((item) => item.recipeId)
          .filter((id): id is string => Boolean(id)),
      ),
    ),
  ]
  const [articleCategories, recipeCategories] = await Promise.all([
    fetchArticleCategoriesById(popId, articleIds),
    fetchRecipeCategoriesById(popId, recipeIds),
  ])
  const clientTopArticlesByKey = buildAllClientTopArticles(sales)
  const clientTopCategoriesByKey = buildAllClientTopCategories(
    sales,
    articleCategories,
    recipeCategories,
  )

  return {
    sectionId: "clients",
    title: "Clientes",
    description: "Nuevos, recurrentes y facturación por cliente",
    comparison: [
      compareMetric(
        "clients",
        "Clientes en ventas",
        clientIds.size,
        compareEnabled ? prevClientIds.size : 0,
        "number",
      ),
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
    hourlyEvolution: [],
    hourlyHeatmap: emptyHourlyHeatmap(),
    segments: buildSegments(clientTotals, 6),
    rankings: buildRankings(clientTotals),
    clientTrendOptions,
    clientTrendByKey,
    defaultClientTrendKey: clientTrendOptions[0]?.key ?? null,
    clientTopArticlesByKey,
    clientTopCategoriesByKey,
    unavailable: [],
  }
}

function buildSupplierTrendOptions(
  purchases: OperationPurchaseRow[],
): StatisticsProductTrendOption[] {
  const totals = new Map<string, { label: string; amount: number }>()
  for (const purchase of purchases) {
    if (!purchase.supplierId) continue
    const prev = totals.get(purchase.supplierId) ?? {
      label: purchase.supplierName?.trim() || "Proveedor",
      amount: 0,
    }
    prev.amount = roundMoney(
      prev.amount + sumPurchasesReportPaid([purchase]),
    )
    totals.set(purchase.supplierId, prev)
  }

  return [...totals.entries()]
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([key, { label }]) => ({ key, label }))
}

function buildAllSupplierDailyTrends(
  purchases: OperationPurchaseRow[],
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
): Record<string, StatisticsEvolutionPoint[]> {
  const metricsBySupplierDay = new Map<
    string,
    Map<string, { amount: number; count: number }>
  >()

  for (const purchase of purchases) {
    if (!purchase.supplierId) continue
    const day = operationalDayKey(
      purchase.operationAt,
      timeZone,
      operationalDayCloseTime,
    )
    const dayMap =
      metricsBySupplierDay.get(purchase.supplierId) ??
      new Map<string, { amount: number; count: number }>()
    const prev = dayMap.get(day) ?? { amount: 0, count: 0 }
    dayMap.set(day, {
      amount: roundMoney(prev.amount + sumPurchasesReportPaid([purchase])),
      count: prev.count + 1,
    })
    metricsBySupplierDay.set(purchase.supplierId, dayMap)
  }

  const result: Record<string, StatisticsEvolutionPoint[]> = {}
  for (const [supplierId, dayMap] of metricsBySupplierDay) {
    result[supplierId] = buildClientDailyTrendPoints(dayMap, from, to)
  }
  return result
}

function buildAllSupplierTopArticles(
  purchases: OperationPurchaseRow[],
  limit = 10,
): Record<string, StatisticsRankRow[]> {
  const metricsBySupplier = new Map<
    string,
    Map<string, { label: string; quantity: number; amount: number }>
  >()

  for (const purchase of purchases) {
    if (!purchase.supplierId) continue
    const articleMap =
      metricsBySupplier.get(purchase.supplierId) ??
      new Map<string, { label: string; quantity: number; amount: number }>()

    for (const line of purchase.lineItems) {
      if (line.quantity <= 0 && purchaseLineAmount(line) <= 0) continue
      const key = purchaseLineProductKey(line)
      const label = line.nameSnapshot.trim() || "Sin nombre"
      const amount = purchaseLineAmount(line)
      const prev = articleMap.get(key) ?? { label, quantity: 0, amount: 0 }
      articleMap.set(key, {
        label,
        quantity: roundMoney(prev.quantity + line.quantity),
        amount: roundMoney(prev.amount + amount),
      })
    }

    metricsBySupplier.set(purchase.supplierId, articleMap)
  }

  const result: Record<string, StatisticsRankRow[]> = {}
  for (const [supplierId, articleMap] of metricsBySupplier) {
    result[supplierId] = [...articleMap.entries()]
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, limit)
      .map(([id, metrics], index) => ({
        rank: index + 1,
        id,
        label: metrics.label,
        value: metrics.quantity,
        secondaryLabel: "Importe",
        secondaryValue: metrics.amount,
        secondaryFormat: "money" as const,
      }))
  }
  return result
}

function buildAllSupplierTopCategories(
  purchases: OperationPurchaseRow[],
  articleCategories: Map<string, { categoryId: string; categoryName: string }>,
  limit = 10,
): Record<string, StatisticsRankRow[]> {
  const metricsBySupplier = new Map<
    string,
    Map<string, { label: string; quantity: number; amount: number }>
  >()

  for (const purchase of purchases) {
    if (!purchase.supplierId) continue
    const categoryMap =
      metricsBySupplier.get(purchase.supplierId) ??
      new Map<string, { label: string; quantity: number; amount: number }>()

    for (const line of purchase.lineItems) {
      if (line.quantity <= 0 && purchaseLineAmount(line) <= 0) continue
      const { categoryKey, categoryLabel } = resolvePurchaseLineCategory(
        line,
        articleCategories,
      )
      const amount = purchaseLineAmount(line)
      const prev = categoryMap.get(categoryKey) ?? {
        label: categoryLabel,
        quantity: 0,
        amount: 0,
      }
      categoryMap.set(categoryKey, {
        label: categoryLabel,
        quantity: roundMoney(prev.quantity + line.quantity),
        amount: roundMoney(prev.amount + amount),
      })
    }

    metricsBySupplier.set(purchase.supplierId, categoryMap)
  }

  const result: Record<string, StatisticsRankRow[]> = {}
  for (const [supplierId, categoryMap] of metricsBySupplier) {
    result[supplierId] = [...categoryMap.entries()]
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, limit)
      .map(([id, metrics], index) => ({
        rank: index + 1,
        id,
        label: metrics.label,
        value: metrics.quantity,
        secondaryLabel: "Importe",
        secondaryValue: metrics.amount,
        secondaryFormat: "money" as const,
      }))
  }
  return result
}

async function buildSuppliersSection(
  popId: string,
  purchases: OperationPurchaseRow[],
  prevPurchases: OperationPurchaseRow[],
  compareEnabled: boolean,
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
): Promise<StatisticsSectionData> {
  const supplierIds = new Set<string>()
  const prevSupplierIds = new Set<string>()

  for (const purchase of purchases) {
    if (purchase.supplierId) supplierIds.add(purchase.supplierId)
  }
  for (const purchase of prevPurchases) {
    if (purchase.supplierId) prevSupplierIds.add(purchase.supplierId)
  }

  let newSuppliers = 0
  if (compareEnabled) {
    for (const id of supplierIds) {
      if (!prevSupplierIds.has(id)) newSuppliers += 1
    }
  }

  const recurring = [...supplierIds].filter((id) =>
    prevSupplierIds.has(id),
  ).length

  const supplierTrendOptions = buildSupplierTrendOptions(purchases)
  const supplierTrendByKey = buildAllSupplierDailyTrends(
    purchases,
    from,
    to,
    timeZone,
    operationalDayCloseTime,
  )

  const articleIds = [
    ...new Set(
      purchases.flatMap((purchase) =>
        purchase.lineItems
          .map((line) => line.articleId)
          .filter((id): id is string => Boolean(id)),
      ),
    ),
  ]
  const articleCategories = await fetchArticleCategoriesById(popId, articleIds)
  const supplierTopArticlesByKey = buildAllSupplierTopArticles(purchases)
  const supplierTopCategoriesByKey = buildAllSupplierTopCategories(
    purchases,
    articleCategories,
  )

  return {
    sectionId: "suppliers",
    title: "Proveedores",
    description: "Nuevos, recurrentes y compras por proveedor",
    comparison: [
      compareMetric(
        "suppliers",
        "Proveedores en compras",
        supplierIds.size,
        compareEnabled ? prevSupplierIds.size : 0,
        "number",
      ),
      compareMetric("new", "Proveedores nuevos", newSuppliers, 0, "number"),
      compareMetric("recurring", "Recurrentes", recurring, 0, "number"),
      compareMetric(
        "ticket",
        "Ticket promedio",
        avgPurchaseTicket(purchases),
        compareEnabled ? avgPurchaseTicket(prevPurchases) : 0,
        "money",
      ),
    ],
    evolution: [],
    hourlyEvolution: [],
    hourlyHeatmap: emptyHourlyHeatmap(),
    segments: [],
    rankings: [],
    supplierTrendOptions,
    supplierTrendByKey,
    defaultSupplierTrendKey: supplierTrendOptions[0]?.key ?? null,
    supplierTopArticlesByKey,
    supplierTopCategoriesByKey,
    unavailable: [],
  }
}

function buildTreasuryDailyEvolutionPoints(
  metricsByDay: Map<string, { ingresos: number; egresos: number }>,
  from: string | null,
  to: string | null,
): StatisticsEvolutionPoint[] {
  const toPoint = (day: string): StatisticsEvolutionPoint => {
    const metrics = metricsByDay.get(day) ?? { ingresos: 0, egresos: 0 }
    return {
      label: `${day.slice(8, 10)}/${day.slice(5, 7)}`,
      value: roundMoney(metrics.ingresos),
      count: roundMoney(metrics.egresos),
    }
  }

  if (!from || !to) {
    return [...metricsByDay.keys()]
      .sort((a, b) => a.localeCompare(b))
      .map(toPoint)
  }

  const points: StatisticsEvolutionPoint[] = []
  let cursor = from
  while (cursor <= to) {
    points.push(toPoint(cursor))
    cursor = addCalendarDays(cursor, 1)
  }
  return points
}

async function loadMotherTreasuryChartAccounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<Array<{ chartAccountId: string; nature: string }>> {
  const { data } = await supabase
    .from("treasury_accounts")
    .select(
      `
      accounting_chart_account_id,
      accounting_chart_of_accounts ( id, code, nature )
    `,
    )
    .eq("pop_id", popId)
    .eq("is_active", true)

  const accounts: Array<{ chartAccountId: string; nature: string }> = []
  for (const row of data ?? []) {
    const chart = row.accounting_chart_of_accounts as {
      id?: string
      code?: string
      nature?: string
    } | null
    const code = String(chart?.code ?? "")
    if (!isMotherTreasuryAccount(code)) continue
    const chartAccountId = String(
      chart?.id ?? row.accounting_chart_account_id ?? "",
    )
    if (!chartAccountId) continue
    accounts.push({
      chartAccountId,
      nature: String(chart?.nature ?? "deudora"),
    })
  }
  return accounts
}

async function fetchTreasuryMotherDailyFlow(
  popId: string,
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
): Promise<Map<string, { ingresos: number; egresos: number }>> {
  const metricsByDay = new Map<string, { ingresos: number; egresos: number }>()
  if (!from || !to) return metricsByDay

  const supabase = await createClient()
  const mothers = await loadMotherTreasuryChartAccounts(supabase, popId)
  if (mothers.length === 0) return metricsByDay

  const motherIds = new Set(mothers.map((account) => account.chartAccountId))
  const natureByAccountId = new Map(
    mothers.map((account) => [account.chartAccountId, account.nature]),
  )

  const fetchBounds = expandCalendarBoundsForOperationalFetch(from, to)
  const { data: entries, error: entriesError } = await supabase
    .from("accounting_entries")
    .select("id, entry_date, posted_at")
    .eq("pop_id", popId)
    .eq("status", "posted")
    .gte("entry_date", fetchBounds.from ?? from)
    .lte("entry_date", fetchBounds.to ?? to)

  if (entriesError || !entries?.length) return metricsByDay

  const entryDayById = new Map<string, string>()
  for (const entry of entries) {
    const id = String(entry.id)
    const entryDate = String(entry.entry_date ?? "").slice(0, 10)
    const postedAt = String(entry.posted_at ?? "").trim()
    const anchor =
      postedAt ||
      (entryDate ? `${entryDate}T12:00:00` : "")
    if (!anchor) continue
    const operationalDay = operationalDayKey(
      anchor,
      timeZone,
      operationalDayCloseTime,
    )
    if (!isOperationalDayInRange(operationalDay, from, to)) continue
    entryDayById.set(id, operationalDay)
  }

  const entryIds = [...entryDayById.keys()]
  for (let i = 0; i < entryIds.length; i += JOURNAL_ENTRY_ID_CHUNK) {
    const chunk = entryIds.slice(i, i + JOURNAL_ENTRY_ID_CHUNK)
    const { data: lines, error: linesError } = await supabase
      .from("accounting_entry_lines")
      .select("entry_id, account_id, debit_amount, credit_amount")
      .in("entry_id", chunk)
      .in("account_id", [...motherIds])

    if (linesError) continue

    for (const line of lines ?? []) {
      const accountId = String(line.account_id ?? "")
      if (!motherIds.has(accountId)) continue
      const day = entryDayById.get(String(line.entry_id))
      if (!day) continue

      const debit = Number(line.debit_amount ?? 0)
      const credit = Number(line.credit_amount ?? 0)
      const nature = natureByAccountId.get(accountId) ?? "deudora"
      const prev = metricsByDay.get(day) ?? { ingresos: 0, egresos: 0 }

      if (nature === "acreedora") {
        prev.ingresos = roundMoney(prev.ingresos + credit)
        prev.egresos = roundMoney(prev.egresos + debit)
      } else {
        prev.ingresos = roundMoney(prev.ingresos + debit)
        prev.egresos = roundMoney(prev.egresos + credit)
      }
      metricsByDay.set(day, prev)
    }
  }

  return metricsByDay
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
  const ids = accounts.map((account) => String(account.id))

  let entryQuery = supabase
    .from("accounting_entries")
    .select("id")
    .eq("pop_id", popId)
    .eq("status", "posted")

  if (asOfDate?.trim()) {
    entryQuery = entryQuery.lte("entry_date", asOfDate.trim())
  }

  const { data: entries } = await entryQuery
  const entryIds = (entries ?? []).map((entry) => String(entry.id))
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

function positiveDeudoraBalance(balance: number): number {
  return roundMoney(Math.max(0, balance))
}

function positiveAcreedoraBalance(balance: number): number {
  return roundMoney(Math.max(0, -balance))
}

function sumTreasuryDailyFlow(
  metricsByDay: Map<string, { ingresos: number; egresos: number }>,
  from: string | null,
  to: string | null,
): { ingresos: number; egresos: number } {
  if (!from || !to) {
    let ingresos = 0
    let egresos = 0
    for (const metrics of metricsByDay.values()) {
      ingresos = roundMoney(ingresos + metrics.ingresos)
      egresos = roundMoney(egresos + metrics.egresos)
    }
    return { ingresos, egresos }
  }

  let ingresos = 0
  let egresos = 0
  let cursor = from
  while (cursor <= to) {
    const metrics = metricsByDay.get(cursor) ?? { ingresos: 0, egresos: 0 }
    ingresos = roundMoney(ingresos + metrics.ingresos)
    egresos = roundMoney(egresos + metrics.egresos)
    cursor = addCalendarDays(cursor, 1)
  }
  return { ingresos, egresos }
}

async function buildFinanceSection(
  popId: string,
  from: string | null,
  to: string | null,
  timeZone: string,
  operationalDayCloseTime: string,
): Promise<StatisticsSectionData> {
  const asOf = to?.trim() || null
  const [
    reportRes,
    dailyFlow,
    ccPorCobrar,
    ccPorPagar,
    chequesPorCobrar,
    chequesPorPagar,
  ] = await Promise.all([
    getTreasuryPeriodReport(popId, { from, to }),
    fetchTreasuryMotherDailyFlow(
      popId,
      from,
      to,
      timeZone,
      operationalDayCloseTime,
    ),
    fetchChartAccountBalanceAsOf(popId, CHART_CUENTAS_POR_COBRAR_CODES, asOf),
    fetchChartAccountBalanceAsOf(popId, CHART_PROVEEDORES_CC_CODES, asOf),
    fetchChartAccountBalanceAsOf(popId, CHART_DOCUMENTOS_POR_COBRAR_CODES, asOf),
    fetchChartAccountBalanceAsOf(popId, CHART_DOCUMENTOS_A_PAGAR_CODES, asOf),
  ])

  const rows = reportRes.success ? reportRes.data.rows : []
  const periodFlow = sumTreasuryDailyFlow(dailyFlow, from, to)
  const ingresos = periodFlow.ingresos
  const egresos = periodFlow.egresos
  const neto = roundMoney(ingresos - egresos)
  const margenNeto = ratioOverSales(neto, ingresos)

  const treasuryInflows = new Map<string, number>()
  for (const row of rows) {
    if (row.periodIn <= 0) continue
    treasuryInflows.set(
      row.name,
      roundMoney((treasuryInflows.get(row.name) ?? 0) + row.periodIn),
    )
  }

  const evolution = buildTreasuryDailyEvolutionPoints(dailyFlow, from, to)

  let tarjetasPorLiquidar = 0
  let tarjetasPorPagar = 0
  for (const row of rows) {
    if (!row.isActive) continue
    tarjetasPorLiquidar += row.toLiquidateBalance ?? 0
    tarjetasPorPagar += row.toPayBalance ?? 0
  }
  tarjetasPorLiquidar = roundMoney(tarjetasPorLiquidar)
  tarjetasPorPagar = roundMoney(tarjetasPorPagar)

  return {
    sectionId: "finance",
    title: "Finanzas",
    description: "Ingresos y egresos en cuentas de tesorería",
    comparison: [
      compareMetric(
        "in",
        "Ingresos",
        ingresos,
        0,
        "money",
        null,
        "No incluye cobros pendientes por terminales POS.",
      ),
      compareMetric(
        "out",
        "Egresos",
        egresos,
        0,
        "money",
        null,
        "No incluye pagos pendientes de tarjetas.",
      ),
      compareMetric("net", "Neto", neto, 0, "money"),
      compareMetric("margin", "Margen neto", margenNeto, 0, "percent"),
    ],
    evolution,
    hourlyEvolution: [],
    hourlyHeatmap: emptyHourlyHeatmap(),
    segments: buildSegments(treasuryInflows, 8),
    rankings: [],
    commitmentMetrics: [
      compareMetric(
        "cc-receivable",
        "Cuentas corrientes por cobrar",
        positiveDeudoraBalance(ccPorCobrar),
        0,
        "money",
      ),
      compareMetric(
        "cc-payable",
        "Cuentas corrientes por pagar",
        positiveAcreedoraBalance(ccPorPagar),
        0,
        "money",
      ),
      compareMetric(
        "card-receivable",
        "Terminales POS por liquidar",
        tarjetasPorLiquidar,
        0,
        "money",
      ),
      compareMetric(
        "card-payable",
        "Tarjetas por pagar",
        tarjetasPorPagar,
        0,
        "money",
      ),
      compareMetric(
        "check-receivable",
        "Cheques por cobrar",
        positiveDeudoraBalance(chequesPorCobrar),
        0,
        "money",
      ),
      compareMetric(
        "check-payable",
        "Cheques por pagar",
        positiveAcreedoraBalance(chequesPorPagar),
        0,
        "money",
      ),
    ],
    unavailable: [],
  }
}

const INVENTORY_OVERSTOCK_MULTIPLIER = 2
const INVENTORY_SUNBURST_MAX_ARTICLES_PER_CATEGORY = 8

type InventoryArticleSnapshot = {
  articleId: string
  name: string
  quantity: number
  minLevel: number | null
  unitCost: number
  inventoryValue: number
  stockLevel: "below_min" | "optimal" | "overstock" | "out_of_stock"
  itemKind: ArticleItemKind
  categoryId: string
  categoryName: string
}

function classifyInventoryStockLevel(
  quantity: number,
  minLevel: number | null,
): InventoryArticleSnapshot["stockLevel"] {
  if (quantity <= 0) return "out_of_stock"
  if (minLevel == null || minLevel <= 0) return "optimal"
  if (quantity < minLevel) return "below_min"
  if (quantity > minLevel * INVENTORY_OVERSTOCK_MULTIPLIER) return "overstock"
  return "optimal"
}

async function fetchInventoryArticleSnapshots(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  asOfDate: string | null,
): Promise<InventoryArticleSnapshot[]> {
  const { data: articles } = await supabase
    .from("articles")
    .select(
      "id, name, min_stock_level, track_stock, item_kind, category_id, categories(name)",
    )
    .eq("pop_id", popId)
    .eq("is_active", true)

  const tracked = (articles ?? []).filter((article) => article.track_stock)
  if (tracked.length === 0) return []

  const articleIds = tracked.map((article) => String(article.id))
  const { data: movements } = await supabase
    .from("inventory_movements")
    .select("article_id, quantity_delta, created_at")
    .eq("pop_id", popId)
    .in("article_id", articleIds)

  const onHand = new Map<string, number>()
  for (const movement of movements ?? []) {
    const movementDate = String(movement.created_at ?? "").slice(0, 10)
    if (asOfDate && movementDate > asOfDate) continue
    const articleId = String(movement.article_id)
    onHand.set(
      articleId,
      (onHand.get(articleId) ?? 0) + Number(movement.quantity_delta ?? 0),
    )
  }

  const unitCosts = await resolveArticleReferenceUnitCostsByArticleId(
    supabase,
    popId,
    articleIds,
  )

  return tracked.map((article) => {
    const articleId = String(article.id)
    const quantity = Math.round((onHand.get(articleId) ?? 0) * 1e6) / 1e6
    const minLevel =
      article.min_stock_level != null
        ? Number(article.min_stock_level)
        : null
    const unitCost = unitCosts.get(articleId) ?? 0
    const inventoryValue = roundMoney(Math.max(0, quantity) * unitCost)
    const rawKind = String(article.item_kind ?? "merchandise")
    const itemKind: ArticleItemKind = isArticleItemKind(rawKind)
      ? rawKind
      : "merchandise"
    const category = article.categories as { name?: string } | null

    return {
      articleId,
      name: String(article.name ?? "").trim() || "Artículo",
      quantity,
      minLevel,
      unitCost,
      inventoryValue,
      stockLevel: classifyInventoryStockLevel(quantity, minLevel),
      itemKind,
      categoryId: String(article.category_id ?? "sin-categoria"),
      categoryName: category?.name?.trim() || "Sin categoría",
    }
  })
}

function buildInventorySnapshotMetrics(
  snapshots: InventoryArticleSnapshot[],
): {
  inventoryValue: number
  unitsInStock: number
  lowStockArticles: number
  outOfStockArticles: number
} {
  let inventoryValue = 0
  let unitsInStock = 0
  let lowStockArticles = 0
  let outOfStockArticles = 0

  for (const snapshot of snapshots) {
    if (snapshot.stockLevel === "out_of_stock") {
      outOfStockArticles += 1
      continue
    }

    unitsInStock = roundMoney(unitsInStock + snapshot.quantity)
    inventoryValue = roundMoney(inventoryValue + snapshot.inventoryValue)
    if (snapshot.stockLevel === "below_min") {
      lowStockArticles += 1
    }
  }

  return {
    inventoryValue,
    unitsInStock,
    lowStockArticles,
    outOfStockArticles,
  }
}

function buildStockLevelDistribution(
  snapshots: InventoryArticleSnapshot[],
): StatisticsSegment[] {
  const counts = {
    below_min: 0,
    optimal: 0,
    overstock: 0,
  }

  for (const snapshot of snapshots) {
    if (snapshot.stockLevel === "out_of_stock") continue
    counts[snapshot.stockLevel] += 1
  }

  const total = counts.below_min + counts.optimal + counts.overstock
  if (total <= 0) return []

  const segments: StatisticsSegment[] = [
    {
      id: "below_min",
      label: "Bajo mínimo",
      value: counts.below_min,
      percent: roundMoney((counts.below_min / total) * 100),
    },
    {
      id: "optimal",
      label: "Óptimo",
      value: counts.optimal,
      percent: roundMoney((counts.optimal / total) * 100),
    },
    {
      id: "overstock",
      label: "Sobre-stock",
      value: counts.overstock,
      percent: roundMoney((counts.overstock / total) * 100),
    },
  ]

  return segments.filter((segment) => segment.value > 0)
}

function buildInventoryValueSunburst(
  snapshots: InventoryArticleSnapshot[],
): StatisticsSunburstNode | null {
  const valued = snapshots.filter((snapshot) => snapshot.inventoryValue > 0)
  if (valued.length === 0) return null

  const total = roundMoney(
    valued.reduce((acc, snapshot) => acc + snapshot.inventoryValue, 0),
  )
  if (total <= 0) return null

  type CategoryBucket = {
    categoryId: string
    label: string
    articles: InventoryArticleSnapshot[]
  }
  type KindBucket = {
    itemKind: ArticleItemKind
    label: string
    categories: Map<string, CategoryBucket>
  }

  const byKind = new Map<ArticleItemKind, KindBucket>()

  for (const snapshot of valued) {
    const kindBucket =
      byKind.get(snapshot.itemKind) ??
      ({
        itemKind: snapshot.itemKind,
        label: ARTICLE_ITEM_KIND_STOCK_LABEL[snapshot.itemKind],
        categories: new Map<string, CategoryBucket>(),
      } satisfies KindBucket)
    const categoryBucket =
      kindBucket.categories.get(snapshot.categoryId) ??
      ({
        categoryId: snapshot.categoryId,
        label: snapshot.categoryName,
        articles: [],
      } satisfies CategoryBucket)
    categoryBucket.articles.push(snapshot)
    kindBucket.categories.set(snapshot.categoryId, categoryBucket)
    byKind.set(snapshot.itemKind, kindBucket)
  }

  const kindNodes: StatisticsSunburstNode[] = [...byKind.values()]
    .map((kindBucket) => {
      const categoryNodes: StatisticsSunburstNode[] = [...kindBucket.categories.values()]
        .map((categoryBucket) => {
          const articleNodes: StatisticsSunburstNode[] = categoryBucket.articles
            .sort((a, b) => b.inventoryValue - a.inventoryValue)
            .slice(0, INVENTORY_SUNBURST_MAX_ARTICLES_PER_CATEGORY)
            .map((article) => ({
              id: `article:${article.articleId}`,
              label: article.name,
              value: article.inventoryValue,
            }))
          const categoryValue = roundMoney(
            articleNodes.reduce((acc, node) => acc + node.value, 0),
          )
          return {
            id: `category:${kindBucket.itemKind}:${categoryBucket.categoryId}`,
            label: categoryBucket.label,
            value: categoryValue,
            children: articleNodes,
          }
        })
        .filter((node) => node.value > 0)
        .sort((a, b) => b.value - a.value)

      const kindValue = roundMoney(
        categoryNodes.reduce((acc, node) => acc + node.value, 0),
      )
      return {
        id: `kind:${kindBucket.itemKind}`,
        label: kindBucket.label,
        value: kindValue,
        children: categoryNodes,
      }
    })
    .filter((node) => node.value > 0)
    .sort((a, b) => b.value - a.value)

  const displayedTotal = roundMoney(
    kindNodes.reduce((acc, node) => acc + node.value, 0),
  )
  if (displayedTotal <= 0) return null

  return {
    id: "inventory-total",
    label: "Inventario",
    value: displayedTotal,
    children: kindNodes,
  }
}

function buildInventoryMovementEvolutionPoints(
  metricsByDay: Map<string, { ingresos: number; egresos: number }>,
  from: string | null,
  to: string | null,
): StatisticsEvolutionPoint[] {
  const toPoint = (day: string): StatisticsEvolutionPoint => {
    const metrics = metricsByDay.get(day) ?? { ingresos: 0, egresos: 0 }
    return {
      label: `${day.slice(8, 10)}/${day.slice(5, 7)}`,
      value: roundMoney(metrics.ingresos),
      count: roundMoney(metrics.egresos),
    }
  }

  if (!from || !to) {
    return [...metricsByDay.keys()]
      .sort((a, b) => a.localeCompare(b))
      .map(toPoint)
  }

  const points: StatisticsEvolutionPoint[] = []
  let cursor = from
  while (cursor <= to) {
    points.push(toPoint(cursor))
    cursor = addCalendarDays(cursor, 1)
  }
  return points
}

async function fetchInventoryMovementEvolution(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  from: string | null,
  to: string | null,
): Promise<StatisticsEvolutionPoint[]> {
  const { data: movements } = await supabase
    .from("inventory_movements")
    .select("quantity_delta, created_at")
    .eq("pop_id", popId)

  const metricsByDay = new Map<string, { ingresos: number; egresos: number }>()

  for (const movement of movements ?? []) {
    const day = String(movement.created_at ?? "").slice(0, 10)
    if (from && day < from) continue
    if (to && day > to) continue

    const delta = Number(movement.quantity_delta ?? 0)
    if (delta === 0) continue

    const prev = metricsByDay.get(day) ?? { ingresos: 0, egresos: 0 }
    if (delta > 0) {
      prev.ingresos = roundMoney(prev.ingresos + delta)
    } else {
      prev.egresos = roundMoney(prev.egresos + Math.abs(delta))
    }
    metricsByDay.set(day, prev)
  }

  return buildInventoryMovementEvolutionPoints(metricsByDay, from, to)
}

async function buildInventorySection(
  popId: string,
  from: string | null,
  to: string | null,
  compareEnabled: boolean,
  previousPeriodEnd: string | null,
): Promise<StatisticsSectionData> {
  const supabase = await createClient()
  const [currentSnapshots, previousSnapshots, evolution] = await Promise.all([
    fetchInventoryArticleSnapshots(supabase, popId, to),
    compareEnabled
      ? fetchInventoryArticleSnapshots(supabase, popId, previousPeriodEnd)
      : Promise.resolve([] as InventoryArticleSnapshot[]),
    fetchInventoryMovementEvolution(supabase, popId, from, to),
  ])
  const currentSnapshot = buildInventorySnapshotMetrics(currentSnapshots)
  const previousSnapshot = compareEnabled
    ? buildInventorySnapshotMetrics(previousSnapshots)
    : {
        inventoryValue: 0,
        unitsInStock: 0,
        lowStockArticles: 0,
        outOfStockArticles: 0,
      }

  return {
    sectionId: "inventory",
    title: "Inventario",
    description: "Stock actual, alertas y concentración por artículo",
    comparison: [
      compareMetric(
        "value",
        "Valor del inventario",
        currentSnapshot.inventoryValue,
        compareEnabled ? previousSnapshot.inventoryValue : 0,
        "money",
      ),
      compareMetric(
        "units",
        "Unidades en stock",
        currentSnapshot.unitsInStock,
        compareEnabled ? previousSnapshot.unitsInStock : 0,
        "number",
      ),
      compareMetric(
        "low",
        "Artículos con stock bajo",
        currentSnapshot.lowStockArticles,
        compareEnabled ? previousSnapshot.lowStockArticles : 0,
        "number",
      ),
      compareMetric(
        "empty",
        "Artículos sin stock",
        currentSnapshot.outOfStockArticles,
        compareEnabled ? previousSnapshot.outOfStockArticles : 0,
        "number",
      ),
    ],
    evolution,
    hourlyEvolution: [],
    hourlyHeatmap: emptyHourlyHeatmap(),
    segments: [],
    rankings: [],
    stockLevelDistribution: buildStockLevelDistribution(currentSnapshots),
    inventoryValueSunburst: buildInventoryValueSunburst(currentSnapshots),
    unavailable: [],
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
    const purchasesFetchBounds = expandCalendarBoundsForOperationalFetch(from, to)
    const prevPurchasesFetchBounds = expandCalendarBoundsForOperationalFetch(
      prevBounds.from,
      prevBounds.to,
    )

    const [sales, prevSales, purchases, prevPurchases, income, prevIncome, dailyIncome, costDistribution] =
      await Promise.all([
        fetchAllSales(popId, salesFetchBounds.from, salesFetchBounds.to),
        compareEnabled
          ? fetchAllSales(
              popId,
              prevSalesFetchBounds.from,
              prevSalesFetchBounds.to,
            )
          : Promise.resolve([] as OperationSaleRow[]),
        sectionId === "purchases" || sectionId === "suppliers"
          ? fetchAllPurchases(
              popId,
              purchasesFetchBounds.from,
              purchasesFetchBounds.to,
            )
          : sectionId === "profitability"
            ? fetchAllPurchases(popId, from, to)
            : Promise.resolve([] as OperationPurchaseRow[]),
        compareEnabled &&
        (sectionId === "purchases" || sectionId === "suppliers")
          ? fetchAllPurchases(
              popId,
              prevPurchasesFetchBounds.from,
              prevPurchasesFetchBounds.to,
            )
          : Promise.resolve([] as OperationPurchaseRow[]),
        sectionId === "profitability"
          ? fetchIncomeTotals(popId, from, to)
          : Promise.resolve({ ingresos: 0, costos: 0, gastos: 0, resultado: 0, margen: 0 }),
        compareEnabled && sectionId === "profitability"
          ? fetchIncomeTotals(popId, prevBounds.from, prevBounds.to)
          : Promise.resolve({ ingresos: 0, costos: 0, gastos: 0, resultado: 0, margen: 0 }),
        sectionId === "profitability"
          ? fetchDailyIncomeTotals(popId, from, to)
          : Promise.resolve(new Map<string, DailyIncomeBucket>()),
        sectionId === "profitability"
          ? fetchCostDistributionByItemKind(popId, from, to)
          : Promise.resolve([] as StatisticsSegment[]),
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
    const filteredPurchases = filterPurchasesByOperationalPeriod(
      filterPurchases(purchases, filters),
      from,
      to,
      timeZone,
      operationalDayCloseTime,
    )
    const filteredPrevPurchases = filterPurchasesByOperationalPeriod(
      filterPurchases(prevPurchases, filters),
      prevBounds.from,
      prevBounds.to,
      timeZone,
      operationalDayCloseTime,
    )

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
          dailyIncome,
          costDistribution,
        )
        break
      case "products": {
        const buckets = new Map<string, ProductStatsBucket>()
        accumulateProductBucketsFromSales(filteredSales, buckets)
        await hydrateProductBucketsCosts(popId, buckets, from, to)

        const articleIds = [
          ...new Set(
            [...buckets.values()]
              .map((bucket) => bucket.articleId)
              .filter((id): id is string => Boolean(id)),
          ),
        ]
        const recipeIds = [
          ...new Set(
            [...buckets.values()]
              .map((bucket) => bucket.recipeId)
              .filter((id): id is string => Boolean(id)),
          ),
        ]
        const [articleCategories, recipeCategories] = await Promise.all([
          fetchArticleCategoriesById(popId, articleIds),
          fetchRecipeCategoriesById(popId, recipeIds),
        ])
        const categoryTotals = buildCategoryTotals(
          buckets,
          articleCategories,
          recipeCategories,
        )
        const currentCounts = sumProductQuantitiesByKind(filteredSales)
        const prevCounts = compareEnabled
          ? sumProductQuantitiesByKind(filteredPrevSales)
          : { articles: 0, promotions: 0, recipes: 0 }

        const productTrendByKey = buildAllProductDailyTrends(
          filteredSales,
          buckets,
          from,
          to,
          timeZone,
          operationalDayCloseTime,
        )
        const productTrendOptions = buildProductTrendOptions(buckets)
        const profitRankings = buildProductProfitRankings(buckets)
        const categoryTrendByKey = buildAllCategoryDailyTrends(
          filteredSales,
          buckets,
          articleCategories,
          recipeCategories,
          from,
          to,
          timeZone,
          operationalDayCloseTime,
        )
        const categoryTrendOptions = buildCategoryTrendOptions(categoryTotals)
        const defaultCategoryTrendKey = categoryTrendOptions[0]?.key ?? null

        data = buildProductsSection(
          buckets,
          categoryTotals,
          currentCounts,
          prevCounts,
          compareEnabled,
          productTrendOptions,
          productTrendByKey,
          profitRankings[0]?.id ?? null,
          categoryTrendOptions,
          categoryTrendByKey,
          defaultCategoryTrendKey,
        )
        break
      }
      case "purchases": {
        const articleIds = [
          ...new Set(
            filteredPurchases.flatMap((purchase) =>
              purchase.lineItems
                .map((line) => line.articleId)
                .filter((id): id is string => Boolean(id)),
            ),
          ),
        ]
        const articleKindById = await fetchArticleItemKindsById(popId, articleIds)
        data = buildPurchasesSection(
          filteredPurchases,
          filteredPrevPurchases,
          from,
          to,
          compareEnabled,
          buildPurchaseDistributionByItemKind(
            filteredPurchases,
            articleKindById,
          ),
          timeZone,
          operationalDayCloseTime,
        )
        break
      }
      case "clients":
        data = await buildClientsSection(
          popId,
          filteredSales,
          filteredPrevSales,
          compareEnabled,
          from,
          to,
          timeZone,
          operationalDayCloseTime,
        )
        break
      case "suppliers":
        data = await buildSuppliersSection(
          popId,
          filteredPurchases,
          filteredPrevPurchases,
          compareEnabled,
          from,
          to,
          timeZone,
          operationalDayCloseTime,
        )
        break
      case "finance":
        data = await buildFinanceSection(
          popId,
          from,
          to,
          timeZone,
          operationalDayCloseTime,
        )
        break
      case "inventory":
        data = await buildInventorySection(
          popId,
          from,
          to,
          compareEnabled,
          prevBounds.to,
        )
        break
      default:
        data = buildPlaceholderSection(sectionId)
    }

    return { success: true, data: { ...data, operationalDayCloseTime } }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
