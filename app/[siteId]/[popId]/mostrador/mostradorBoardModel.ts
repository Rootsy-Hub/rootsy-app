import type {
  CounterBoardTab,
  CounterOrder,
} from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"
import { Bike, CheckCircle2, ChefHat, type LucideIcon } from "lucide-react"

export const MOSTRADOR_BOARD_COLUMNS: {
  id: CounterBoardTab
  label: string
  icon: LucideIcon
}[] = [
  { id: "preparing", label: "Preparando", icon: ChefHat },
  { id: "dispatched", label: "Enviados", icon: Bike },
  { id: "delivered", label: "Entregados", icon: CheckCircle2 },
]

export function mostradorOrderSubtitle(order: CounterOrder): string {
  if (order.fulfillmentType === "delivery") {
    return order.phone || order.deliveryAddress || "Delivery"
  }
  return "Mostrador"
}

export function canMoveMostradorOrderTo(
  order: CounterOrder,
  targetColumn: CounterBoardTab,
): boolean {
  if (order.status === targetColumn) return false
  if (targetColumn === "dispatched" && order.fulfillmentType !== "delivery") {
    return false
  }
  return true
}

export function mostradorMoveTargets(order: CounterOrder) {
  return MOSTRADOR_BOARD_COLUMNS.filter((column) =>
    canMoveMostradorOrderTo(order, column.id),
  )
}
