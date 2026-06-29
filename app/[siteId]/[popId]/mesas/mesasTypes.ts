export type MesaTableStatus = "free" | "open" | "paying" | "reserved"

export type RoundTableSize = "s" | "m" | "l" | "xl"
export type SquareTableSize = "s" | "m" | "l"
export type RectTableSize = "sm" | "md" | "lg"

export type MesaTableShape =
  | { kind: "round"; size: RoundTableSize }
  | { kind: "square"; size: SquareTableSize }
  | { kind: "rect"; size: RectTableSize }

export type MesaSalon = {
  id: string
  name: string
  sortOrder: number
}

export type MesaTable = {
  id: string
  salonId: string
  label: string
  shape: MesaTableShape
  x: number
  y: number
  seats: number
  status: MesaTableStatus
  sessionId: string | null
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
}

export type MesaOpenSessionInput = {
  tableIds: string[]
  waiterId: string
  guestCount: number | null
  note: string
}

export type MesasLeftPanelView = "floor" | "catalog"
export type MesasRightPanelView = "session" | "cart"

/** Elementos fijos del plano (no mesas): paredes, plantas, barra, etc. */
export type MesaFloorDecorKind =
  | "wall_h"
  | "wall_v"
  | "plant"
  | "planter"
  | "pillar"
  | "bar"
  | "entrance"

export type MesaFloorDecor = {
  id: string
  salonId: string
  kind: MesaFloorDecorKind
  x: number
  y: number
  width: number
  height: number
  /** Etiqueta accesible / opcional en UI */
  label?: string
}
