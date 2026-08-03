import {
  DEFAULT_PROMOTION_TABLE_PAGE_SIZE,
  PROMOTION_TABLE_PAGE_SIZES,
} from "@/app/[siteId]/[popId]/promotions/promotionConstants"
import type { PromotionType } from "@/lib/promotionTypes"

export type PromotionTablePageSize = (typeof PROMOTION_TABLE_PAGE_SIZES)[number]

export type PromotionsWorkspaceUrlState = {
  q: string
  page: number
  pageSize: PromotionTablePageSize
  soloActivos: boolean
  /** Vacío = todos los tipos. */
  promotionType: PromotionType | ""
}

function parsePageSize(raw: string | null): PromotionTablePageSize {
  const n = Number(raw)
  if (PROMOTION_TABLE_PAGE_SIZES.includes(n as PromotionTablePageSize)) {
    return n as PromotionTablePageSize
  }
  return DEFAULT_PROMOTION_TABLE_PAGE_SIZE
}

function parsePromotionType(raw: string | null): PromotionType | "" {
  if (raw === "combo" || raw === "quantity_deal") return raw
  return ""
}

export function parsePromotionsWorkspaceUrl(
  params: URLSearchParams,
): PromotionsWorkspaceUrlState {
  const pageRaw = Number(params.get("page"))
  return {
    q: params.get("q")?.trim() ?? "",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: parsePageSize(params.get("ps")),
    soloActivos: params.get("solo") === "1",
    promotionType: parsePromotionType(params.get("type")),
  }
}

export function mergePromotionsWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<PromotionsWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged = { ...parsePromotionsWorkspaceUrl(current), ...patch }

  if (merged.q) next.set("q", merged.q)
  else next.delete("q")

  if (merged.page > 1) next.set("page", String(merged.page))
  else next.delete("page")

  if (merged.pageSize !== DEFAULT_PROMOTION_TABLE_PAGE_SIZE) {
    next.set("ps", String(merged.pageSize))
  } else {
    next.delete("ps")
  }

  if (merged.soloActivos) next.set("solo", "1")
  else next.delete("solo")

  if (merged.promotionType) next.set("type", merged.promotionType)
  else next.delete("type")

  if (
    patch.page === undefined &&
    (patch.q !== undefined ||
      patch.soloActivos !== undefined ||
      patch.promotionType !== undefined)
  ) {
    if (merged.page !== 1) next.set("page", "1")
    else next.delete("page")
  }

  return next
}

export { PROMOTION_TABLE_PAGE_SIZES, DEFAULT_PROMOTION_TABLE_PAGE_SIZE }
