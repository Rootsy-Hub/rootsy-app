import { shortUnitOfMeasure } from "@/lib/articleItemKind"

export type StockShortage = {
  articleId?: string
  articleName: string
  sources: string[]
  needed: number
  onHand: number
  unitOfMeasure?: string | null
}

function formatQty(n: number): string {
  const t = Math.round(n * 1e6) / 1e6
  if (Number.isInteger(t)) return t.toLocaleString("es-AR")
  return t.toLocaleString("es-AR", { maximumFractionDigits: 6 })
}

function formatQtyWithUnit(n: number, unitOfMeasure?: string | null): string {
  const qty = formatQty(n)
  const unit = shortUnitOfMeasure(unitOfMeasure)
  return unit ? `${qty} ${unit}` : qty
}

function distinctSources(articleName: string, sources: string[]): string[] {
  const name = articleName.trim()
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of sources) {
    const source = raw.trim()
    if (!source || source === name) continue
    const key = source.toLocaleLowerCase("es")
    if (seen.has(key)) continue
    seen.add(key)
    out.push(source)
  }
  return out
}

function formatSourcesSuffix(sources: string[]): string {
  if (sources.length === 0) return ""
  if (sources.length === 1) return ` para «${sources[0]}»`
  if (sources.length === 2) {
    return ` para «${sources[0]}» y «${sources[1]}»`
  }
  const head = sources
    .slice(0, -1)
    .map((source) => `«${source}»`)
    .join(", ")
  return ` para ${head} y «${sources[sources.length - 1]}»`
}

function availabilityPhrase(
  onHand: number,
  unitOfMeasure?: string | null,
): string {
  if (onHand <= 1e-6) return "no queda nada"
  return `hay ${formatQtyWithUnit(onHand, unitOfMeasure)}`
}

function formatShortageDetail(item: StockShortage): string {
  const needed = formatQtyWithUnit(item.needed, item.unitOfMeasure)
  const available = availabilityPhrase(item.onHand, item.unitOfMeasure)
  return `hace falta ${needed} y ${available}`
}

function formatShortageSentence(item: StockShortage): string {
  const article = item.articleName.trim() || "Insumo"
  const sources = distinctSources(article, item.sources)
  const detail = formatShortageDetail(item)
  return `No hay stock suficiente de «${article}»${formatSourcesSuffix(sources)}. ${detail.charAt(0).toUpperCase()}${detail.slice(1)}.`
}

function formatShortageCompact(item: StockShortage): string {
  const article = item.articleName.trim() || "Insumo"
  const sources = distinctSources(article, item.sources)
  return `«${article}»${formatSourcesSuffix(sources)}: ${formatShortageDetail(item)}`
}

export function isStockShortageMessage(error: string): boolean {
  return (
    error.includes("No hay stock suficiente") ||
    error.includes("sin stock suficiente") ||
    error.includes("El stock cambió mientras se cobraba")
  )
}

export function parseStockShortageBody(body: unknown): {
  shortages: StockShortage[]
  code?: string
} {
  if (!body || typeof body !== "object") return { shortages: [] }
  const row = body as {
    code?: unknown
    shortages?: unknown
  }
  const code = typeof row.code === "string" ? row.code : undefined
  if (!Array.isArray(row.shortages)) return { shortages: [], code }
  const shortages: StockShortage[] = []
  for (const item of row.shortages) {
    if (!item || typeof item !== "object") continue
    const raw = item as Record<string, unknown>
    const articleName = String(raw.articleName ?? "").trim()
    const needed = Number(raw.needed)
    const onHand = Number(raw.onHand)
    if (!articleName || !Number.isFinite(needed) || !Number.isFinite(onHand)) {
      continue
    }
    const sources = Array.isArray(raw.sources)
      ? raw.sources.map((source) => String(source)).filter(Boolean)
      : []
    const articleId = String(raw.articleId ?? "").trim()
    shortages.push({
      articleId: articleId || undefined,
      articleName,
      sources,
      needed,
      onHand,
      unitOfMeasure:
        raw.unitOfMeasure == null ? null : String(raw.unitOfMeasure),
    })
  }
  return { shortages, code }
}

export function formatStockShortageMessage(shortages: StockShortage[]): string {
  if (shortages.length === 0) {
    return "No hay stock suficiente para completar el cobro."
  }
  if (shortages.length === 1) {
    return formatShortageSentence(shortages[0]!)
  }
  const lines = shortages.map((item) => `• ${formatShortageCompact(item)}`)
  return `Hay ${shortages.length} artículos sin stock suficiente.\n${lines.join("\n")}`
}
