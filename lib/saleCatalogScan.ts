import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import type { MenuCartItemKind } from "@/lib/menuCart"

type ScannableProduct = Pick<SaleCatalogProduct, "id" | "nombre" | "barcode"> & {
  kind?: MenuCartItemKind
}

/** Resuelve un producto por código de barras exacto o búsqueda única al confirmar escaneo. */
export function findCatalogProductByScanQuery<T extends ScannableProduct>(
  products: T[],
  rawQuery: string,
): T | null {
  const query = rawQuery.trim()
  if (!query) return null

  const barcodeMatches = products.filter(
    (p) => p.barcode != null && String(p.barcode).trim() === query,
  )
  if (barcodeMatches.length === 1) return barcodeMatches[0] ?? null
  if (barcodeMatches.length > 1) return null

  const qLower = query.toLowerCase()
  const nameMatches = products.filter((p) => p.nombre.toLowerCase() === qLower)
  if (nameMatches.length === 1) return nameMatches[0] ?? null

  return null
}
