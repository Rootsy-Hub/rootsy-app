export const OPERATE_CATALOG_PAGE_SIZE = 48
export const OPERATE_CATALOG_SEARCH_DEBOUNCE_MS = 300

export type OperateCatalogItemsFilter = {
  search: string
  /** sale/menu: products | recipes | promotions | discounts | all. compra: merchandise | raw_material | supply */
  section: string
  categoryId: string | null
  /** Lista de precios de venta. Vacío / principal = sale_price. */
  priceListId?: string
  /** Categorías visibles en el catálogo. La búsqueda no sale de este set. */
  catalogCategoryIds?: string[]
}

export type OperateCatalogItemsPage<T> = {
  items: T[]
  nextOffset: number | null
}

export function sanitizeCatalogIlike(raw: string): string {
  return raw.replace(/[%_,()]/g, " ").replace(/\s+/g, " ").trim()
}

export function operateCatalogFilterKey(filter: OperateCatalogItemsFilter): string {
  return `${filter.section}:${filter.categoryId ?? ""}:${filter.search}:${filter.priceListId ?? ""}`
}

export function uniqueById<T extends { id: string }>(rows: T[]): T[] {
  if (rows.length < 2) return rows
  const seen = new Set<string>()
  const out: T[] = []
  for (const row of rows) {
    if (seen.has(row.id)) continue
    seen.add(row.id)
    out.push(row)
  }
  return out
}

/** Evita páginas repetidas si el infinite query refetch appende el mismo offset. */
export function uniqueInfinitePages<T>(data: {
  pages: T[]
  pageParams: number[]
}): { pages: T[]; pageParams: number[] } {
  const seen = new Set<number>()
  const pages: T[] = []
  const pageParams: number[] = []
  for (let i = 0; i < data.pages.length; i++) {
    const param = data.pageParams[i]
    if (param == null || seen.has(param)) continue
    seen.add(param)
    pages.push(data.pages[i]!)
    pageParams.push(param)
  }
  if (pages.length === data.pages.length) return data
  return { pages, pageParams }
}

export function purchaseCatalogViewToItemsFilter(
  categoria: string,
  search: string,
): OperateCatalogItemsFilter {
  const q = search.trim()
  if (q) {
    return { search: q, section: "all", categoryId: null }
  }
  const sep = categoria.indexOf(":")
  if (sep <= 0) {
    return { search: "", section: categoria || "all", categoryId: null }
  }
  return {
    search: "",
    section: categoria.slice(0, sep),
    categoryId: categoria.slice(sep + 1) || null,
  }
}
