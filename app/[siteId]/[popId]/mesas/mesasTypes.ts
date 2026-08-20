import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import type { MesaSessionFloorStatus } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"

export type MesaTableStatus = "free" | "open" | "paying" | "reserved"

export type RoundTableSize = "s" | "m" | "l" | "xl"
export type SquareTableSize = "s" | "m" | "l"
export type RectTableSize = "s" | "m" | "l" | "xl"

export type MesaTableShape =
  | { kind: "round"; size: RoundTableSize }
  | { kind: "square"; size: SquareTableSize }
  | { kind: "rect"; size: RectTableSize }

export type MesaSalon = {
  id: string
  name: string
  sortOrder: number
  isActive?: boolean
}

export type MesaTable = {
  id: string
  salonId: string
  label: string
  shape: MesaTableShape
  x: number
  y: number
  rotation: number
  seats: number
  status: MesaTableStatus
  sessionId: string | null
  reservationId: string | null
}

export type MesaReservationStatus =
  | "pending"
  | "confirmed"
  | "seated"
  | "completed"
  | "no_show"
  | "cancelled"

export type MesaReservation = {
  id: string
  tableId: string | null
  clientId: string | null
  clientName: string
  guestCount: number | null
  arrivalAt: string
  status: MesaReservationStatus
  note: string
  updatedAt: string
}

export type MesaReservationInput = {
  tableId: string | null
  clientId: string | null
  clientName: string
  guestCount?: number | null
  arrivalAt: string
  status?: MesaReservationStatus
  note?: string
  reservationId?: string
}

export type MesaWaiter = {
  id: string
  name: string
  initials: string
}

export type MesaSession = {
  id: string
  tableIds: string[]
  waiterId: string
  guestCount: number | null
  note: string
  openedAt: string
  updatedAt: string
  checkout: TableSessionCheckoutSnapshot | null
  floorStatus: MesaSessionFloorStatus
}

export type MesaOpenSessionInput = {
  tableIds: string[]
  waiterId: string
  guestCount: number | null
  note: string
}

export type MesasLeftPanelView = "floor" | "catalog"
export type MesasRightPanelView = "session" | "cart" | "agenda"

/** Elementos fijos del plano (no mesas): arquitectura, amenidades, zonas. */
export const MESA_FLOOR_DECOR_KINDS = [
  "wall_h",
  "wall_v",
  "pillar",
  "entrance",
  "window",
  "bar",
  "register",
  "restroom",
  "kitchen",
  "stairs",
  "plant",
  "planter",
  "label",
  "zone",
] as const

export type MesaFloorDecorKind = (typeof MESA_FLOOR_DECOR_KINDS)[number]

export type MesaFloorDecor = {
  id: string
  salonId: string
  kind: MesaFloorDecorKind
  x: number
  y: number
  width: number
  height: number
  rotation: number
  /** Etiqueta accesible / opcional en UI */
  label?: string
}
