import {
  findArcaIvaAlicuotaById,
  findArcaIvaAlicuotaByRatePercent,
  getArcaIvaAlicuotasForSite,
  type ArcaIvaAlicuotaDef,
} from "@/lib/arcaArgentinaConstants"

export const DEFAULT_ARTICLE_IVA_ALICUOTA_ID = 5

export function getArticleIvaOptions(siteId: string): readonly ArcaIvaAlicuotaDef[] {
  return getArcaIvaAlicuotasForSite(siteId)
}

export function formatArticleIvaOptionLabel(option: ArcaIvaAlicuotaDef): string {
  if (option.category === "gravado" && option.ratePercent > 0) {
    return `IVA ${option.label}`
  }
  return option.label
}

export function resolveArticleIvaSelectValue(
  siteId: string,
  ivaRate: number,
): string {
  const match = findArcaIvaAlicuotaByRatePercent(siteId, ivaRate)
  if (match) return String(match.arcaAlicuotaId)
  if (Math.abs(ivaRate) < 0.001) return "3"
  const fallback = findArcaIvaAlicuotaById(
    siteId,
    DEFAULT_ARTICLE_IVA_ALICUOTA_ID,
  )
  return fallback ? String(fallback.arcaAlicuotaId) : "5"
}

export function parseArticleIvaFromSelect(
  siteId: string,
  selectValue: string,
): { ratePercent: number } | { error: string } {
  const trimmed = selectValue.trim()
  if (!trimmed) {
    return { error: "Elegí un tipo de IVA." }
  }
  const id = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(id)) {
    return { error: "Elegí un tipo de IVA válido." }
  }
  const alicuota = findArcaIvaAlicuotaById(siteId, id)
  if (!alicuota) {
    return { error: "Elegí un tipo de IVA válido." }
  }
  return { ratePercent: alicuota.ratePercent }
}

export function labelArticleIvaRate(siteId: string, ivaRate: number): string {
  const match = findArcaIvaAlicuotaByRatePercent(siteId, ivaRate)
  if (match) return formatArticleIvaOptionLabel(match)
  if (Math.abs(ivaRate) < 0.001) {
    const zero = findArcaIvaAlicuotaById(siteId, 3)
    return zero ? formatArticleIvaOptionLabel(zero) : "0 %"
  }
  return `${ivaRate} %`
}

export function isAllowedArticleIvaRate(siteId: string, ivaRate: number): boolean {
  return getArcaIvaAlicuotasForSite(siteId).some(
    (option) => Math.abs(option.ratePercent - ivaRate) < 0.001,
  )
}
