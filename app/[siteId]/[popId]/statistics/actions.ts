import type { StatisticsSectionId } from "@/lib/statisticsCatalog"

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
