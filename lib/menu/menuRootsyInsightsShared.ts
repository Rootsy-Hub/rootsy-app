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

export const MENU_ROOTSY_FALLBACK_GROWTH_TIPS: MenuRootsyGrowthOpportunity[] = [
  {
    id: "explore_statistics",
    voice:
      "Vivo acá abajo y aprendo el pulso de este negocio todos los días. En los números hay respuestas sobre qué horarios y qué productos te conviene cuidar — no hace falta adivinar.",
    ctaModuleKeys: ["statistics"],
  },
  {
    id: "promo_slow_hours",
    voice:
      "A veces el negocio no necesita más gente: necesita la promo en el momento justo. Cuando el movimiento baja, una buena oferta en ese tramo puede despertar lo que ya está cerca.",
    ctaModuleKeys: ["promotions", "statistics"],
  },
  {
    id: "push_high_margin",
    voice:
      "Lo que más sale no siempre es lo que más te deja. Yo lo veo en el fondo de los números — y empujar un poco lo rentable suele cambiar el mes sin trabajar más.",
    ctaModuleKeys: ["statistics", "promotions"],
  },
  {
    id: "raise_ticket",
    voice:
      "Un combo bien pensado o una sugerencia en mostrador pueden subir el ticket sin traer un cliente nuevo. Es una de las palancas más nobles que conozco.",
    ctaModuleKeys: ["promotions", "statistics"],
  },
  {
    id: "mix_margin",
    voice:
      "El crecimiento no siempre es vender más unidades. A veces es vender mejor: más de lo que rinde, menos de lo que come margen. Eso también lo respira un negocio sano.",
    ctaModuleKeys: ["statistics"],
  },
]
