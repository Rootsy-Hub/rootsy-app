import { parseMoneyInput } from "@/lib/moneyInput"

export const SALE_PRICE_LIST_ITEM_KINDS = ["article", "recipe"] as const

export type SalePriceListItemKind = (typeof SALE_PRICE_LIST_ITEM_KINDS)[number]

export type SalePriceList = {
  id: string
  name: string
  isDefault: boolean
  sortOrder: number
}

export type SalePriceListAmountInput = {
  listId: string
  amount: number | null
}

export function isSalePriceListItemKind(
  value: string,
): value is SalePriceListItemKind {
  return (SALE_PRICE_LIST_ITEM_KINDS as readonly string[]).includes(value)
}

/** Si no hay override, se usa el precio de Principal (`sale_price`). */
export function resolveListUnitPrice(
  principalAmount: number,
  overrideAmount: number | null | undefined,
): number {
  const principal = Number.isFinite(principalAmount) ? principalAmount : 0
  if (overrideAmount == null || !Number.isFinite(overrideAmount)) {
    return principal
  }
  return overrideAmount
}

export function applyOverrideMap(
  principalAmount: number,
  itemId: string,
  overrides: Map<string, number>,
): number {
  return resolveListUnitPrice(principalAmount, overrides.get(itemId))
}

export function extraPriceLists(lists: SalePriceList[]): SalePriceList[] {
  return lists.filter((list) => !list.isDefault)
}

export function defaultPriceList(lists: SalePriceList[]): SalePriceList | undefined {
  return lists.find((list) => list.isDefault) ?? lists[0]
}

export function parseListPriceFormValues(
  values: Record<string, string>,
  extraLists: SalePriceList[],
): SalePriceListAmountInput[] {
  return extraLists.map((list) => {
    const raw = values[list.id] ?? ""
    if (!raw.trim()) {
      return { listId: list.id, amount: null }
    }
    const amount = parseMoneyInput(raw, Number.NaN)
    return {
      listId: list.id,
      amount: Number.isFinite(amount) && amount > 0 ? amount : null,
    }
  })
}

export function listPriceValuesFromAmounts(
  amounts: Record<string, number>,
): Record<string, string> {
  const next: Record<string, string> = {}
  for (const [listId, amount] of Object.entries(amounts)) {
    next[listId] = String(amount)
  }
  return next
}
