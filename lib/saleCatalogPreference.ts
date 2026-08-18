import type { OperateCatalogItemsFilter } from "@/lib/operateCatalogPage"

export type SaleCatalogViewPersisted =
  | { modo: "categoria"; categoria: string }
  | { modo: "promociones" }
  | { modo: "con_descuento" }

const STORAGE_PREFIX = "rootsy:sale-catalog-view:"

export const SALE_CATALOG_TODOS = "Todos"

type CategoryRef = { name: string; id?: string }
type CategorySectionRef = { id: string; label: string; categories: { id: string; name: string }[] }

export function defaultSaleCatalogView(
  categories: CategoryRef[],
  categorySections?: CategorySectionRef[],
): SaleCatalogViewPersisted {
  if (categorySections?.length) {
    for (const section of categorySections) {
      const first = section.categories[0]
      if (first) {
        return { modo: "categoria", categoria: `${section.id}:${first.id}` }
      }
    }
  }
  if (categories.length > 0) {
    return { modo: "categoria", categoria: categories[0].name }
  }
  return { modo: "categoria", categoria: "" }
}

function isValidSaleCatalogCategoryView(
  categoria: string,
  categories: CategoryRef[],
  categorySections?: CategorySectionRef[],
): boolean {
  if (!categoria || categoria === SALE_CATALOG_TODOS) return false
  if (categorySections?.length) {
    return categorySections.some((section) =>
      section.categories.some((cat) => `${section.id}:${cat.id}` === categoria),
    )
  }
  return categories.some((cat) => cat.name === categoria)
}

/** Restaura vista guardada o cae a la primera categoría del catálogo. */
export function saleCatalogViewToItemsFilter(
  vista: SaleCatalogViewPersisted,
  search: string,
  categories: CategoryRef[],
  categorySections?: CategorySectionRef[],
): OperateCatalogItemsFilter {
  const q = search.trim()
  if (q) {
    return { search: q, section: "all", categoryId: null }
  }
  if (vista.modo === "promociones") {
    return { search: "", section: "promotions", categoryId: null }
  }
  if (vista.modo === "con_descuento") {
    return { search: "", section: "discounts", categoryId: null }
  }
  const key = vista.categoria
  if (categorySections?.length) {
    const sep = key.indexOf(":")
    if (sep <= 0) {
      return { search: "", section: "products", categoryId: null }
    }
    const section = key.slice(0, sep)
    const id = key.slice(sep + 1)
    return {
      search: "",
      section,
      categoryId: !id || id === "all" ? null : id,
    }
  }
  const cat = categories.find((item) => item.name === key)
  return {
    search: "",
    section: "products",
    categoryId: cat?.id ? String(cat.id) : null,
  }
}

export function resolveSaleCatalogView(
  saved: SaleCatalogViewPersisted | undefined,
  categories: CategoryRef[],
  categorySections?: CategorySectionRef[],
): SaleCatalogViewPersisted {
  const fallback = defaultSaleCatalogView(categories, categorySections)
  if (!saved || saved.modo !== "categoria") return fallback
  if (!isValidSaleCatalogCategoryView(saved.categoria, categories, categorySections)) {
    return fallback
  }
  return saved
}

function isSaleCatalogViewPersisted(v: unknown): v is SaleCatalogViewPersisted {
  if (v == null || typeof v !== "object") return false
  const o = v as Record<string, unknown>
  const modo = o.modo
  if (modo === "promociones" || modo === "con_descuento") return true
  if (modo === "categoria") {
    return typeof o.categoria === "string" && o.categoria.length > 0
  }
  return false
}

export function readSavedSaleCatalogView(
  popId: string,
): SaleCatalogViewPersisted | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${popId}`)
    if (!raw) return undefined
    const parsed: unknown = JSON.parse(raw)
    return isSaleCatalogViewPersisted(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

export function writeSavedSaleCatalogView(
  popId: string,
  view: SaleCatalogViewPersisted,
): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${popId}`, JSON.stringify(view))
  } catch {
    /* quota / private mode */
  }
}
