import type { SaleCatalogArticle } from "@/app/[siteId]/[popId]/sale/actions"
import { formatArticleDiscountBadge } from "@/lib/articleDiscount"
import { resolveCatalogProductImage } from "@/lib/menuCatalogProduct"
import {
  hasSaleLineManualDiscount,
  resolveSaleLineDiscount,
  roundSaleMoney,
  type SaleLineManualDiscount,
} from "@/lib/saleLineDiscount"

export type SaleCatalogProduct = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precioOriginal?: number
  discountMode?: SaleCatalogArticle["discountMode"]
  discountValue?: SaleCatalogArticle["discountValue"]
  categoria: string
  imagen: string
  promo?: string
  unitOfMeasure?: string
  /** Alícuota IVA (%). Por defecto 21 en comprobantes si falta. */
  iva?: number
  /** Código de barras EAN/UPC (solo artículos de venta). */
  barcode?: string | null
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
    discountMode: a.discountMode,
    discountValue: a.discountValue,
    categoria: a.categoryName.trim() ? a.categoryName : "—",
    imagen: resolveCatalogProductImage(a.id, a.imageUrl),
    unitOfMeasure: a.unitOfMeasure,
    iva: a.iva,
    barcode: a.barcode ?? null,
  }
}

export function resolveCatalogCartLinePricing(
  product:
    | Pick<
        SaleCatalogProduct,
        | "precio"
        | "precioOriginal"
        | "discountMode"
        | "discountValue"
      >
    | null
    | undefined,
  cantidad: number,
  manualDiscount?: SaleLineManualDiscount | null,
  options?: { suppressCatalogDiscount?: boolean },
) {
  const listUnitPrice = product?.precioOriginal ?? product?.precio ?? 0
  let resolved = resolveSaleLineDiscount({
    listUnitPrice,
    quantity: cantidad,
    catalogDiscountMode: product?.discountMode,
    catalogDiscountValue: product?.discountValue,
    manualDiscount: hasSaleLineManualDiscount(manualDiscount)
      ? manualDiscount
      : null,
    suppressCatalogDiscount: options?.suppressCatalogDiscount === true,
  })

  // Fallback: precio efectivo del catálogo sin mode/value (p. ej. mapeos incompletos).
  if (
    !options?.suppressCatalogDiscount &&
    resolved.discountSource === "none" &&
    product?.precioOriginal != null &&
    product.precioOriginal > (product.precio ?? 0)
  ) {
    const effectiveUnit = product.precio ?? 0
    const lineSubtotal = roundSaleMoney(effectiveUnit * cantidad)
    const itemDiscountAmount = roundSaleMoney(
      resolved.listLineSubtotal - lineSubtotal,
    )
    const descuentoPct = Math.round(
      ((product.precioOriginal - effectiveUnit) / product.precioOriginal) * 100,
    )
    resolved = {
      listLineSubtotal: resolved.listLineSubtotal,
      lineSubtotal,
      itemDiscountAmount,
      itemDiscountMode: "porcentaje",
      itemDiscountValue: descuentoPct > 0 ? descuentoPct : null,
      discountSource: "catalog",
    }
  }

  const precioUnitario =
    cantidad > 0
      ? resolved.lineSubtotal / cantidad
      : (product?.precio ?? 0)
  const tieneDescuentoManual = resolved.discountSource === "manual"
  const tieneDescuentoCatalogo =
    !tieneDescuentoManual && resolved.discountSource === "catalog"

  let descuentoCatalogoLabel: string | undefined
  if (tieneDescuentoCatalogo) {
    if (product?.discountMode && product.discountValue != null) {
      descuentoCatalogoLabel = formatArticleDiscountBadge(
        product.discountMode,
        product.discountValue,
      )
    } else if (
      product?.precioOriginal != null &&
      product.precioOriginal > (product.precio ?? 0)
    ) {
      const pct = Math.round(
        ((product.precioOriginal - (product.precio ?? 0)) / product.precioOriginal) *
          100,
      )
      if (pct > 0) descuentoCatalogoLabel = `−${pct} %`
    }
  }

  return {
    precioUnitario,
    precioBase: resolved.listLineSubtotal,
    precioFinal: resolved.lineSubtotal,
    itemDiscountAmount: resolved.itemDiscountAmount,
    tieneDescuentoCatalogo,
    tieneDescuentoManual,
    descuentoCatalogoLabel,
    itemDiscountMode: resolved.itemDiscountMode,
    itemDiscountValue: resolved.itemDiscountValue,
    discountSource: resolved.discountSource,
  }
}

export function defaultItemDiscountFromProduct(
  product: Pick<
    SaleCatalogProduct,
    "precio" | "precioOriginal" | "discountMode" | "discountValue"
  >,
): SaleLineManualDiscount | null {
  if (product.discountMode && product.discountValue != null && product.discountValue > 0) {
    return {
      mode: product.discountMode,
      draft: String(product.discountValue),
    }
  }
  if (
    product.precioOriginal != null &&
    product.precioOriginal > (product.precio ?? 0)
  ) {
    const pct = Math.round(
      ((product.precioOriginal - (product.precio ?? 0)) / product.precioOriginal) *
        100,
    )
    if (pct > 0) {
      return { mode: "porcentaje", draft: String(pct) }
    }
  }
  return null
}

export function catalogCartLinePricing(
  product: Pick<SaleCatalogProduct, "precio" | "precioOriginal"> | null | undefined,
  cantidad: number,
) {
  return resolveCatalogCartLinePricing(product, cantidad)
}

export function catalogCartOrderTotals(
  items: Array<{
    producto?:
      | Pick<
          SaleCatalogProduct,
          | "precio"
          | "precioOriginal"
          | "discountMode"
          | "discountValue"
        >
      | null
    cantidad: number
    manualDiscount?: SaleLineManualDiscount | null
    suppressCatalogDiscount?: boolean
  }>,
) {
  let subtotal = 0
  let subtotalOriginal = 0
  let descuentoCatalogoMonto = 0
  let descuentoManualMonto = 0

  for (const item of items) {
    const line = resolveCatalogCartLinePricing(
      item.producto,
      item.cantidad,
      item.manualDiscount,
      { suppressCatalogDiscount: item.suppressCatalogDiscount },
    )
    subtotal += line.precioFinal
    subtotalOriginal += line.precioBase
    if (line.discountSource === "catalog") {
      descuentoCatalogoMonto += line.itemDiscountAmount
    } else if (line.discountSource === "manual") {
      descuentoManualMonto += line.itemDiscountAmount
    }
  }

  return {
    subtotal,
    subtotalOriginal,
    descuentoCatalogoMonto,
    descuentoManualMonto,
    descuentoItemsMonto: roundSaleMoney(
      descuentoCatalogoMonto + descuentoManualMonto,
    ),
    hayDescuentoCatalogo: descuentoCatalogoMonto > 0,
    hayDescuentoManual: descuentoManualMonto > 0,
    hayDescuentoItems:
      descuentoCatalogoMonto + descuentoManualMonto > 0,
  }
}
