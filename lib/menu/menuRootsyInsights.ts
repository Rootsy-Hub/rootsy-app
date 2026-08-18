import "server-only"

import { getStatisticsSectionData } from "@/app/[siteId]/[popId]/statistics/actions"
import type { PopAccessModule } from "@/app/home/homeUserDataTypes"
import {
  type MenuRootsyBusinessInsights,
  type MenuRootsyGrowthOpportunity,
  type MenuRootsyProductInsight,
} from "@/lib/menu/menuRootsyInsightsShared"
import { buildGuaranteedMetricOpportunity, formatMenuRootsyMoney, isMetaGenericVoice } from "@/lib/menu/menuRootsyVoice"
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

function finalizeGrowthOpportunities(
  partial: Omit<MenuRootsyBusinessInsights, "opportunities">,
  opportunities: MenuRootsyGrowthOpportunity[],
): MenuRootsyGrowthOpportunity[] {
  const actionable = opportunities.filter(
    (entry) => !isMetaGenericVoice(entry.voice),
  )
  const guaranteed = buildGuaranteedMetricOpportunity({
    ...partial,
    opportunities: [],
  })

  if (actionable.length === 0) {
    return guaranteed ? [guaranteed] : actionable
  }

  const hasBusinessNumbers = actionable.some((entry) =>
    /\$|%|\d/.test(entry.voice),
  )
  if (!hasBusinessNumbers && guaranteed) {
    return [guaranteed, ...actionable]
  }

  return actionable
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
  return formatMenuRootsyMoney(value)
}

function slowVsPeakPercent(slow: number, peak: number): number | null {
  if (peak <= 0) return null
  return Math.round((1 - slow / peak) * 100)
}

