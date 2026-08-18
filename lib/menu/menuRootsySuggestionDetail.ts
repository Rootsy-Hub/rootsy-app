import type { MenuRootsyBusinessInsights } from "@/lib/menu/menuRootsyInsightsShared"
import type {
  MenuRootsyCatalogSuggestion,
  MenuRootsySuggestionDataKey,
} from "@/lib/menu/menuRootsySuggestionCatalogTypes"
import { formatMenuRootsyMoney } from "@/lib/menu/menuRootsyVoice"

function suggestTicketBump(ticket: number): number {
  return Math.max(300, Math.round(ticket * 0.12 / 100) * 100)
}

function buildDataLine(
  key: MenuRootsySuggestionDataKey,
  popName: string,
  insights: MenuRootsyBusinessInsights,
): string | null {
  const period = insights.periodLabel

  switch (key) {
    case "total_sales":
      if (insights.totalSales == null || insights.totalSales <= 0) return null
      return `En ${popName} llevás ${formatMenuRootsyMoney(insights.totalSales)} vendidos ${period}. Tomalo como línea base: si la mejora funciona, ese total debería subir en las próximas semanas.`

    case "sales_delta":
      if (
        insights.salesDeltaPercent == null ||
        Math.abs(insights.salesDeltaPercent) < 3
      ) {
        return null
      }
      if (insights.salesDeltaPercent < 0) {
        return `Las ventas van ${Math.abs(insights.salesDeltaPercent).toFixed(0)}% abajo respecto al mes pasado. Con ese contexto, conviene probar el cambio ya y ver si frena la caída.`
      }
      return `Las ventas van ${insights.salesDeltaPercent.toFixed(0)}% arriba respecto al mes pasado. Repetí lo que funcionó y sumá esta mejora para no depender de la suerte.`

    case "avg_ticket":
      if (insights.avgTicket == null || insights.avgTicket <= 0) return null
      const bump = suggestTicketBump(insights.avgTicket)
      return `Tu ticket promedio ${period} es ${formatMenuRootsyMoney(insights.avgTicket)}. Sumar un add-on de ~${formatMenuRootsyMoney(bump)} en cada venta puede mover el mes sin traer gente nueva.`

    case "gross_margin":
      if (insights.grossMarginPercent == null) return null
      if (
        insights.grossMarginDeltaPoints != null &&
        insights.grossMarginDeltaPoints <= -2
      ) {
        return `El margen bruto ${period} está en ${insights.grossMarginPercent.toFixed(0)}% (bajó ${Math.abs(insights.grossMarginDeltaPoints).toFixed(1)} pts). Priorizá lo rentable esta semana y mirá si la cifra se estabiliza.`
      }
      return `El margen bruto ${period} ronda ${insights.grossMarginPercent.toFixed(0)}%. Empujar lo que más deja — y aflojar lo que come margen — es la palanca más directa sobre ese número.`

    case "peak_hour":
      if (!insights.peakHourLabel) return null
      const peakExtra =
        insights.peakHourAvgSales != null && insights.peakHourAvgSales > 0
          ? ` (~${formatMenuRootsyMoney(insights.peakHourAvgSales)}/h)`
          : ""
      return `Los ${insights.todayWeekdayLabel}s el movimiento fuerte cae cerca de ${insights.peakHourLabel}${peakExtra}. Ese tramo es donde aplicar la idea tiene más impacto inmediato.`

    case "slow_hour":
      if (!insights.slowHourLabel || !insights.peakHourLabel) return null
      return `Entre ${insights.slowHourLabel} y ${insights.peakHourLabel} suele haber más calma. Es el hueco ideal para probar la promo o el cambio sin tocar la hora pico.`

    case "top_volume_product":
      if (!insights.topVolumeProduct) return null
      return `${insights.topVolumeProduct.label} es lo más vendido ${period}. Usalo como ancla visible cuando pruebes la mejora — la gente ya lo conoce.`

    case "top_profit_product":
      if (!insights.topProfitProduct) return null
      return `${insights.topProfitProduct.label} es lo que más margen deja ${period}. Ponelo al frente en mostrador o en la recomendación del día esta semana.`

    case "hidden_gem_product":
      if (!insights.hiddenGemProduct) return null
      return `${insights.hiddenGemProduct.label} rinde bien aunque no sea lo más pedido. Probarlo como sugerencia del día es un test rápido y de bajo riesgo.`

    default:
      return null
  }
}

const NO_DATA_FALLBACK =
  "Todavía no hay ventas suficientes este mes para armar un ejemplo con números. Igual podés probar la idea y comparar cómo va la semana contra la anterior."

export function buildMenuRootsySuggestionDetailExamples(
  popName: string,
  suggestion: MenuRootsyCatalogSuggestion,
  insights: MenuRootsyBusinessInsights | null,
): string {
  if (!insights || suggestion.dataKeys.length === 0) {
    return NO_DATA_FALLBACK
  }

  const lines: string[] = []
  const seen = new Set<string>()

  for (const key of suggestion.dataKeys) {
    const line = buildDataLine(key, popName, insights)
    if (!line || seen.has(line)) continue
    seen.add(line)
    lines.push(line)
    if (lines.length >= 2) break
  }

  if (lines.length === 0) {
    return NO_DATA_FALLBACK
  }

  return lines.join(" ")
}
