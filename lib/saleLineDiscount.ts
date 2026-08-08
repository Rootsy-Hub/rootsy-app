import {
  articleHasCatalogDiscount,
  effectiveArticleSalePrice,
  type ArticleDiscountMode,
} from "@/lib/articleDiscount"

export function roundSaleMoney(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

export type SaleLineManualDiscount = {
  mode: "porcentaje" | "fijo"
  draft: string
}

export type ResolveSaleLineDiscountInput = {
  listUnitPrice: number
  quantity: number
  catalogDiscountMode?: ArticleDiscountMode | null
  catalogDiscountValue?: number | null
  manualDiscount?: SaleLineManualDiscount | null
  /** Si true, no aplica el descuento de catálogo (el usuario lo quitó en caja). */
  suppressCatalogDiscount?: boolean
}

export type ResolveSaleLineDiscountResult = {
  listLineSubtotal: number
  lineSubtotal: number
  itemDiscountAmount: number
  itemDiscountMode: "porcentaje" | "fijo" | null
  itemDiscountValue: number | null
  discountSource: "none" | "catalog" | "manual"
}

export function parseSaleLineManualDiscountValue(draft: string): number | null {
  const raw = draft.trim().replace(",", ".")
  const n = Number.parseFloat(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export function hasSaleLineManualDiscount(
  manual?: SaleLineManualDiscount | null,
): boolean {
  if (!manual) return false
  return parseSaleLineManualDiscountValue(manual.draft) != null
}

/**
 * Resuelve el descuento de una línea de venta.
 * El descuento manual en caja reemplaza al descuento de catálogo del artículo.
 */
export function resolveSaleLineDiscount(
  input: ResolveSaleLineDiscountInput,
): ResolveSaleLineDiscountResult {
  const qty = Math.max(0, input.quantity)
  const listUnit = Math.max(0, Number(input.listUnitPrice) || 0)
  const listLineSubtotal = roundSaleMoney(listUnit * qty)

  const manualValue = input.manualDiscount
    ? parseSaleLineManualDiscountValue(input.manualDiscount.draft)
    : null

  if (manualValue != null && input.manualDiscount) {
    const modo = input.manualDiscount.mode ?? "porcentaje"
    const itemDiscountAmount =
      modo === "porcentaje"
        ? roundSaleMoney(
            listLineSubtotal * (Math.min(100, Math.max(0, manualValue)) / 100),
          )
        : roundSaleMoney(Math.min(Math.max(0, manualValue), listLineSubtotal))
    return {
      listLineSubtotal,
      lineSubtotal: roundSaleMoney(listLineSubtotal - itemDiscountAmount),
      itemDiscountAmount,
      itemDiscountMode: modo,
      itemDiscountValue: manualValue,
      discountSource: "manual",
    }
  }

  const catalogMode = input.catalogDiscountMode
  const catalogValue = input.catalogDiscountValue
  if (
    !input.suppressCatalogDiscount &&
    articleHasCatalogDiscount(catalogMode, catalogValue)
  ) {
    const effectiveUnit = effectiveArticleSalePrice(
      listUnit,
      catalogMode,
      catalogValue,
    )
    const lineSubtotal = roundSaleMoney(effectiveUnit * qty)
    const itemDiscountAmount = roundSaleMoney(listLineSubtotal - lineSubtotal)
    return {
      listLineSubtotal,
      lineSubtotal,
      itemDiscountAmount,
      itemDiscountMode: catalogMode!,
      itemDiscountValue: catalogValue!,
      discountSource: "catalog",
    }
  }

  return {
    listLineSubtotal,
    lineSubtotal: listLineSubtotal,
    itemDiscountAmount: 0,
    itemDiscountMode: null,
    itemDiscountValue: null,
    discountSource: "none",
  }
}
