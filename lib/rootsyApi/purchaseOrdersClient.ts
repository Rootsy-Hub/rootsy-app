import type {
  CreatePurchaseOrderInput,
  GetPurchaseOrdersTableInput,
} from "@/app/[siteId]/[popId]/purchase-orders/actions"
import type {
  PurchaseOrderDetail,
  PurchaseOrderTableRow,
} from "@/lib/purchaseOrderTypes"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

export type PopPurchaseOrdersTableResult =
  | {
      success: true
      rows: PurchaseOrderTableRow[]
      totalCount: number
      page: number
    }
  | {
      success: false
      error: string
      rows: PurchaseOrderTableRow[]
      totalCount: number
      page: number
    }

type OrderListData = {
  rows: PurchaseOrderTableRow[]
  totalCount: number
  page: number
}

const EMPTY_TABLE: Omit<
  Extract<PopPurchaseOrdersTableResult, { success: false }>,
  "success" | "error"
> = {
  rows: [],
  totalCount: 0,
  page: 1,
}

export function buildPurchaseOrdersListSearch(
  input: GetPurchaseOrdersTableInput,
): string {
  const params = new URLSearchParams()
  if (input.page) params.set("page", String(input.page))
  if (input.pageSize) params.set("pageSize", String(input.pageSize))
  const q = input.q?.trim() ?? ""
  if (q) params.set("q", q)
  const dateFrom = input.dateFrom?.trim() ?? ""
  if (dateFrom) params.set("dateFrom", dateFrom)
  const dateTo = input.dateTo?.trim() ?? ""
  if (dateTo) params.set("dateTo", dateTo)
  return params.toString()
}

function emptyError(error: string): PopPurchaseOrdersTableResult {
  return { success: false, error, ...EMPTY_TABLE }
}

export async function fetchPopPurchaseOrdersTable(
  popId: string,
  input: GetPurchaseOrdersTableInput,
): Promise<PopPurchaseOrdersTableResult> {
  const search = buildPurchaseOrdersListSearch(input)
  const res = await fetch(`/api/pops/${popId}/purchase-orders?${search}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<OrderListData>
    | ApiErr
    | null

  if (res.ok && json && "success" in json && json.success) {
    return { success: true, ...json.data }
  }

  return emptyError(
    json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  )
}

export async function fetchPurchaseOrderDetail(
  popId: string,
  orderId: string,
): Promise<
  { success: true; order: PurchaseOrderDetail } | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/purchase-orders/${orderId}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ order: PurchaseOrderDetail }>
    | ApiErr
    | null

  if (res.ok && json && "success" in json && json.success) {
    return { success: true, order: json.data.order }
  }

  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

type MutateResult =
  | { success: true; orderId?: string; orderNumber?: number }
  | { success: false; error: string }

async function parseMutate(res: Response): Promise<MutateResult> {
  const json = (await res.json().catch(() => null)) as
    | {
        success?: boolean
        error?: string
        orderId?: string
        orderNumber?: number
      }
    | null
  if (res.ok && json && json.success) {
    return {
      success: true,
      orderId: json.orderId,
      orderNumber: json.orderNumber,
    }
  }
  return {
    success: false,
    error:
      json && typeof json.error === "string" && json.error
        ? json.error
        : `HTTP ${res.status}`,
  }
}

export async function createPurchaseOrder(
  popId: string,
  input: CreatePurchaseOrderInput,
): Promise<
  | { success: true; orderId: string; orderNumber: number }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/purchase-orders`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const parsed = await parseMutate(res)
  if (!parsed.success) return parsed
  return {
    success: true,
    orderId: parsed.orderId ?? "",
    orderNumber: parsed.orderNumber ?? 0,
  }
}

export async function deletePurchaseOrder(
  popId: string,
  orderId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const res = await fetch(`/api/pops/${popId}/purchase-orders/${orderId}`, {
    method: "DELETE",
    headers: { accept: "application/json" },
  })
  const parsed = await parseMutate(res)
  if (!parsed.success) return parsed
  return { success: true }
}
