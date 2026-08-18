import type { MenuRootsyBusinessInsights } from "@/lib/menu/menuRootsyInsightsShared"
import type {
  MenuRootsyCatalogSuggestion,
  MenuRootsySuggestionDataKey,
} from "@/lib/menu/menuRootsySuggestionCatalogTypes"
import { formatMenuRootsyMoney } from "@/lib/menu/menuRootsyVoice"

function suggestTicketBump(ticket: number): number {
  return Math.max(300, Math.round(ticket * 0.12 / 100) * 100)
}

function voiceHash(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash
}

function pickVariant<T>(seed: string, variants: readonly T[]): T {
  return variants[voiceHash(seed) % variants.length]!
}

function lowercaseFirst(text: string): string {
  if (!text) return text
  return text.charAt(0).toLowerCase() + text.slice(1)
}

function ensurePeriod(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return trimmed
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

/** ¿Hay dato cargado para esta clave? */
export function insightHasDataForKey(
  insights: MenuRootsyBusinessInsights,
  key: MenuRootsySuggestionDataKey,
): boolean {
  switch (key) {
    case "total_sales":
      return insights.totalSales != null && insights.totalSales > 0
    case "sales_delta":
      return (
        insights.salesDeltaPercent != null &&
        Math.abs(insights.salesDeltaPercent) >= 3
      )
    case "avg_ticket":
      return insights.avgTicket != null && insights.avgTicket > 0
    case "gross_margin":
      return insights.grossMarginPercent != null
    case "peak_hour":
      return insights.peakHourLabel != null
    case "slow_hour":
      return (
        insights.slowHourLabel != null && insights.peakHourLabel != null
      )
    case "top_volume_product":
      return insights.topVolumeProduct != null
    case "top_profit_product":
      return insights.topProfitProduct != null
    case "hidden_gem_product":
      return insights.hiddenGemProduct != null
    default:
      return false
  }
}

export function scoreSuggestionDataSupport(
  suggestion: MenuRootsyCatalogSuggestion,
  insights: MenuRootsyBusinessInsights | null | undefined,
): number {
  if (!insights || suggestion.dataKeys.length === 0) return 0
  let score = 0
  for (const key of suggestion.dataKeys) {
    if (insightHasDataForKey(insights, key)) score++
  }
  return score
}

const BUBBLE_WITH_DATA = [
  (pop: string, body: string) =>
    `En ${pop}, con lo que vi en tus números, ${body}`,
  (pop: string, body: string) =>
    `Pasando por ${pop} me quedó dando vueltas esto: ${body}`,
  (pop: string, body: string) =>
    `${ensurePeriod(body)} Creo que en ${pop} puede rendir bien esta semana.`,
  (pop: string, body: string) =>
    `Vi el movimiento de ${pop} y me acordé: ${body}`,
  (pop: string, body: string) =>
    `Algo que en ${pop} suele sumar: ${body}`,
  (pop: string, body: string) =>
    `Con el ritmo que lleva ${pop}, ${body}`,
  (pop: string, body: string) =>
    `${ensurePeriod(body)} En ${pop} lo veo encajar con lo que está pasando.`,
  (pop: string, body: string) =>
    `Revisando ${pop}, ${body}`,
  (pop: string, body: string) =>
    `En ${pop} hay espacio para esto: ${body}`,
  (pop: string, body: string) =>
    `${ensurePeriod(body)} Me parece oportuno para ${pop} ahora.`,
] as const

const BUBBLE_WITHOUT_DATA = [
  (pop: string, body: string) =>
    `En ${pop} probá esto cuando puedas: ${body}`,
  (pop: string, body: string) =>
    `${ensurePeriod(body)} En ${pop} lo veo funcionar seguido.`,
  (pop: string, body: string) =>
    `Un detalle chico para ${pop}: ${body}`,
  (pop: string, body: string) =>
    `Si tenés un rato en ${pop}, ${body}`,
  (pop: string, body: string) =>
    `${ensurePeriod(body)} Creo que le puede venir bien a ${pop}.`,
  (pop: string, body: string) =>
    `En el día a día de ${pop}, ${body}`,
  (pop: string, body: string) =>
    `Algo simple que suma en ${pop}: ${body}`,
  (pop: string, body: string) =>
    `${ensurePeriod(body)} Vale la pena probarlo en ${pop}.`,
  (pop: string, body: string) =>
    `Con lo que conozco de ${pop}, ${body}`,
  (pop: string, body: string) =>
    `Para la semana en ${pop}: ${body}`,
] as const

const DETAIL_INTRO = [
  (pop: string, explanation: string) =>
    `En ${pop}, ${lowercaseFirst(explanation)}`,
  (pop: string, explanation: string) =>
    `${explanation} Me parece especialmente útil en ${pop}.`,
  (pop: string, explanation: string) =>
    `Pensando en cómo opera ${pop}, ${lowercaseFirst(explanation)}`,
  (pop: string, explanation: string) =>
    `${explanation} En ${pop} creo que encaja con el ritmo actual.`,
  (pop: string, explanation: string) =>
    `Con lo que hace ${pop} día a día, ${lowercaseFirst(explanation)}`,
  (pop: string, explanation: string) =>
    `${explanation} Lo veo aplicable en ${pop} sin complicarte.`,
  (pop: string, explanation: string) =>
    `Para ${pop}, ${lowercaseFirst(explanation)}`,
  (pop: string, explanation: string) =>
    `${explanation} En ${pop} puede marcar diferencia sin mucho esfuerzo.`,
  (pop: string, explanation: string) =>
    `En el contexto de ${pop}, ${lowercaseFirst(explanation)}`,
  (pop: string, explanation: string) =>
    `${explanation} Me cierra para ${pop} por cómo está moviéndose.`,
] as const

const DETAIL_DATA_BRIDGE = [
  (pop: string, period: string, joined: string) =>
    `Revisando ${period} en ${pop}: ${joined}. Por eso te lo marco ahora — probalo esta semana y fijate si se mueve el número.`,
  (pop: string, period: string, joined: string) =>
    `Los números de ${period} en ${pop} muestran que ${joined}. Ahí está la pista para actuar.`,
  (pop: string, period: string, joined: string) =>
    `Con lo que tengo de ${period} en ${pop}, ${joined}. Encaja bien con esta idea — dale unos días y mirá si responde.`,
  (pop: string, period: string, joined: string) =>
    `${pop} ${period} ${joined}. Por eso creo que esta semana es buen momento para probarlo.`,
  (pop: string, period: string, joined: string) =>
    `Viendo ${period} en ${pop}, ${joined}. Eso es lo que me hizo pensar en esto.`,
  (pop: string, period: string, joined: string) =>
    `En ${pop}, ${period} ${joined}. Si lo aplicás ahora, vas a poder medir el impacto pronto.`,
  (pop: string, period: string, joined: string) =>
    `${joined.charAt(0).toUpperCase()}${joined.slice(1)} — así viene ${pop} ${period}. Vale la pena intentarlo.`,
  (pop: string, period: string, joined: string) =>
    `Lo que más me llamó la atención de ${pop} ${period}: ${joined}. De ahí sale esta sugerencia.`,
] as const

const DETAIL_NO_DATA = [
  (pop: string) =>
    `En ${pop} todavía me faltan números frescos para armarte un ejemplo fino, pero igual me parece una buena apuesta. Probalo unos días y contame cómo te va.`,
  (pop: string) =>
    `No tengo mucho dato reciente de ${pop} para afinar el ejemplo, pero la idea sigue valiendo. Dale una semana y vemos si se nota.`,
  (pop: string) =>
    `Cuando ${pop} acumule más movimiento voy a poder ser más preciso; por ahora confío en que esto puede sumar. Probalo y vemos.`,
  (pop: string) =>
    `Sin muchos números nuevos de ${pop} no puedo ser hiper específico, pero me gusta la apuesta. Intentálo y fijate cómo responde.`,
  (pop: string) =>
    `A ${pop} le falta un poco más de historial para un ejemplo cerrado, pero la lógica cierra. Probalo esta semana y contame.`,
  (pop: string) =>
    `Todavía estoy conociendo el pulso de ${pop}, pero esto suele funcionar. Dale unos días y vemos juntos si rinde.`,
] as const

const EMPTY_POP_LEADS = [
  (pop: string) =>
    `Sigo acompañando ${pop}. Cuando haya más movimiento cargado, voy a poder contarte cosas más afinadas.`,
  (pop: string) =>
    `Acá sigo en ${pop} — en cuanto entren más ventas, las ideas van a salir con más detalle.`,
  (pop: string) =>
    `${pop} todavía está arrancando en mis números. Apenas haya más data, te traigo sugerencias más concretas.`,
] as const

/** Burbuja — voz variada, sin fórmulas repetidas. */
export function formatRootsyBubbleLead(
  teaser: string,
  popName: string,
  dataBacked: boolean,
  suggestionId: string,
  rotationToken: string,
): string {
  const body = lowercaseFirst(teaser.trim())
  const seed = `${suggestionId}:${rotationToken}:bubble:${dataBacked ? "data" : "plain"}`
  const variants = dataBacked ? BUBBLE_WITH_DATA : BUBBLE_WITHOUT_DATA
  return pickVariant(seed, variants)(popName, body)
}

/** Fallback cuando no hay sugerencias elegibles. */
export function formatRootsyEmptyPopLead(
  popName: string,
  rotationToken: string,
): string {
  const seed = `${popName}:${rotationToken}:empty`
  return pickVariant(seed, EMPTY_POP_LEADS)(popName)
}

function buildDataSnippet(
  key: MenuRootsySuggestionDataKey,
  insights: MenuRootsyBusinessInsights,
): string | null {
  const period = insights.periodLabel

  switch (key) {
    case "total_sales":
      if (insights.totalSales == null || insights.totalSales <= 0) return null
      return `llevan ${formatMenuRootsyMoney(insights.totalSales)} vendidos ${period}`

    case "sales_delta":
      if (
        insights.salesDeltaPercent == null ||
        Math.abs(insights.salesDeltaPercent) < 3
      ) {
        return null
      }
      if (insights.salesDeltaPercent < 0) {
        return `las ventas van ${Math.abs(insights.salesDeltaPercent).toFixed(0)}% abajo respecto al mes pasado`
      }
      return `van ${insights.salesDeltaPercent.toFixed(0)}% arriba respecto al mes pasado — hay buen viento`

    case "avg_ticket":
      if (insights.avgTicket == null || insights.avgTicket <= 0) return null
      const bump = suggestTicketBump(insights.avgTicket)
      return `el ticket promedio ${period} ronda ${formatMenuRootsyMoney(insights.avgTicket)}; con un add-on de ~${formatMenuRootsyMoney(bump)} por venta ya se nota`

    case "gross_margin":
      if (insights.grossMarginPercent == null) return null
      if (
        insights.grossMarginDeltaPoints != null &&
        insights.grossMarginDeltaPoints <= -2
      ) {
        return `el margen bruto está en ${insights.grossMarginPercent.toFixed(0)}% (bajó ${Math.abs(insights.grossMarginDeltaPoints).toFixed(1)} pts ${period})`
      }
      return `el margen bruto ${period} ronda ${insights.grossMarginPercent.toFixed(0)}%`

    case "peak_hour":
      if (!insights.peakHourLabel) return null
      const peakExtra =
        insights.peakHourAvgSales != null && insights.peakHourAvgSales > 0
          ? `, con picos de ~${formatMenuRootsyMoney(insights.peakHourAvgSales)}/h`
          : ""
      return `los ${insights.todayWeekdayLabel}s el movimiento fuerte cae cerca de ${insights.peakHourLabel}${peakExtra}`

    case "slow_hour":
      if (!insights.slowHourLabel || !insights.peakHourLabel) return null
      return `entre ${insights.slowHourLabel} y ${insights.peakHourLabel} suele haber más calma`

    case "top_volume_product":
      if (!insights.topVolumeProduct) return null
      return `lo más vendido ${period} es ${insights.topVolumeProduct.label}`

    case "top_profit_product":
      if (!insights.topProfitProduct) return null
      return `lo que más margen deja ${period} es ${insights.topProfitProduct.label}`

    case "hidden_gem_product":
      if (!insights.hiddenGemProduct) return null
      return `${insights.hiddenGemProduct.label} rinde bien aunque no sea lo más pedido`

    default:
      return null
  }
}

function collectDataSnippets(
  suggestion: MenuRootsyCatalogSuggestion,
  insights: MenuRootsyBusinessInsights,
  max = 2,
): string[] {
  const out: string[] = []
  const seen = new Set<string>()

  for (const key of suggestion.dataKeys) {
    const snippet = buildDataSnippet(key, insights)
    if (!snippet || seen.has(snippet)) continue
    seen.add(snippet)
    out.push(snippet)
    if (out.length >= max) break
  }

  return out
}

/** Panel “Ver más” — mensaje único, cálido y distinto a la burbuja. */
export function buildMenuRootsyDetailMessage(
  popName: string,
  suggestion: MenuRootsyCatalogSuggestion,
  insights: MenuRootsyBusinessInsights | null,
): { message: string; hasDataSupport: boolean } {
  const explanation = suggestion.explanation.trim()
  const introSeed = `${suggestion.id}:detail:intro`
  const paragraphs: string[] = [
    pickVariant(introSeed, DETAIL_INTRO)(popName, explanation),
  ]

  if (insights && suggestion.dataKeys.length > 0) {
    const snippets = collectDataSnippets(suggestion, insights)
    if (snippets.length > 0) {
      const period = insights.periodLabel
      const joined =
        snippets.length === 1
          ? snippets[0]
          : `${snippets[0]}; y ${snippets[1]}`
      const bridgeSeed = `${suggestion.id}:detail:data`
      paragraphs.push(
        pickVariant(bridgeSeed, DETAIL_DATA_BRIDGE)(popName, period, joined),
      )
      return {
        message: paragraphs.join("\n\n"),
        hasDataSupport: true,
      }
    }
  }

  const fallbackSeed = `${suggestion.id}:detail:fallback`
  paragraphs.push(pickVariant(fallbackSeed, DETAIL_NO_DATA)(popName))

  return {
    message: paragraphs.join("\n\n"),
    hasDataSupport: false,
  }
}
