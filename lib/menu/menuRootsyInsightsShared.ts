export type MenuRootsyGrowthOpportunityId =
  | "promo_slow_hours"
  | "push_high_margin"
  | "peak_hour_focus"
  | "raise_ticket"
  | "mix_margin"
  | "review_margin"
  | "explore_statistics"

export type MenuRootsyGrowthOpportunity = {
  id: MenuRootsyGrowthOpportunityId
  /** Lo que Rootsy dice, en primera persona — sin títulos ni bullets. */
  voice: string
  ctaModuleKeys: string[]
}

export type MenuRootsyProductInsight = {
  label: string
  profit: number
  revenueSharePercent?: number
}

export type MenuRootsyBusinessInsights = {
  periodLabel: string
  hasSalesData: boolean
  hasProductData: boolean
  hasProfitData: boolean
  totalSales: number | null
  salesDeltaPercent: number | null
  avgTicket: number | null
  grossMarginPercent: number | null
  grossMarginDeltaPoints: number | null
  todayWeekdayLabel: string
  peakHourLabel: string | null
  peakHourAvgSales: number | null
  slowHourLabel: string | null
  slowHourAvgSales: number | null
  topProfitProduct: MenuRootsyProductInsight | null
  topVolumeProduct: MenuRootsyProductInsight | null
  hiddenGemProduct: MenuRootsyProductInsight | null
  opportunities: MenuRootsyGrowthOpportunity[]
}

export function emptyMenuRootsyBusinessInsights(
  weekdayLabel = "hoy",
): MenuRootsyBusinessInsights {
  return {
    periodLabel: "este mes",
    hasSalesData: false,
    hasProductData: false,
    hasProfitData: false,
    totalSales: null,
    salesDeltaPercent: null,
    avgTicket: null,
    grossMarginPercent: null,
    grossMarginDeltaPoints: null,
    todayWeekdayLabel: weekdayLabel,
    peakHourLabel: null,
    peakHourAvgSales: null,
    slowHourLabel: null,
    slowHourAvgSales: null,
    topProfitProduct: null,
    topVolumeProduct: null,
    hiddenGemProduct: null,
    opportunities: [],
  }
}

export function menuRootsyInsightsCacheFingerprint(
  insights: MenuRootsyBusinessInsights,
): string {
  const salesBucket =
    insights.totalSales == null
      ? "na"
      : insights.totalSales <= 0
        ? "0"
        : insights.totalSales <= 50000
          ? "low"
          : insights.totalSales <= 500000
            ? "mid"
            : "high"

  const marginBucket =
    insights.grossMarginPercent == null
      ? "na"
      : `${Math.round(insights.grossMarginPercent)}`

  const peakBucket = insights.peakHourLabel ?? "na"
  const oppCount = insights.opportunities.length

  return `${salesBucket}|${marginBucket}|${peakBucket}|${oppCount}`
}

export function pickMenuRootsyGrowthOpportunity(
  opportunities: MenuRootsyGrowthOpportunity[],
  seed: string,
): MenuRootsyGrowthOpportunity | null {
  if (opportunities.length === 0) return null

  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }

  return opportunities[hash % opportunities.length]
}

export function menuRootsyGrowthRotationSeed(
  popId: string,
  date: Date = new Date(),
): string {
  return `${popId}:${date.toISOString().slice(0, 10)}`
}

export const MENU_ROOTSY_FALLBACK_GROWTH_TIPS: MenuRootsyGrowthOpportunity[] = []
