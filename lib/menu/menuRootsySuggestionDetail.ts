import type { MenuRootsyBusinessInsights } from "@/lib/menu/menuRootsyInsightsShared"
import type { MenuRootsyCatalogSuggestion } from "@/lib/menu/menuRootsySuggestionCatalogTypes"
import { formatMenuRootsyMoney } from "@/lib/menu/menuRootsyVoice"

function formatExamplesParagraph(
  popName: string,
  insights: MenuRootsyBusinessInsights | null,
  dataKeys: MenuRootsyCatalogSuggestion["dataKeys"],
): string | null {
  if (!insights || dataKeys.length === 0) return null

  const lines: string[] = []

  for (const key of dataKeys) {
    switch (key) {
      case "total_sales":
        if (insights.totalSales != null && insights.totalSales > 0) {
          lines.push(
            `En ${popName} registraste ${formatMenuRootsyMoney(insights.totalSales)} vendidos ${insights.periodLabel}.`,
          )
        }
        break
      case "sales_delta":
        if (insights.salesDeltaPercent != null && Math.abs(insights.salesDeltaPercent) >= 3) {
          const dir = insights.salesDeltaPercent >= 0 ? "arriba" : "abajo"
          lines.push(
            `Las ventas van ${Math.abs(insights.salesDeltaPercent).toFixed(0)}% ${dir} respecto al mes pasado.`,
          )
        }
        break
      case "avg_ticket":
        if (insights.avgTicket != null && insights.avgTicket > 0) {
          lines.push(
            `Tu ticket promedio ${insights.periodLabel} es ${formatMenuRootsyMoney(insights.avgTicket)}.`,
          )
        }
        break
      case "gross_margin":
        if (insights.grossMarginPercent != null) {
          lines.push(
            `El margen bruto ${insights.periodLabel} ronda ${insights.grossMarginPercent.toFixed(0)}%.`,
          )
        }
        break
      case "peak_hour":
        if (insights.peakHourLabel) {
          const extra =
            insights.peakHourAvgSales != null && insights.peakHourAvgSales > 0
              ? ` (~${formatMenuRootsyMoney(insights.peakHourAvgSales)}/h)`
              : ""
          lines.push(
            `El movimiento fuerte cae los ${insights.todayWeekdayLabel}s cerca de ${insights.peakHourLabel}${extra}.`,
          )
        }
        break
      case "slow_hour":
        if (insights.slowHourLabel && insights.peakHourLabel) {
          lines.push(
            `Entre ${insights.slowHourLabel} y ${insights.peakHourLabel} suele haber más calma.`,
          )
        }
        break
      case "top_volume_product":
        if (insights.topVolumeProduct) {
          lines.push(
            `Lo más vendido ${insights.periodLabel}: ${insights.topVolumeProduct.label}.`,
          )
        }
        break
      case "top_profit_product":
        if (insights.topProfitProduct) {
          lines.push(
            `Lo más rentable ${insights.periodLabel}: ${insights.topProfitProduct.label}.`,
          )
        }
        break
      case "hidden_gem_product":
        if (insights.hiddenGemProduct) {
          lines.push(
            `${insights.hiddenGemProduct.label} rinde bien aunque no sea lo más pedido.`,
          )
        }
        break
    }
  }

  if (lines.length === 0) return null

  const unique = [...new Set(lines)]
  return `Con lo que veo en ${popName}: ${unique.join(" ")}`
}

export function buildMenuRootsySuggestionDetailExamples(
  popName: string,
  suggestion: MenuRootsyCatalogSuggestion,
  insights: MenuRootsyBusinessInsights | null,
): string {
  const fromData = formatExamplesParagraph(popName, insights, suggestion.dataKeys)
  if (fromData) return fromData

  return `Todavía no tengo suficientes ventas ${insights?.periodLabel ?? "este mes"} en ${popName} para armar un ejemplo numérico. Igual podés aplicar la idea y medir el impacto en los próximos días.`
}
