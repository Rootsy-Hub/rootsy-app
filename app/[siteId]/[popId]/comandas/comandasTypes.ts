export type ComandaStatus =
  | "pending"
  | "sent"
  | "preparing"
  | "ready"
  | "delivered"
  | "voided"

export type ComandaSendKind = "order" | "void"

export type ComandaSourceKind = "table" | "counter"

export type ComandaTicket = {
  id: string
  stationId: string
  status: ComandaStatus
  sourceKind: ComandaSourceKind
  sourceId: string
  cartLineId: string
  recipeId: string | null
  recipeName: string
  quantity: number
  comment: string
  originLabel: string
  customerName: string
  createdAt: string
  updatedAt: string
  statusChangedAt: string
  sentAt: string | null
  preparingAt: string | null
  readyAt: string | null
  deliveredAt: string | null
  sendId: string | null
  sendKind: ComandaSendKind
  sendComment: string
}

export type PendingComandaItem = {
  id: string
  cartLineId: string
  recipeName: string
  quantity: number
  comment: string
  stationId: string
  stationName: string
}

export type ComandaSendPeel = {
  fromCartLineId: string
  sentCartLineId: string
  sentQuantity: number
  remainderQuantity: number
}

export type ComandaVoidPeel = {
  fromCartLineId: string
  voidedCartLineId: string
  voidedQuantity: number
  remainderQuantity: number
}

export type ComandaBoardCard = {
  id: string
  primaryItemId: string
  sendId: string | null
  sendKind: ComandaSendKind
  status: ComandaStatus
  stationId: string
  sourceKind: ComandaSourceKind
  originLabel: string
  customerName: string
  sendComment: string
  createdAt: string
  statusChangedAt: string
  items: Array<{
    id: string
    recipeName: string
    quantity: number
    comment: string
  }>
}

export type ComandaStation = {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
}

export const COMANDA_STATUS_LABELS: Record<ComandaStatus, string> = {
  pending: "Sin comandar",
  sent: "Comanda",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  voided: "Anulado",
}

export const COMANDA_BOARD_COLUMNS: ComandaStatus[] = [
  "sent",
  "preparing",
  "ready",
  "delivered",
]
