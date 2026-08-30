import { isLegalSaleComprobanteLabel } from "@/lib/saleComprobanteRules"

/** Descuento general ≥ 15% del subtotal pide confirmación. */
export const SALE_CHECKOUT_LARGE_DISCOUNT_RATIO = 0.15

export type SaleCheckoutRiskReason =
  | "client_account"
  | "check"
  | "large_discount"
  | "legal_without_tax_id"

export function isLargeSaleCheckoutDiscount(
  discountAmount: number,
  subtotal: number,
): boolean {
  if (!(discountAmount > 0) || !(subtotal > 0)) return false
  return discountAmount / subtotal >= SALE_CHECKOUT_LARGE_DISCOUNT_RATIO
}

export function resolveSaleCheckoutRisk(input: {
  payOnClientAccount: boolean
  paymentKind?: string | null
  discountAmount: number
  subtotal: number
  comprobanteLabel: string | null | undefined
  partyTaxId?: string | null
}): SaleCheckoutRiskReason | null {
  if (input.payOnClientAccount) return "client_account"
  if (input.paymentKind === "check") return "check"
  if (isLargeSaleCheckoutDiscount(input.discountAmount, input.subtotal)) {
    return "large_discount"
  }
  if (
    isLegalSaleComprobanteLabel(input.comprobanteLabel) &&
    !input.partyTaxId?.trim()
  ) {
    return "legal_without_tax_id"
  }
  return null
}
