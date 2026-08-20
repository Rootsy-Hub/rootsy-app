export const OPERATE_CATALOG_PAGE_SIZE = 48
export const OPERATE_CATALOG_SEARCH_DEBOUNCE_MS = 300

export type OperateCatalogItemsFilter = {
  search: string
  /** sale/menu: products | recipes | promotions | discounts | all. compra: merchandise | raw_material | supply */
  section: string
  categoryId: string | null
  /** Lista de precios de venta. Vacío / principal = sale_price. */
  priceListId?: string
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
