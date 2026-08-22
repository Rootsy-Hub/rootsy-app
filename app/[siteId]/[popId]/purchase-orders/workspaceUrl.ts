import {
  DEFAULT_PURCHASE_ORDER_TABLE_PAGE_SIZE,
  PURCHASE_ORDER_TABLE_PAGE_SIZES,
} from "@/app/[siteId]/[popId]/purchase-orders/orderConstants"

export type PurchaseOrderTablePageSize =
  (typeof PURCHASE_ORDER_TABLE_PAGE_SIZES)[number]

export type PurchaseOrdersWorkspaceUrlState = {
  q: string
  page: number
  pageSize: PurchaseOrderTablePageSize
}

function parsePageSize(raw: string | null): PurchaseOrderTablePageSize {
  const n = Number(raw)
  if (PURCHASE_ORDER_TABLE_PAGE_SIZES.includes(n as PurchaseOrderTablePageSize)) {
    return n as PurchaseOrderTablePageSize
  }
  return DEFAULT_PURCHASE_ORDER_TABLE_PAGE_SIZE
}

export function parsePurchaseOrdersWorkspaceUrl(
  params: URLSearchParams,
): PurchaseOrdersWorkspaceUrlState {
  const pageRaw = Number(params.get("page"))
  return {
    q: params.get("q")?.trim() ?? "",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: parsePageSize(params.get("ps")),
  }
}

export function mergePurchaseOrdersWorkspaceUrl(
  current: URLSearchParams,
  patch: Partial<PurchaseOrdersWorkspaceUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString())
  const merged = { ...parsePurchaseOrdersWorkspaceUrl(current), ...patch }

  if (merged.q) next.set("q", merged.q)
  else next.delete("q")

  if (merged.page > 1) next.set("page", String(merged.page))
  else next.delete("page")

  if (merged.pageSize !== DEFAULT_PURCHASE_ORDER_TABLE_PAGE_SIZE) {
    next.set("ps", String(merged.pageSize))
  } else {
    next.delete("ps")
  }

  if (
    patch.page === undefined &&
    (patch.q !== undefined || patch.pageSize !== undefined)
  ) {
    if (merged.page !== 1) next.set("page", "1")
    else next.delete("page")
  }

  return next
}