function buildGrowthOpportunities(
  insights: Omit<MenuRootsyBusinessInsights, "opportunities">,
): MenuRootsyGrowthOpportunity[] {
  const opportunities: MenuRootsyGrowthOpportunity[] = []
  const marginProduct =
    insights.hiddenGemProduct ?? insights.topProfitProduct
  const volumeProduct = insights.topVolumeProduct

  if (
    insights.slowHourLabel &&
    insights.peakHourLabel &&
    insights.peakHourAvgSales != null &&
    insights.slowHourAvgSales != null &&
    insights.peakHourAvgSales >= insights.slowHourAvgSales * 1.35
  ) {
    const drop = slowVsPeakPercent(
      insights.slowHourAvgSales,
      insights.peakHourAvgSales,
    )
    const dropHint = drop != null && drop > 0 ? ` (~${drop}% menos que en el pico)` : ""
    opportunities.push({
      id: "promo_slow_hours",
      voice: `Los ${insights.todayWeekdayLabel}s entre ${insights.slowHourLabel} y ${insights.peakHourLabel} cae el movimiento${dropHint}. Probá una promo acotada en ese valle — 2x1 o combo — sin tocar el pico de ${insights.peakHourLabel}.`,
      ctaModuleKeys: ["promotions", "statistics"],
    })
  }

  if (insights.peakHourLabel && marginProduct) {
    const peakHint =
      insights.peakHourAvgSales != null && insights.peakHourAvgSales > 0
        ? ` (~${formatMoney(insights.peakHourAvgSales)}/h)`
        : ""
    opportunities.push({
      id: "peak_hour_focus",
      voice: `Los ${insights.todayWeekdayLabel}s el pico cae cerca de ${insights.peakHourLabel}${peakHint}. Priorizá ${marginProduct.label} en mostrador en esa franja — es lo que más margen deja.`,
      ctaModuleKeys: ["statistics", "promotions"],
    })
  } else if (insights.peakHourLabel) {
    const peakHint =
      insights.peakHourAvgSales != null && insights.peakHourAvgSales > 0
        ? ` (~${formatMoney(insights.peakHourAvgSales)}/h)`
        : ""
    opportunities.push({
      id: "peak_hour_focus",
      voice: `Los ${insights.todayWeekdayLabel}s el pico cae cerca de ${insights.peakHourLabel}${peakHint}. Refuerzá personal y stock en esa hora antes de buscar más tráfico.`,
      ctaModuleKeys: ["statistics", "promotions"],
    })
  }

  if (
    marginProduct &&
    volumeProduct &&
    marginProduct.label.trim().toLowerCase() !==
      volumeProduct.label.trim().toLowerCase()
  ) {
    const profitHint =
      marginProduct.profit > 0
        ? ` (deja ~${formatMoney(marginProduct.profit)} de ganancia)`
        : ""
    opportunities.push({
      id: "push_high_margin",
      voice: `${marginProduct.label} rinde más que ${volumeProduct.label}${profitHint}, aunque no sea lo más vendido. Ponelo más visible en mostrador o armá un combo que lo empuje.`,
      ctaModuleKeys: ["promotions", "statistics"],
    })
  } else if (marginProduct) {
    opportunities.push({
      id: "push_high_margin",
      voice: `${marginProduct.label} es lo más rentable ${insights.periodLabel}. Ponelo al frente del mostrador o en la primera fila del menú.`,
      ctaModuleKeys: ["statistics", "promotions"],
    })
  }

  if (insights.avgTicket != null && insights.avgTicket > 0) {
    const bump = Math.max(
      300,
      Math.round(insights.avgTicket * 0.12 / 100) * 100,
    )
    opportunities.push({
      id: "raise_ticket",
      voice: `Tu ticket promedio ${insights.periodLabel} es ${formatMoney(insights.avgTicket)}. Sugerí un add-on o combo de ~${formatMoney(bump)} en mostrador para subir cada venta.`,
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
        voice: `El margen bruto bajó ${Math.abs(insights.grossMarginDeltaPoints).toFixed(1)} pts este mes (quedó en ${insights.grossMarginPercent.toFixed(0)}%). Revisá precio o costo de tus 3 productos más vendidos.`,
        ctaModuleKeys: ["statistics", "reports"],
      })
    } else if (marginProduct) {
      opportunities.push({
        id: "mix_margin",
        voice: `Con margen bruto de ${insights.grossMarginPercent.toFixed(0)}% ${insights.periodLabel}, empujá ${marginProduct.label} y bajá protagonismo a lo que menos deja.`,
        ctaModuleKeys: ["statistics", "promotions"],
      })
    }
  }

  if (insights.hasSalesData && insights.salesDeltaPercent != null) {
    if (insights.salesDeltaPercent <= -8 && insights.totalSales != null) {
      opportunities.push({
        id: "explore_statistics",
        voice: `Las ventas cayeron ${Math.abs(insights.salesDeltaPercent).toFixed(0)}% vs el mes pasado (${formatMoney(insights.totalSales)} ${insights.periodLabel}). Revisá qué días u horarios se enfriaron y ajustá promo o mix ahí.`,
        ctaModuleKeys: ["statistics", "promotions"],
      })
    } else if (insights.salesDeltaPercent >= 12 && insights.totalSales != null) {
      const repeatHint = insights.peakHourLabel
        ? ` Refuerzá ${insights.peakHourLabel} los ${insights.todayWeekdayLabel}s.`
        : ""
      opportunities.push({
        id: "explore_statistics",
        voice: `Vas ${insights.salesDeltaPercent.toFixed(0)}% arriba (${formatMoney(insights.totalSales)} ${insights.periodLabel}). Repetí el mix y horario que empujaron eso.${repeatHint}`,
        ctaModuleKeys: ["statistics"],
      })
    }
  }

  return opportunities
}

async function loadMenuRootsyBusinessInsightsUncached(
  popId: string,
  _enabledModules: readonly PopAccessModule[],
  popName: string,
  now: Date = new Date(),
): Promise<MenuRootsyBusinessInsights> {
  const weekdayLabel = MENU_ROOTSY_DAY_NAMES[now.getDay()] ?? "hoy"

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
  const totalSales = metricValue(salesMetrics, "total")

  const partial: Omit<MenuRootsyBusinessInsights, "opportunities"> = {
    periodLabel: "este mes",
    hasSalesData: Boolean(salesData && totalSales != null),
    hasProductData: Boolean(productsData && productsData.unavailable.length === 0),
    hasProfitData: Boolean(profitData && profitData.unavailable.length === 0),
    totalSales,
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
    opportunities: finalizeGrowthOpportunities(
      partial,
      buildGrowthOpportunities(partial),
    ),
  }
}

/** Snapshot analítico liviano para Rootsy — cacheado por POP y día. */
export async function loadMenuRootsyBusinessInsights(
  popId: string,
  enabledModules: readonly PopAccessModule[],
  popName: string,
): Promise<MenuRootsyBusinessInsights> {
  const dateBucket = new Date().toISOString().slice(0, 10)
  const cached = unstable_cache(
    () =>
      loadMenuRootsyBusinessInsightsUncached(
        popId,
        enabledModules,
        popName,
        new Date(),
      ),
    ["menu-rootsy-insights", popId, dateBucket],
    { revalidate: INSIGHTS_CACHE_SECONDS },
  )
  return cached()
}
