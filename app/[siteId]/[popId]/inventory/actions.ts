import type { InventoryAttention } from "@/lib/inventory/inventoryStockLevels"

export type { InventoryLocationRow } from "@/lib/inventory/inventoryLocations"

export type InventoryMovementType =
  | "sale"
  | "purchase_receipt"
  | "adjustment"
  | "return_customer"
  | "return_supplier"
  | "transfer_in"
  | "transfer_out"
  | "initial"

export type InventoryArticleOption = {
  id: string
  name: string
  costPrice: number
}

export type InventoryMovementRow = {
  id: string
  articleId: string
  articleName: string
  quantityDelta: number
  movementType: string
  note: string
  createdAt: string
  createdBy: string | null
}

export type InventoryBalanceRow = {
  articleId: string
  articleName: string
  onHand: number
}

export type InventoryArticleRow = {
  articleId: string
  name: string
  unitOfMeasure: string
  onHand: number
  minLevel: number | null
  unitCost: number
  inventoryValue: number
  attention: InventoryAttention
  suggestedMin: number | null
  suggestedMax: number | null
  qtyToBuy: number
}

export type InventoryUnitStock = {
  unitOfMeasure: string
  quantity: number
  articleCount: number
}

export type InventoryMetrics = {
  articleCount: number
  articlesWithStock: number
  unitsInStock: number
  unitsByMeasure: InventoryUnitStock[]
  inventoryValue: number
  redCount: number
  negativeCount: number
  emptyCount: number
  belowMinCount: number
  overstockCount: number
  purchaseCount: number
  recommendationCount: number
}

export type InventoryExpirySummary = {
  expiredCount: number
  soonCount: number
  total: number
}

export type InventoryCostLayerRow = {
  id: string
  articleId: string
  articleName: string
  sourceMovementId: string | null
  quantityReceived: number
  quantityRemaining: number
  unitCost: number
  receivedAt: string
  expiresAt: string | null
  locationId: string
  locationName: string
  unitOfMeasure: string
}

export type InventoryLayerAllocationRow = {
  id: string
  layerId: string
  articleId: string
  articleName: string
  inventoryMovementId: string
  movementType: string
  quantity: number
  unitCost: number
  lineCost: number
  createdAt: string
}

export type CreateInventoryAdjustmentInput = {
  articleId: string
  quantityDelta: number
  note: string
  locationId?: string
  expiresAt?: string | null
}

export type GetArticleInventoryBalanceInput = {
  articleId: string
  locationId?: string
}

export type InventoryArticleSearchHit = {
  id: string
  name: string
  unitOfMeasure: string
  sku: string | null
  barcode: string | null
}

export type ApplyInventoryMinStockRecommendationsInput = {
  articleIds?: string[]
}
