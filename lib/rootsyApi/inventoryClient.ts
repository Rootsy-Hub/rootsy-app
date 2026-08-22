import type {
  CreateInventoryAdjustmentInput,
  InventoryArticleRow,
  InventoryArticleSearchHit,
  InventoryCostLayerRow,
  InventoryExpirySummary,
  InventoryLayerAllocationRow,
  InventoryMetrics,
  InventoryMovementRow,
} from "@/app/[siteId]/[popId]/inventory/actions"
import type { InventoryLocationRow } from "@/lib/inventory/inventoryLocations"

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error?: string }
type MutateResult = { success: true } | { success: false; error: string }

export type InventoryLocationSlim = {
  id: string
  name: string
  isDefault: boolean
  isSellable: boolean
}

export type PopInventoryResult =
  | {
      success: true
      articleRows: InventoryArticleRow[]
      metrics: InventoryMetrics
      locations: InventoryLocationSlim[]
      expiry: InventoryExpirySummary
    }
  | {
      success: false
      error: string
      articleRows: InventoryArticleRow[]
      metrics: InventoryMetrics
      locations: InventoryLocationSlim[]
      expiry: InventoryExpirySummary
    }

const EMPTY_METRICS: InventoryMetrics = {
  articleCount: 0,
  articlesWithStock: 0,
  unitsInStock: 0,
  unitsByMeasure: [],
  inventoryValue: 0,
  redCount: 0,
  negativeCount: 0,
  emptyCount: 0,
  belowMinCount: 0,
  overstockCount: 0,
  purchaseCount: 0,
  recommendationCount: 0,
}

const EMPTY_EXPIRY: InventoryExpirySummary = {
  expiredCount: 0,
  soonCount: 0,
  total: 0,
}

const EMPTY_LIST: Omit<
  Extract<PopInventoryResult, { success: false }>,
  "success" | "error"
> = {
  articleRows: [],
  metrics: EMPTY_METRICS,
  locations: [],
  expiry: EMPTY_EXPIRY,
}

async function parseMutate(res: Response): Promise<MutateResult> {
  const json = (await res.json().catch(() => null)) as
    | { success?: boolean; error?: string }
    | null
  if (res.ok && json && json.success) return { success: true }
  return {
    success: false,
    error:
      json && typeof json.error === "string" && json.error
        ? json.error
        : `HTTP ${res.status}`,
  }
}

export function slimToLocationRow(
  row: InventoryLocationSlim,
): InventoryLocationRow {
  return {
    id: row.id,
    name: row.name,
    isDefault: row.isDefault,
    isSellable: row.isSellable,
    articleCount: 0,
    inventoryValue: 0,
    canArchive: false,
  }
}

export type PopInventorySummaryResult =
  | {
      success: true
      metrics: InventoryMetrics
      locations: InventoryLocationSlim[]
      expiry: InventoryExpirySummary
    }
  | {
      success: false
      error: string
      metrics: InventoryMetrics
      locations: InventoryLocationSlim[]
      expiry: InventoryExpirySummary
    }

const EMPTY_SUMMARY: Omit<
  Extract<PopInventorySummaryResult, { success: false }>,
  "success" | "error"
> = {
  metrics: EMPTY_METRICS,
  locations: [],
  expiry: EMPTY_EXPIRY,
}

export async function fetchPopInventorySummary(
  popId: string,
): Promise<PopInventorySummaryResult> {
  const res = await fetch(`/api/pops/${popId}/inventory/summary`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{
        metrics: InventoryMetrics
        locations: InventoryLocationSlim[]
        expiry: InventoryExpirySummary
      }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return {
      success: true,
      metrics: json.data.metrics,
      locations: json.data.locations,
      expiry: json.data.expiry,
    }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    ...EMPTY_SUMMARY,
  }
}

export async function fetchPopInventory(
  popId: string,
): Promise<PopInventoryResult> {
  const res = await fetch(`/api/pops/${popId}/inventory`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{
        articleRows: InventoryArticleRow[]
        metrics: InventoryMetrics
        locations: InventoryLocationSlim[]
        expiry: InventoryExpirySummary
      }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return {
      success: true,
      articleRows: json.data.articleRows,
      metrics: json.data.metrics,
      locations: json.data.locations,
      expiry: json.data.expiry,
    }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    ...EMPTY_LIST,
  }
}

export async function fetchPopInventoryMovements(
  popId: string,
): Promise<
  | { success: true; movements: InventoryMovementRow[] }
  | { success: false; error: string; movements: InventoryMovementRow[] }
> {
  const res = await fetch(`/api/pops/${popId}/inventory/movements`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ movements: InventoryMovementRow[] }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, movements: json.data.movements }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    movements: [],
  }
}

