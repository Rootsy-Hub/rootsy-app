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
  (body: string) => `Con lo que vi en tus números, ${body}`,
  (body: string) => `Me quedó dando vueltas esto: ${body}`,
  (body: string) =>
    `${ensurePeriod(body)} Creo que puede rendir bien esta semana.`,
  (body: string) => `Vi el movimiento reciente y me acordé: ${body}`,
  (body: string) => `Algo que suele sumar acá: ${body}`,
  (body: string) => `Con el ritmo que venís llevando, ${body}`,
  (body: string) =>
    `${ensurePeriod(body)} Lo veo encajar con lo que está pasando.`,
  (body: string) => `Revisando tus ventas, ${body}`,
  (body: string) => `Hay espacio para probar esto: ${body}`,
  (body: string) => `${ensurePeriod(body)} Me parece oportuno ahora.`,
] as const

const BUBBLE_WITHOUT_DATA = [
  (body: string) => `Probá esto cuando puedas: ${body}`,
  (body: string) => `${ensurePeriod(body)} Lo veo funcionar seguido.`,
  (body: string) => `Un detalle chico que suma: ${body}`,
  (body: string) => `Si tenés un rato, ${body}`,
  (body: string) => `${ensurePeriod(body)} Creo que te puede venir bien.`,
  (body: string) => `En el día a día, ${body}`,
  (body: string) => `Algo simple para esta semana: ${body}`,
  (body: string) => `${ensurePeriod(body)} Vale la pena probarlo.`,
  (body: string) => `Con lo que conozco del rubro, ${body}`,
  (body: string) => `Para la semana: ${body}`,
] as const

const DETAIL_INTRO = [
  (explanation: string) => explanation,
  (explanation: string) =>
    `${explanation} Me parece especialmente útil ahora.`,
  (explanation: string) =>
    `Pensando en cómo viene la semana, ${lowercaseFirst(explanation)}`,
  (explanation: string) =>
    `${explanation} Creo que encaja con el ritmo actual.`,
  (explanation: string) =>
    `Con lo que pasa día a día, ${lowercaseFirst(explanation)}`,
  (explanation: string) =>
    `${explanation} Lo veo aplicable sin complicarte.`,
  (explanation: string) => lowercaseFirst(explanation),
  (explanation: string) =>
    `${explanation} Puede marcar diferencia sin mucho esfuerzo.`,
  (explanation: string) =>
    `En este contexto, ${lowercaseFirst(explanation)}`,
  (explanation: string) =>
    `${explanation} Me cierra por cómo venís moviéndote.`,
] as const

const DETAIL_DATA_BRIDGE = [
  (_period: string, joined: string) =>
    `Revisando ${_period}: ${joined}. Por eso te lo marco ahora — probalo esta semana y fijate si se mueve el número.`,
  (_period: string, joined: string) =>
    `Los números de ${_period} muestran que ${joined}. Ahí está la pista para actuar.`,
  (_period: string, joined: string) =>
    `Con lo que tengo de ${_period}, ${joined}. Encaja bien con esta idea — dale unos días y mirá si responde.`,
  (_period: string, joined: string) =>
    `${_period.charAt(0).toUpperCase()}${_period.slice(1)} ${joined}. Por eso creo que esta semana es buen momento para probarlo.`,
  (_period: string, joined: string) =>
    `Viendo ${_period}, ${joined}. Eso es lo que me hizo pensar en esto.`,
  (_period: string, joined: string) =>
    `${_period.charAt(0).toUpperCase()}${_period.slice(1)}: ${joined}. Si lo aplicás ahora, vas a poder medir el impacto pronto.`,
  (_period: string, joined: string) =>
    `${joined.charAt(0).toUpperCase()}${joined.slice(1)} — así viene ${_period}. Vale la pena intentarlo.`,
  (_period: string, joined: string) =>
    `Lo que más me llamó la atención ${_period}: ${joined}. De ahí sale esta sugerencia.`,
] as const

const DETAIL_NO_DATA = [
  () =>
    `Todavía me faltan números frescos para armarte un ejemplo fino, pero igual me parece una buena apuesta. Probalo unos días y contame cómo te va.`,
  () =>
    `No tengo mucho dato reciente para afinar el ejemplo, pero la idea sigue valiendo. Dale una semana y vemos si se nota.`,
  () =>
    `Cuando acumules más movimiento voy a poder ser más preciso; por ahora confío en que esto puede sumar. Probalo y vemos.`,
  () =>
    `Sin muchos números nuevos no puedo ser hiper específico, pero me gusta la apuesta. Intentálo y fijate cómo responde.`,
  () =>
    `Falta un poco más de historial para un ejemplo cerrado, pero la lógica cierra. Probalo esta semana y contame.`,
  () =>
    `Todavía estoy conociendo el pulso del negocio, pero esto suele funcionar. Dale unos días y vemos juntos si rinde.`,
] as const

const EMPTY_POP_LEADS = [
  () =>
    `Sigo acá. Cuando haya más movimiento cargado, voy a poder contarte cosas más afinadas.`,
  () =>
    `En cuanto entren más ventas, las ideas van a salir con más detalle.`,
  () =>
    `Todavía estoy armando el panorama. Apenas haya más data, te traigo sugerencias más concretas.`,
] as const

/** Burbuja — voz variada, sin nombrar el negocio. */
export function formatRootsyBubbleLead(
  teaser: string,
  dataBacked: boolean,
  suggestionId: string,
  rotationToken: string,
): string {
  const body = lowercaseFirst(teaser.trim())
  const seed = `${suggestionId}:${rotationToken}:bubble:${dataBacked ? "data" : "plain"}`
  const variants = dataBacked ? BUBBLE_WITH_DATA : BUBBLE_WITHOUT_DATA
  return pickVariant(seed, variants)(body)
}

/** Fallback cuando no hay sugerencias elegibles. */
export function formatRootsyEmptyPopLead(rotationToken: string): string {
  const seed = `${rotationToken}:empty`
  return pickVariant(seed, EMPTY_POP_LEADS)()
}

function buildDataSnippet(
  key: MenuRootsySuggestionDataKey,
  insights: MenuRootsyBusinessInsights,
): string | null {
  const period = insights.periodLabel

  switch (key) {
    case "total_sales":
      if (insights.totalSales == null || insights.totalSales <= 0) return null
      return `van ${formatMenuRootsyMoney(insights.totalSales)} vendidos ${period}`

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

/** Panel “Ver más” — mensaje único, sin nombrar el negocio. */
export function buildMenuRootsyDetailMessage(
  suggestion: MenuRootsyCatalogSuggestion,
  insights: MenuRootsyBusinessInsights | null,
): { message: string; hasDataSupport: boolean } {
  const explanation = suggestion.explanation.trim()
  const introSeed = `${suggestion.id}:detail:intro`
  const paragraphs: string[] = [
    pickVariant(introSeed, DETAIL_INTRO)(explanation),
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
        pickVariant(bridgeSeed, DETAIL_DATA_BRIDGE)(period, joined),
      )
      return {
        message: paragraphs.join("\n\n"),
        hasDataSupport: true,
      }
    }
  }

  const fallbackSeed = `${suggestion.id}:detail:fallback`
  paragraphs.push(pickVariant(fallbackSeed, DETAIL_NO_DATA)())

  return {
    message: paragraphs.join("\n\n"),
    hasDataSupport: false,
  }
}
