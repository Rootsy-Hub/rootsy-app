import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"

export type CounterOrderStatus = "preparing" | "dispatched" | "delivered" | "cancelled"

export type CounterFulfillmentType = "pickup" | "delivery"

export type CounterBoardTab = "preparing" | "dispatched" | "delivered"

export type MostradorRightPanelView = "detail" | "cart"

export const COUNTER_ESTIMATED_MINUTES_OPTIONS = [
  15, 20, 25, 30, 35, 40, 45, 50, 55, 60,
] as const

export type CounterOrder = {
  id: string
  orderDay: string
  orderNumber: number
  status: CounterOrderStatus
  fulfillmentType: CounterFulfillmentType
  deliveryAddress: string
  phone: string
  driverName: string
  estimatedMinutes: number
  notes: string
  immediateFulfillment: boolean
  saleId: string | null
  isPaid: boolean
  openedAt: string
  updatedAt: string
  deliveredAt: string | null
  checkout: TableSessionCheckoutSnapshot | null
}

export type CreateCounterOrderInput = {
  fulfillmentType: CounterFulfillmentType
  deliveryAddress?: string
  phone?: string
  driverName?: string
  estimatedMinutes: number
  notes?: string
  immediateFulfillment?: boolean
}

export type UpdateCounterOrderInput = Partial<CreateCounterOrderInput>