export async function fetchPopInventoryLedger(
  popId: string,
): Promise<
  | {
      success: true
      costLayers: InventoryCostLayerRow[]
      layerAllocations: InventoryLayerAllocationRow[]
    }
  | {
      success: false
      error: string
      costLayers: InventoryCostLayerRow[]
      layerAllocations: InventoryLayerAllocationRow[]
    }
> {
  const res = await fetch(`/api/pops/${popId}/inventory/ledger`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{
        costLayers: InventoryCostLayerRow[]
        layerAllocations: InventoryLayerAllocationRow[]
      }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return {
      success: true,
      costLayers: json.data.costLayers,
      layerAllocations: json.data.layerAllocations,
    }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    costLayers: [],
    layerAllocations: [],
  }
}

export async function fetchPopInventoryLocations(
  popId: string,
): Promise<
  | { success: true; locations: InventoryLocationRow[] }
  | { success: false; error: string; locations: InventoryLocationRow[] }
> {
  const res = await fetch(`/api/pops/${popId}/inventory/locations`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ locations: InventoryLocationRow[] }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, locations: json.data.locations }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
    locations: [],
  }
}

export async function searchInventoryArticles(
  popId: string,
  query: string,
): Promise<
  | { success: true; articles: InventoryArticleSearchHit[] }
  | { success: false; error: string }
> {
  const params = new URLSearchParams({ q: query })
  const res = await fetch(`/api/pops/${popId}/inventory/articles?${params}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ articles: InventoryArticleSearchHit[] }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, articles: json.data.articles }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function getArticleInventoryBalance(
  popId: string,
  input: { articleId: string; locationId?: string },
): Promise<{ success: true; onHand: number } | { success: false; error: string }> {
  const params = new URLSearchParams({ articleId: input.articleId })
  if (input.locationId) params.set("locationId", input.locationId)
  const res = await fetch(`/api/pops/${popId}/inventory/balance?${params}`, {
    headers: { accept: "application/json" },
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ onHand: number }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, onHand: json.data.onHand }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function createInventoryAdjustment(
  popId: string,
  input: CreateInventoryAdjustmentInput,
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/inventory/adjustments`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      articleId: input.articleId,
      quantityDelta: input.quantityDelta,
      note: input.note,
      locationId: input.locationId,
      expiresAt: input.expiresAt ?? null,
    }),
  })
  return parseMutate(res)
}

export async function applyInventoryMinStockRecommendations(
  popId: string,
  articleIds?: string[],
): Promise<
  | { success: true; applied: number }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/inventory/min-stock`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ articleIds }),
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ applied: number }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, applied: json.data.applied }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function deleteInventoryMovement(
  popId: string,
  movementId: string,
): Promise<MutateResult> {
  const res = await fetch(
    `/api/pops/${popId}/inventory/movements/${movementId}`,
    {
      method: "DELETE",
      headers: { accept: "application/json" },
    },
  )
  return parseMutate(res)
}

export async function createInventoryLocation(
  popId: string,
  name: string,
): Promise<
  { success: true; locationId: string } | { success: false; error: string }
> {
  const res = await fetch(`/api/pops/${popId}/inventory/locations`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  const json = (await res.json().catch(() => null)) as
    | ApiOk<{ locationId: string }>
    | ApiErr
    | null
  if (res.ok && json && "success" in json && json.success) {
    return { success: true, locationId: json.data.locationId }
  }
  return {
    success: false,
    error:
      json && "error" in json && json.error ? json.error : `HTTP ${res.status}`,
  }
}

export async function renameInventoryLocation(
  popId: string,
  locationId: string,
  name: string,
): Promise<MutateResult> {
  const res = await fetch(
    `/api/pops/${popId}/inventory/locations/${locationId}`,
    {
      method: "PATCH",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    },
  )
  return parseMutate(res)
}

export async function archiveInventoryLocation(
  popId: string,
  locationId: string,
): Promise<MutateResult> {
  const res = await fetch(
    `/api/pops/${popId}/inventory/locations/${locationId}/archive`,
    {
      method: "POST",
      headers: { accept: "application/json" },
    },
  )
  return parseMutate(res)
}

export async function transferInventoryStock(
  popId: string,
  input: {
    articleId: string
    fromLocationId: string
    toLocationId: string
    quantity: number
  },
): Promise<MutateResult> {
  const res = await fetch(`/api/pops/${popId}/inventory/transfers`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseMutate(res)
}

export async function setInventoryLayerExpiry(
  popId: string,
  input: { layerId: string; expiresAt: string | null; quantity?: number },
): Promise<MutateResult> {
  const res = await fetch(
    `/api/pops/${popId}/inventory/layers/${input.layerId}/expiry`,
    {
      method: "PATCH",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        expiresAt: input.expiresAt,
        quantity: input.quantity,
      }),
    },
  )
  return parseMutate(res)
}
