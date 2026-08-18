import "server-only"

import { getStatisticsSectionData } from "@/app/[siteId]/[popId]/statistics/actions"
import type { PopAccessModule } from "@/app/home/homeUserDataTypes"
import {
  emptyMenuRootsyBusinessInsights,
  type MenuRootsyBusinessInsights,
  type MenuRootsyGrowthOpportunity,
  type MenuRootsyProductInsight,
} from "@/lib/menu/menuRootsyInsightsShared"
import { MENU_ROOTSY_DAY_NAMES } from "@/lib/menu/menuRootsySignalsShared"
import { computeSummaryDateBounds } from "@/lib/summaryDateFilter"
import { unstable_cache } from "next/cache"

const EMPTY_FILTERS = {
  channel: null,
  seller: null,
  client: null,
  supplier: null,
  product: null,
  category: null,
  paymentMethod: null,
} as const

const INSIGHTS_CACHE_SECONDS = 3600

function hasReadModule(
  enabledModules: readonly PopAccessModule[],
  keys: string[],
): boolean {
  return keys.some((key) =>
    enabledModules.some((mod) => mod.key === key && mod.permissions?.read),
  )
}

function jsToIsoWeekdayKey(day: number): string {
  return String(day === 0 ? 7 : day)
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function metricValue(
  metrics: Array<{ id: string; value: number }>,
  id: string,
): number | null {
  const match = metrics.find((entry) => entry.id === id)
  return match?.value ?? null
}

function metricDeltaPercent(
  metrics: Array<{ id: string; deltaPercent: number | null }>,
  id: string,
): number | null {
  const match = metrics.find((entry) => entry.id === id)
  return match?.deltaPercent ?? null
}

function deriveHourlyPatterns(
  heatmap: {
    hours: Array<{ slot: number; label: string }>
    cells: Array<{ dayKey: string; hourSlot: number; value: number }>
  },
  weekdayKey: string,
): {
  peakHourLabel: string | null
  peakHourAvgSales: number | null
  slowHourLabel: string | null
  slowHourAvgSales: number | null
} {
  const cells = heatmap.cells.filter(
    (cell) => cell.dayKey === weekdayKey && cell.value > 0,
  )
  if (cells.length === 0) {
    return {
      peakHourLabel: null,
      peakHourAvgSales: null,
      slowHourLabel: null,
      slowHourAvgSales: null,
    }
  }

  const sorted = [...cells].sort((a, b) => b.value - a.value)
  const peak = sorted[0]
  const peakHourLabel =
    heatmap.hours.find((hour) => hour.slot === peak.hourSlot)?.label ?? null

  const average =
    cells.reduce((sum, cell) => sum + cell.value, 0) / cells.length
  const slowCandidates = cells.filter(
    (cell) => cell.hourSlot !== peak.hourSlot && cell.value <= average * 0.55,
  )
  const slow = [...slowCandidates].sort((a, b) => a.value - b.value)[0]

  return {
    peakHourLabel,
    peakHourAvgSales: roundMoney(peak.value),
    slowHourLabel: slow
      ? heatmap.hours.find((hour) => hour.slot === slow.hourSlot)?.label ?? null
      : null,
    slowHourAvgSales: slow ? roundMoney(slow.value) : null,
  }
}

function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString("es-AR")}`
}

function buildGrowthOpportunities(
  insights: Omit<MenuRootsyBusinessInsights, "opportunities">,
): MenuRootsyGrowthOpportunity[] {
  const opportunities: MenuRootsyGrowthOpportunity[] = []

  if (insights.peakHourLabel) {
    opportunities.push({
      id: "peak_hour_focus",
      voice: `Conozco el ritmo de acá abajo. Los ${insights.todayWeekdayLabel}s, cerca de ${insights.peakHourLabel}, es cuando más respira el negocio — ahí conviene tener listo lo que más margen deja, sin necesidad de más tráfico.`,
      ctaModuleKeys: ["statistics", "promotions"],
    })
  }

  if (
    insights.slowHourLabel &&
    insights.peakHourLabel &&
    insights.peakHourAvgSales != null &&
    insights.slowHourAvgSales != null &&
    insights.peakHourAvgSales >= insights.slowHourAvgSales * 1.5
  ) {
    opportunities.push({
      id: "promo_slow_hours",
      voice: `Entre ${insights.slowHourLabel} y ${insights.peakHourLabel} los ${insights.todayWeekdayLabel}s el movimiento se afloja — lo siento en el piso. Una promo en ese valle puede levantar el día sin pelear con el horario fuerte.`,
      ctaModuleKeys: ["promotions", "statistics"],
    })
  }

  const marginProduct =
    insights.hiddenGemProduct ?? insights.topProfitProduct
  const volumeProduct = insights.topVolumeProduct
  if (
    marginProduct &&
    volumeProduct &&
    marginProduct.label.trim().toLowerCase() !==
      volumeProduct.label.trim().toLowerCase()
  ) {
    opportunities.push({
      id: "push_high_margin",
      voice: `Veo algo lindo en tus números: ${marginProduct.label} te deja más ganancia que ${volumeProduct.label}, aunque no sea lo más vendido. Un empujón en mostrador — o una promo bien pensada — puede mover la aguja.`,
      ctaModuleKeys: ["promotions", "statistics"],
    })
  } else if (marginProduct) {
    opportunities.push({
      id: "push_high_margin",
      voice: `${marginProduct.label} es lo que más margen te deja ${insights.periodLabel}. Lo tengo presente desde acá abajo: merece un poco más de protagonismo.`,
      ctaModuleKeys: ["statistics", "promotions"],
    })
  }

  if (insights.avgTicket != null && insights.avgTicket > 0) {
    opportunities.push({
      id: "raise_ticket",
      voice: `Tu ticket promedio ${insights.periodLabel} ronda ${formatMoney(insights.avgTicket)}. No siempre hace falta más clientes — a veces alcanza con un combo o una sugerencia en mostrador que suba un poquito cada venta.`,
      ctaModuleKeys: ["promotions", "statistics"],
    })
  }

  if (insights.grossMarginPercent != null && insights.hasProfitData) {
    if (
      insights.grossMarginDeltaPoints != null &&
      insights.grossMarginDeltaPoints <= -2
    ) {
      opportunities.push({
        id: "review_margin",
        voice: `El margen bruto se afinó un poco este mes — bajó ${Math.abs(insights.grossMarginDeltaPoints).toFixed(1)} puntos vs el anterior. No es drama, pero conviene mirar el mix y los costos antes de que se haga costumbre.`,
        ctaModuleKeys: ["statistics", "reports"],
      })
    } else {
      opportunities.push({
        id: "mix_margin",
        voice: `Con ${insights.grossMarginPercent.toFixed(0)}% de margen bruto ${insights.periodLabel}, el salto más honesto que veo es vender más de lo rentable y un poco menos de lo que come margen. El negocio ya tiene buena base.`,
        ctaModuleKeys: ["statistics"],
      })
    }
  }

  if (insights.hasSalesData && insights.salesDeltaPercent != null) {
    if (insights.salesDeltaPercent <= -8) {
      opportunities.push({
        id: "explore_statistics",
        voice: `Las ventas van ${Math.abs(insights.salesDeltaPercent).toFixed(0)}% abajo vs el mes pasado — lo noto en el aire. Antes de apurarse, vale la pena ver en qué horarios o productos se enfría, y actuar con calma.`,
        ctaModuleKeys: ["statistics"],
      })
    } else if (insights.salesDeltaPercent >= 12) {
      opportunities.push({
        id: "explore_statistics",
        voice: `Vas ${insights.salesDeltaPercent.toFixed(0)}% arriba vs el mes pasado. Eso me hace feliz desde acá abajo. Mirá qué horarios y productos empujaron eso — repetir la fórmula es crecer con inteligencia.`,
        ctaModuleKeys: ["statistics"],
      })
    }
  }

  if (
    insights.hasSalesData &&
    !opportunities.some((entry) => entry.id === "explore_statistics")
  ) {
    opportunities.push({
      id: "explore_statistics",
      voice: `Llevo un tiempo respirando este negocio ${insights.periodLabel}. En los números hay pistas sobre horarios pico, productos rentables y dónde ajustar el mix — cuando quieras las miramos juntos.`,
      ctaModuleKeys: ["statistics"],
    })
  }

  return opportunities
}

async function loadMenuRootsyBusinessInsightsUncached(
  popId: string,
  enabledModules: readonly PopAccessModule[],
  now: Date = new Date(),
): Promise<MenuRootsyBusinessInsights> {
  const weekdayLabel = MENU_ROOTSY_DAY_NAMES[now.getDay()] ?? "hoy"
  const base = emptyMenuRootsyBusinessInsights(weekdayLabel)

  const canSales = hasReadModule(enabledModules, ["sale"])
  if (!canSales) {
    return base
  }

  const { from, to } = computeSummaryDateBounds("this_month", undefined)
  const weekdayKey = jsToIsoWeekdayKey(now.getDay())

  const [salesRes, productsRes, profitRes] = await Promise.all([
    getStatisticsSectionData({
      popId,
      sectionId: "sales",
      preset: "this_month",
      from,
      to,
      compareEnabled: true,
      filters: EMPTY_FILTERS,
    }),
    getStatisticsSectionData({
      popId,
      sectionId: "products",
      preset: "this_month",
      from,
      to,
      compareEnabled: false,
      filters: EMPTY_FILTERS,
    }),
    getStatisticsSectionData({
      popId,
      sectionId: "profitability",
      preset: "this_month",
      from,
      to,
      compareEnabled: true,
      filters: EMPTY_FILTERS,
    }),
  ])

  const salesData = salesRes.success ? salesRes.data : null
  const productsData = productsRes.success ? productsRes.data : null
  const profitData = profitRes.success ? profitRes.data : null

  const hourly = salesData
    ? deriveHourlyPatterns(salesData.hourlyHeatmap, weekdayKey)
    : {
        peakHourLabel: null,
        peakHourAvgSales: null,
        slowHourLabel: null,
        slowHourAvgSales: null,
      }

  const profitRankings = productsData?.rankings ?? []
  const salesRankings = productsData?.productSalesRankings ?? []

  const topProfitProduct: MenuRootsyProductInsight | null = profitRankings[0]
    ? {
        label: profitRankings[0].label,
        profit: profitRankings[0].value,
      }
    : null

  const topVolumeProduct: MenuRootsyProductInsight | null = salesRankings[0]
    ? {
        label: salesRankings[0].label,
        profit: 0,
        revenueSharePercent: salesRankings[0].value,
      }
    : null

  const topVolumeLabels = new Set(
    salesRankings.slice(0, 3).map((row) => row.label.trim().toLowerCase()),
  )
  const hiddenGemRow = profitRankings
    .slice(1, 8)
    .find((row) => !topVolumeLabels.has(row.label.trim().toLowerCase()))
  const hiddenGemProduct: MenuRootsyProductInsight | null = hiddenGemRow
    ? { label: hiddenGemRow.label, profit: hiddenGemRow.value }
    : null

  const salesMetrics = salesData?.comparison ?? []
  const marginMetric = profitData?.efficiencyRatios?.find(
    (entry) => entry.id === "margin-on-sales",
  )

  const partial: Omit<MenuRootsyBusinessInsights, "opportunities"> = {
    periodLabel: "este mes",
    hasSalesData: Boolean(salesData && salesData.unavailable.length === 0),
    hasProductData: Boolean(productsData && productsData.unavailable.length === 0),
    hasProfitData: Boolean(profitData && profitData.unavailable.length === 0),
    totalSales: metricValue(salesMetrics, "total"),
    salesDeltaPercent: metricDeltaPercent(salesMetrics, "total"),
    avgTicket: metricValue(salesMetrics, "ticket"),
    grossMarginPercent: marginMetric?.value ?? null,
    grossMarginDeltaPoints: marginMetric?.deltaPoints ?? null,
    todayWeekdayLabel: weekdayLabel,
    peakHourLabel: hourly.peakHourLabel,
    peakHourAvgSales: hourly.peakHourAvgSales,
    slowHourLabel: hourly.slowHourLabel,
    slowHourAvgSales: hourly.slowHourAvgSales,
    topProfitProduct,
    topVolumeProduct,
    hiddenGemProduct,
  }

  return {
    ...partial,
    opportunities: buildGrowthOpportunities(partial),
  }
}

/** Snapshot analítico liviano para Rootsy — cacheado por POP y día. */
export async function loadMenuRootsyBusinessInsights(
  popId: string,
  enabledModules: readonly PopAccessModule[],
): Promise<MenuRootsyBusinessInsights> {
  const dateBucket = new Date().toISOString().slice(0, 10)
  const cached = unstable_cache(
    () =>
      loadMenuRootsyBusinessInsightsUncached(
        popId,
        enabledModules,
        new Date(),
      ),
    ["menu-rootsy-insights", popId, dateBucket],
    { revalidate: INSIGHTS_CACHE_SECONDS },
  )
  return cached()
}
