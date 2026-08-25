import type { OperateCatalogItemsFilter } from "@/lib/operateCatalogPage"

export type SaleCatalogViewPersisted =
  | { modo: "categoria"; categoria: string }
  | { modo: "promociones" }
  | { modo: "con_descuento" }

const STORAGE_PREFIX = "rootsy:sale-catalog-view:"

const saleCatalogViewListeners = new Set<() => void>()
const saleCatalogViewSnapshot = new Map<
  string,
  { raw: string | null; view: SaleCatalogViewPersisted | undefined }
>()

function emitSaleCatalogViewChange() {
  for (const listener of saleCatalogViewListeners) listener()
}

export function subscribeSaleCatalogView(onStoreChange: () => void) {
  saleCatalogViewListeners.add(onStoreChange)
  if (typeof window === "undefined") {
    return () => {
      saleCatalogViewListeners.delete(onStoreChange)
    }
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key == null || event.key.startsWith(STORAGE_PREFIX)) {
      onStoreChange()
    }
  }
  window.addEventListener("storage", onStorage)
  return () => {
    saleCatalogViewListeners.delete(onStoreChange)
    window.removeEventListener("storage", onStorage)
  }
}

export function saleCatalogViewsEqual(
  a: SaleCatalogViewPersisted | undefined,
  b: SaleCatalogViewPersisted | undefined,
): boolean {
  if (a === b) return true
  if (!a || !b || a.modo !== b.modo) return false
  if (a.modo === "categoria" && b.modo === "categoria") {
    return a.categoria === b.categoria
  }
  return true
}

export function saleBoardCategoryView(categoryId: string): SaleCatalogViewPersisted {
  return { modo: "categoria", categoria: `products:${categoryId}` }
}

export const SALE_CATALOG_TODOS = "Todos"

type CategoryRef = { name: string; id?: string }
type CategorySectionRef = { id: string; label: string; categories: { id: string; name: string }[] }

export function saleCatalogVisibleCategoryIds(
  categories: CategoryRef[],
  categorySections?: CategorySectionRef[],
): string[] {
  const ids = new Set<string>()
  for (const category of categories) {
    if (category.id && category.id !== "all") ids.add(category.id)
  }
  for (const section of categorySections ?? []) {
    if (section.id === "promotions") continue
    for (const category of section.categories) {
      if (category.id && category.id !== "all") ids.add(category.id)
    }
  }
  return [...ids]
}

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

/** Id de categoría desde `products:<uuid>` (sirve aunque el catálogo aún no llegó). */
export function saleCatalogCategoryIdFromView(
  vista: SaleCatalogViewPersisted | undefined,
): string | null {
  if (!vista || vista.modo !== "categoria") return null
  const key = vista.categoria.trim()
  const sep = key.indexOf(":")
  if (sep <= 0) return null
  const id = key.slice(sep + 1)
  return !id || id === "all" ? null : id
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
  const sep = key.indexOf(":")
  if (sep > 0) {
    const section = key.slice(0, sep)
    const id = key.slice(sep + 1)
    return {
      search: "",
      section,
      categoryId: !id || id === "all" ? null : id,
    }
  }
  if (categorySections?.length) {
    return { search: "", section: "products", categoryId: null }
  }
  const cat = categories.find((item) => item.name === key)
  return {
    search: "",
    section: "products",
    categoryId: cat?.id ? String(cat.id) : null,
  }
}

function saleCatalogViewsReady(
  categories: CategoryRef[],
  categorySections?: CategorySectionRef[],
): boolean {
  return categories.length > 0 || (categorySections?.length ?? 0) > 0
}

export function resolveSaleCatalogView(
  saved: SaleCatalogViewPersisted | undefined,
  categories: CategoryRef[],
  categorySections?: CategorySectionRef[],
): SaleCatalogViewPersisted {
  const fallback = defaultSaleCatalogView(categories, categorySections)
  if (!saved) return fallback
  if (saved.modo === "promociones" || saved.modo === "con_descuento") return saved
  if (saved.modo !== "categoria") return fallback
  if (!saleCatalogViewsReady(categories, categorySections)) return saved
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
    const cached = saleCatalogViewSnapshot.get(popId)
    if (cached && cached.raw === raw) return cached.view
    const parsed: unknown = raw ? JSON.parse(raw) : undefined
    const view = isSaleCatalogViewPersisted(parsed) ? parsed : undefined
    saleCatalogViewSnapshot.set(popId, { raw, view })
    return view
  } catch {
    return undefined
  }
}

/** Nombre visible de la vista actual — trigger mobile de categorías. */
export function saleCatalogViewLabel(
  vista: SaleCatalogViewPersisted,
  categories: CategoryRef[],
  categorySections?: CategorySectionRef[],
): string {
  if (vista.modo === "promociones") return "Promociones"
  if (vista.modo === "con_descuento") return "Con descuento"
  const key = vista.categoria.trim()
  if (!key) return "Categoría"
  if (categorySections?.length) {
    for (const section of categorySections) {
      for (const cat of section.categories) {
        if (`${section.id}:${cat.id}` === key) return cat.name
      }
    }
  }
  const match = categories.find((cat) => cat.name === key)
  return match?.name ?? key
}

export function writeSavedSaleCatalogView(
  popId: string,
  view: SaleCatalogViewPersisted,
): void {
  if (typeof window === "undefined") return
  try {
    const raw = JSON.stringify(view)
    const cached = saleCatalogViewSnapshot.get(popId)
    if (cached && cached.raw === raw) return
    window.localStorage.setItem(`${STORAGE_PREFIX}${popId}`, raw)
    saleCatalogViewSnapshot.set(popId, { raw, view })
    emitSaleCatalogViewChange()
  } catch {
    /* quota / private mode */
  }
}
