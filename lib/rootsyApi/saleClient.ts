import type {
  SaleCatalogArticle,
  SaleCatalogCategory,
  SaleOpenCashSession,
} from "@/app/[siteId]/[popId]/sale/actions"
import type {
  MenuCatalogCategorySection,
  MenuCatalogPromotion,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { OperateCatalogItemsFilter, OperateCatalogItemsPage } from "@/lib/operateCatalogPage"
import type { SaleComprobantePickerOption } from "@/lib/saleComprobantePicker"
import type { SaleComprobanteEmitterContext } from "@/lib/saleComprobantePreview"
import type { PopEmisorIvaCondition } from "@/lib/saleComprobanteRules"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value: string | null | undefined): value is string {
  return Boolean(value && UUID_RE.test(value))
}

export type SaleCatalogBootstrap = {
  popName: string
  categories: SaleCatalogCategory[]
  categorySections: MenuCatalogCategorySection[]
  promotions: MenuCatalogPromotion[]
  quantityDeals: MenuCatalogPromotion[]
  canReadClients: boolean
  canReadPaymentMethods: boolean
  canCreateSale: boolean
  canReadCashRegisters: boolean
  openCashSession: SaleOpenCashSession | null
  invoiceTypeSiteId: string
}

export type SaleComprobantesPayload = {
  invoiceTypeSiteId: string
  hasValidFiscalCuit: boolean
  emisorIvaCondition: PopEmisorIvaCondition
  options: SaleComprobantePickerOption[]
  emitter?: SaleComprobanteEmitterContext | null
}

async function parseOk<T>(
  res: Response,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const json = (await res.json().catch(() => null)) as ApiOk<T> | ApiErr | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, data: json.data }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchSaleCatalog(
  popId: string,
): Promise<
  | { success: true } & SaleCatalogBootstrap
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/sale/catalog`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseOk<SaleCatalogBootstrap>(res)
  if (!parsed.success) return parsed
  return { success: true, ...parsed.data }
}

export async function fetchSaleCatalogItemsPage(
  popId: string,
  filter: OperateCatalogItemsFilter,
  offset = 0,
): Promise<
  | { success: true; page: OperateCatalogItemsPage<SaleCatalogArticle> }
  | { success: false; error: string }
> {
  const params = new URLSearchParams({
    section: filter.section,
    offset: String(offset),
  })
  if (filter.search.trim()) params.set("search", filter.search.trim())
  if (isUuid(filter.categoryId)) params.set("categoryId", filter.categoryId)
  if (isUuid(filter.priceListId)) params.set("priceListId", filter.priceListId)
  const catalogCategoryIds = (filter.catalogCategoryIds ?? []).filter(isUuid)
  if (filter.search.trim() && catalogCategoryIds.length > 0) {
    params.set("categoryIds", catalogCategoryIds.join(","))
  }

  const res = await fetch(`/api/pops/${popId}/sale/catalog/items?${params}`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseOk<OperateCatalogItemsPage<SaleCatalogArticle>>(res)
  if (!parsed.success) return parsed
  return { success: true, page: parsed.data }
}

export async function fetchSaleCatalogArticlesByIds(
  popId: string,
  ids: string[],
  priceListId?: string,
): Promise<
  | { success: true; articles: SaleCatalogArticle[] }
  | { success: false; error: string }
> {
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length === 0) return { success: true, articles: [] }
  const params = new URLSearchParams({ ids: unique.join(",") })
  if (isUuid(priceListId)) params.set("priceListId", priceListId)
  const res = await fetch(
    `/api/pops/${popId}/sale/catalog/articles?${params}`,
    { headers: { accept: "application/json" } },
  )
  const parsed = await parseOk<SaleCatalogArticle[]>(res)
  if (!parsed.success) return parsed
  return { success: true, articles: parsed.data }
}

export async function findSaleCatalogArticleByScan(
  popId: string,
  rawQuery: string,
  priceListId?: string,
): Promise<
  | { success: true; article: SaleCatalogArticle | null }
  | { success: false; error: string }
> {
  const q = rawQuery.trim()
  if (!q) return { success: true, article: null }
  const params = new URLSearchParams({ q })
  if (isUuid(priceListId)) params.set("priceListId", priceListId)
  const res = await fetch(`/api/pops/${popId}/sale/catalog/scan?${params}`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseOk<SaleCatalogArticle | null>(res)
  if (!parsed.success) return parsed
  return { success: true, article: parsed.data }
}

export async function fetchSalePaymentContext(
  popId: string,
): Promise<
  | { success: true; context: TreasuryPaymentContext }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/sale/payment-context`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseOk<TreasuryPaymentContext>(res)
  if (!parsed.success) return parsed
  return { success: true, context: parsed.data }
}

export async function fetchSaleComprobantes(
  popId: string,
): Promise<
  | { success: true } & SaleComprobantesPayload
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/sale/comprobantes`, {
    headers: { accept: "application/json" },
  })
  const parsed = await parseOk<SaleComprobantesPayload>(res)
  if (!parsed.success) return parsed
  return { success: true, ...parsed.data }
}
