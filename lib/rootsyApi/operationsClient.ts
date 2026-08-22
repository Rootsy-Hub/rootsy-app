import type {
  GetOperationsListInput,
  GetOperationsListResult,
  OperationAccountingEntryDetail,
  OperationPurchaseRow,
  OperationSaleChargeRow,
  OperationSaleDetailContext,
  OperationSaleRow,
  OperationsListView,
} from "@/app/[siteId]/[popId]/operations/actions"
import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import { getMenuCatalog } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import {
  buildChannelCheckoutTicketDisplay,
  type ChannelCheckoutTicketDisplay,
} from "@/lib/buildChannelCheckoutTicketDisplay"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }

type ListData = {
  popName: string
  totalCount: number
  page: number
  sales: OperationSaleRow[]
  expenseLedger: Extract<
    GetOperationsListResult,
    { success: true }
  >["expenseLedger"]
  purchases: Extract<GetOperationsListResult, { success: true }>["purchases"]
  serviceCharges?: Extract<
    GetOperationsListResult,
    { success: true }
  >["serviceCharges"]
}

const EMPTY_LIST: Omit<
  Extract<GetOperationsListResult, { success: false }>,
  "success" | "error"
> = {
  totalCount: 0,
  page: 1,
  sales: [],
  expenseLedger: [],
  purchases: [],
  serviceCharges: [],
}

export function buildOperationsListSearch(input: GetOperationsListInput): string {
  const params = new URLSearchParams()
  params.set("view", input.view)
  if (input.dateFrom) params.set("dateFrom", input.dateFrom)
  if (input.dateTo) params.set("dateTo", input.dateTo)
  const q = input.search.trim()
  if (q) params.set("q", q)
  if (input.page) params.set("page", String(input.page))
  if (input.pageSize) params.set("pageSize", String(input.pageSize))
  if (input.sort) params.set("sort", input.sort)
  if (input.ord) params.set("ord", input.ord)
  if (input.fiscalOnly) params.set("fiscalOnly", "1")
  const f = input.filters
  if (f?.saleStatus) params.set("saleStatus", f.saleStatus)
  if (f?.saleWithDiscount) params.set("saleWithDiscount", "1")
  if (f?.tableSession) params.set("tableSession", f.tableSession)
  if (f?.counterStatus) params.set("counterStatus", f.counterStatus)
  if (f?.counterFulfillment) params.set("counterFulfillment", f.counterFulfillment)
  if (f?.purchaseKind) params.set("purchaseKind", f.purchaseKind)
  if (f?.expenseSource) params.set("expenseSource", f.expenseSource)
  if (f?.serviceStatus) params.set("serviceStatus", f.serviceStatus)
  if (f?.serviceScope) params.set("serviceScope", f.serviceScope)
  if (input.include === "full") params.set("include", "full")
  return params.toString()
}

function listError(
  error: string,
  page = 1,
  redirect?: string,
): GetOperationsListResult {
  return { success: false, error, redirect, ...EMPTY_LIST, page }
}

