import type { SaleCatalogArticle } from "@/app/[siteId]/[popId]/sale/actions"

export type SaleCatalogProduct = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precioOriginal?: number
  categoria: string
  imagen: string
  promo?: string
}

export function saleCatalogArticleToProduct(
  a: SaleCatalogArticle,
): SaleCatalogProduct {
  return {
    id: a.id,
    nombre: a.name,
    descripcion: a.description.trim() ? a.description : "—",
    precio: a.salePrice,
    precioOriginal: a.originalSalePrice,
    categoria: a.categoryName.trim() ? a.categoryName : "—",
    imagen: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(a.id)}&backgroundColor=1a1f1d`,
  }
}

export function catalogCartLinePricing(
  product: Pick<SaleCatalogProduct, "precio" | "precioOriginal"> | null | undefined,
  cantidad: number,
) {
  const precioUnitario = product?.precio ?? 0
  const precioOriginal = product?.precioOriginal
  const tieneDescuentoCatalogo =
    precioOriginal != null && precioOriginal > precioUnitario
  const descuentoPct = tieneDescuentoCatalogo
    ? Math.round(((precioOriginal - precioUnitario) / precioOriginal) * 100)
    : null
  const unitBase = tieneDescuentoCatalogo ? precioOriginal : precioUnitario

  return {
    precioUnitario,
    precioBase: unitBase * cantidad,
    precioFinal: precioUnitario * cantidad,
    tieneDescuentoCatalogo,
    descuentoCatalogoLabel:
      descuentoPct != null ? `−${descuentoPct}%` : undefined,
  }
}

export function catalogCartOrderTotals(
  items: Array<{
    producto?: Pick<SaleCatalogProduct, "precio" | "precioOriginal"> | null
    cantidad: number
  }>,
) {
  let subtotal = 0
  let subtotalOriginal = 0

  for (const item of items) {
    const line = catalogCartLinePricing(item.producto, item.cantidad)
    subtotal += line.precioFinal
    subtotalOriginal += line.precioBase
  }

  const descuentoCatalogoMonto = Math.max(0, subtotalOriginal - subtotal)

  return {
    subtotal,
    subtotalOriginal,
    descuentoCatalogoMonto,
    hayDescuentoCatalogo: descuentoCatalogoMonto > 0,
  }
}
