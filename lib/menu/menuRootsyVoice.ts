import type {
  MenuRootsyBusinessInsights,
  MenuRootsyGrowthOpportunity,
} from "@/lib/menu/menuRootsyInsightsShared"

export function formatMenuRootsyMoney(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 10_000) {
    return `$${Math.round(value / 1000)}k`
  }
  return `$${Math.round(value).toLocaleString("es-AR")}`
}

export function insightsHasDisplayableData(
  insights: MenuRootsyBusinessInsights,
): boolean {
  return (
    (insights.totalSales != null && insights.totalSales > 0) ||
    insights.grossMarginPercent != null ||
    (insights.avgTicket != null && insights.avgTicket > 0) ||
    insights.peakHourLabel != null ||
    insights.topProfitProduct != null ||
    insights.topVolumeProduct != null
  )
}

const META_GENERIC_PATTERNS = [
  /escucho el pulso/i,
  /en los n[uú]meros hay/i,
  /no hace falta adivinar/i,
  /mirar con calma/i,
  /repaso .+ con lo que tengo/i,
  /llevo un tiempo acompa[nñ]ando/i,
  /conozco el ritmo/i,
  /hay algo interesante en tus n[uú]meros/i,
  /en estad[ií]sticas hay pistas/i,
  /podemos descubrir juntos/i,
  /afinar horarios y mix en estad/i,
]

export function isMetaGenericVoice(text: string): boolean {
  return META_GENERIC_PATTERNS.some((pattern) => pattern.test(text))
}

export function textContainsNumericData(text: string): boolean {
  return /\d/.test(text)
}

function slowVsPeakPercent(
  slow: number,
  peak: number,
): number | null {
  if (peak <= 0) return null
  return Math.round((1 - slow / peak) * 100)
}

/** Una sola recomendación accionable con datos — sin meta ni preámbulos. */
export function buildGuaranteedMetricOpportunity(
  insights: MenuRootsyBusinessInsights,
  popName: string,
): MenuRootsyGrowthOpportunity | null {
  if (!insightsHasDisplayableData(insights)) return null

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
    return {
      id: "promo_slow_hours",
      voice: `Los ${insights.todayWeekdayLabel}s entre ${insights.slowHourLabel} y ${insights.peakHourLabel} cae el movimiento${dropHint}. Probá una promo acotada en ese valle — 2x1 o combo — sin tocar el pico de ${insights.peakHourLabel}.`,
      ctaModuleKeys: ["promotions", "statistics"],
    }
  }

  if (
    marginProduct &&
    volumeProduct &&
    marginProduct.label.trim().toLowerCase() !==
      volumeProduct.label.trim().toLowerCase()
  ) {
    const profitHint =
      marginProduct.profit > 0
        ? ` (deja ~${formatMenuRootsyMoney(marginProduct.profit)} de ganancia)`
        : ""
    return {
      id: "push_high_margin",
      voice: `${marginProduct.label} rinde más que ${volumeProduct.label}${profitHint}, aunque no sea lo más vendido. Ponelo más visible en mostrador o armá un combo que lo empuje.`,
      ctaModuleKeys: ["promotions", "statistics"],
    }
  }

  if (insights.peakHourLabel && marginProduct) {
    const peakHint =
      insights.peakHourAvgSales != null && insights.peakHourAvgSales > 0
        ? ` (~${formatMenuRootsyMoney(insights.peakHourAvgSales)}/h)`
        : ""
    return {
      id: "peak_hour_focus",
      voice: `Los ${insights.todayWeekdayLabel}s el pico cae cerca de ${insights.peakHourLabel}${peakHint}. Priorizá ${marginProduct.label} en mostrador en esa franja — es lo que más margen deja.`,
      ctaModuleKeys: ["statistics", "promotions"],
    }
  }

  if (insights.avgTicket != null && insights.avgTicket > 0) {
    const bump = Math.max(
      300,
      Math.round(insights.avgTicket * 0.12 / 100) * 100,
    )
    return {
      id: "raise_ticket",
      voice: `Tu ticket promedio ${insights.periodLabel} es ${formatMenuRootsyMoney(insights.avgTicket)}. Sugerí un add-on o combo de ~${formatMenuRootsyMoney(bump)} en mostrador para subir cada venta sin traer gente nueva.`,
      ctaModuleKeys: ["promotions", "statistics"],
    }
  }

  if (
    insights.grossMarginPercent != null &&
    insights.grossMarginDeltaPoints != null &&
    insights.grossMarginDeltaPoints <= -2
  ) {
    return {
      id: "review_margin",
      voice: `El margen bruto bajó ${Math.abs(insights.grossMarginDeltaPoints).toFixed(1)} pts este mes (quedó en ${insights.grossMarginPercent.toFixed(0)}%). Revisá precio o costo de tus 3 productos más vendidos antes de seguir empujándolos.`,
      ctaModuleKeys: ["statistics", "reports"],
    }
  }

  if (insights.grossMarginPercent != null && marginProduct) {
    return {
      id: "mix_margin",
      voice: `Con margen bruto de ${insights.grossMarginPercent.toFixed(0)}% ${insights.periodLabel}, empujá ${marginProduct.label} en mostrador y bajá protagonismo a lo que menos deja.`,
      ctaModuleKeys: ["statistics", "promotions"],
    }
  }

  if (
    insights.totalSales != null &&
    insights.totalSales > 0 &&
    insights.salesDeltaPercent != null &&
    insights.salesDeltaPercent <= -8
  ) {
    return {
      id: "explore_statistics",
      voice: `Las ventas cayeron ${Math.abs(insights.salesDeltaPercent).toFixed(0)}% vs el mes pasado (${formatMenuRootsyMoney(insights.totalSales)} ${insights.periodLabel}). Revisá qué días u horarios se enfriaron y ajustá promo o mix ahí.`,
      ctaModuleKeys: ["statistics", "promotions"],
    }
  }

  if (
    insights.totalSales != null &&
    insights.totalSales > 0 &&
    insights.salesDeltaPercent != null &&
    insights.salesDeltaPercent >= 12
  ) {
    const repeatHint = insights.peakHourLabel
      ? ` Refuerzá ${insights.peakHourLabel} los ${insights.todayWeekdayLabel}s.`
      : ""
    return {
      id: "explore_statistics",
      voice: `Vas ${insights.salesDeltaPercent.toFixed(0)}% arriba (${formatMenuRootsyMoney(insights.totalSales)} ${insights.periodLabel}). Repetí el mix y horario que empujaron eso.${repeatHint}`,
      ctaModuleKeys: ["statistics"],
    }
  }

  if (insights.totalSales != null && insights.totalSales > 0) {
    return {
      id: "explore_statistics",
      voice: `${formatMenuRootsyMoney(insights.totalSales)} vendidos ${insights.periodLabel} en ${popName}. Abrí Estadísticas y compará ticket vs margen por producto — ahí suele estar la palanca más clara.`,
      ctaModuleKeys: ["statistics"],
    }
  }

  return null
}