export async function fetchPopOperationsList(
  popId: string,
  input: GetOperationsListInput,
): Promise<GetOperationsListResult> {
  const search = buildOperationsListSearch(input)
  const res = await fetch(`/api/pops/${popId}/operations?${search}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<ListData>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return {
      success: true,
      popName: json.data.popName ?? "",
      totalCount: json.data.totalCount,
      page: json.data.page,
      sales: json.data.sales ?? [],
      expenseLedger: json.data.expenseLedger ?? [],
      purchases: json.data.purchases ?? [],
      serviceCharges: json.data.serviceCharges ?? [],
    }
  }
  return listError(
    json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    input.page,
  )
}

export async function fetchOperationSaleById(
  popId: string,
  saleId: string,
): Promise<
  | { success: true; sale: OperationSaleRow; context: OperationSaleDetailContext }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/operations/sales/${saleId}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ sale: OperationSaleRow; context: OperationSaleDetailContext }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, sale: json.data.sale, context: json.data.context }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchOperationPurchaseById(
  popId: string,
  purchaseId: string,
): Promise<
  | { success: true; purchase: OperationPurchaseRow }
  | { success: false; error: string }
> {
  const res = await fetch(
    `/api/pops/${popId}/operations/purchases/${purchaseId}`,
    { headers: { accept: "application/json" } },
  )
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ purchase: OperationPurchaseRow }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, purchase: json.data.purchase }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchOperationSaleDetailCharges(
  popId: string,
  input: {
    saleId: string
    groupedSaleIds?: string[]
    tableSessionId?: string | null
    counterOrderId?: string | null
  },
): Promise<
  | { success: true; charges: OperationSaleChargeRow[] }
  | { success: false; error: string }
> {
  const params = new URLSearchParams()
  if (input.groupedSaleIds?.length) {
    params.set("groupedSaleIds", input.groupedSaleIds.join(","))
  }
  if (input.tableSessionId) params.set("tableSessionId", input.tableSessionId)
  if (input.counterOrderId) params.set("counterOrderId", input.counterOrderId)
  const qs = params.toString()
  const res = await fetch(
    `/api/pops/${popId}/operations/sales/${input.saleId}/charges${qs ? `?${qs}` : ""}`,
    { headers: { accept: "application/json" } },
  )
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ charges: OperationSaleChargeRow[] }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, charges: json.data.charges }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchOperationSaleDetailContext(
  popId: string,
  saleId: string,
): Promise<
  | { success: true; context: OperationSaleDetailContext }
  | { success: false; error: string }
> {
  const res = await fetch(
    `/api/pops/${popId}/operations/sales/${saleId}/context`,
    { headers: { accept: "application/json" } },
  )
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ context: OperationSaleDetailContext }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, context: json.data.context }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchOperationAccountingEntries(
  popId: string,
  input: {
    view: OperationsListView
    operationId: string
    groupedSaleIds?: string[]
  },
): Promise<
  | { success: true; entries: OperationAccountingEntryDetail[] }
  | { success: false; error: string }
> {
  const params = new URLSearchParams({
    view: input.view,
    operationId: input.operationId,
  })
  if (input.groupedSaleIds?.length) {
    params.set("groupedSaleIds", input.groupedSaleIds.join(","))
  }
  const res = await fetch(
    `/api/pops/${popId}/operations/accounting?${params}`,
    { headers: { accept: "application/json" } },
  )
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ entries: OperationAccountingEntryDetail[] }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, entries: json.data.entries }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function fetchChannelOperationTicketDisplay(
  popId: string,
  input: {
    tableSessionId?: string | null
    counterOrderId?: string | null
  },
): Promise<
  | { success: true; ticket: ChannelCheckoutTicketDisplay }
  | { success: false; error: string }
> {
  const params = new URLSearchParams()
  if (input.tableSessionId) params.set("tableSessionId", input.tableSessionId)
  if (input.counterOrderId) params.set("counterOrderId", input.counterOrderId)
  const res = await fetch(`/api/pops/${popId}/operations/ticket?${params}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ checkout: TableSessionCheckoutSnapshot }>
    | ApiErr
    | null
  if (!(res.ok && json && "success" in json && json.success)) {
    return {
      success: false,
      error:
        json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    }
  }
  const checkout = json.data.checkout
  if (!checkout?.carrito?.length) {
    return {
      success: false,
      error: "No hay ticket guardado para esta operación.",
    }
  }
  const catalog = await getMenuCatalog(popId)
  if (!catalog.success) {
    return {
      success: false,
      error: catalog.error || "No se pudo cargar el menú.",
    }
  }
  return {
    success: true,
    ticket: buildChannelCheckoutTicketDisplay({
      checkout,
      menuArticles: catalog.articles,
      menuRecipes: catalog.recipes,
      menuPromotions: catalog.promotions,
      menuQuantityDeals: catalog.quantityDeals,
    }),
  }
}
