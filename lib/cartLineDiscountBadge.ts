import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"

export function formatDiscountGroupBannerLabel(
  mode: "porcentaje" | "fijo",
  value: number,
): string {
  if (!Number.isFinite(value)) return "0"
  if (mode === "porcentaje") {
    return Number.isInteger(value)
      ? String(value)
      : value.toLocaleString("es-AR", { maximumFractionDigits: 2 })
  }
  return saleOpFmt.format(Math.abs(value))
}

export function discountGroupBannerLabelFromPricing(input: {
  itemDiscountAmount: number
  itemDiscountMode: "porcentaje" | "fijo" | null
  itemDiscountValue: number | null
}): string | undefined {
  if (input.itemDiscountAmount <= 0) return undefined
  if (
    input.itemDiscountMode === "porcentaje" &&
    input.itemDiscountValue != null
  ) {
    return formatDiscountGroupBannerLabel("porcentaje", input.itemDiscountValue)
  }
  if (input.itemDiscountMode === "fijo" && input.itemDiscountValue != null) {
    return formatDiscountGroupBannerLabel("fijo", input.itemDiscountValue)
  }
  return formatDiscountGroupBannerLabel("fijo", input.itemDiscountAmount)
}
