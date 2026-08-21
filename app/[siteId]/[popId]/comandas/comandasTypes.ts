export type ComandaStatus =
  | "pending"
  | "sent"
  | "preparing"
  | "ready"
  | "delivered"

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
}

export type ComandaStation = {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
}

export const COMANDA_STATUS_LABELS: Record<ComandaStatus, string> = {
  pending: "Sin comandar",
  sent: "Comandado",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
}

export const COMANDA_BOARD_COLUMNS: ComandaStatus[] = [
  "sent",
  "preparing",
  "ready",
  "delivered",
]
