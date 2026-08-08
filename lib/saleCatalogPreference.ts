export type SaleCatalogViewPersisted =
  | { modo: "categoria"; categoria: string }
  | { modo: "promociones" }
  | { modo: "con_descuento" }

const STORAGE_PREFIX = "rootsy:sale-catalog-view:"

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
