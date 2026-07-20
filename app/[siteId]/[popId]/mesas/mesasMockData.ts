import type {
  MesaSalon,
  MesaSession,
  MesaTable,
  MesaWaiter,
  MesaFloorDecor,
  MesaFloorDecorKind,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"

export const MOCK_MESA_WAITERS: MesaWaiter[] = [
  { id: "w1", name: "Lucía Fernández", initials: "LF" },
  { id: "w2", name: "Martín Gómez", initials: "MG" },
  { id: "w3", name: "Sofía Ruiz", initials: "SR" },
  { id: "w4", name: "Diego Acosta", initials: "DA" },
]

export const MOCK_MESA_SALONS: MesaSalon[] = [
  { id: "salon-a", name: "Interior A", sortOrder: 1 },
  { id: "salon-b", name: "Interior B", sortOrder: 2 },
  { id: "patio", name: "Patio", sortOrder: 3 },
  { id: "frente", name: "Frente", sortOrder: 4 },
]

function t(
  id: string,
  salonId: string,
  label: string,
  shape: MesaTable["shape"],
  x: number,
  y: number,
  seats: number,
  status: MesaTable["status"] = "free",
  sessionId: string | null = null,
): MesaTable {
  return {
    id,
    salonId,
    label,
    shape,
    x,
    y,
    rotation: 0,
    seats,
    status,
    sessionId,
  }
}

export const MOCK_MESA_TABLES: MesaTable[] = [
  // Interior A
  t("a1", "salon-a", "1", { kind: "round", size: "m" }, 48, 56, 4),
  t("a2", "salon-a", "2", { kind: "round", size: "l" }, 160, 48, 6),
  t("a3", "salon-a", "3", { kind: "square", size: "m" }, 300, 64, 4),
  t("a4", "salon-a", "4", { kind: "rect", size: "m" }, 420, 52, 8),
  t("a5", "salon-a", "5", { kind: "round", size: "s" }, 72, 200, 2),
  t("a6", "salon-a", "6", { kind: "square", size: "l" }, 200, 180, 6, "open", "sess-1"),
  t("a7", "salon-a", "7", { kind: "round", size: "xl" }, 360, 200, 8, "reserved"),
  t("a8", "salon-a", "8", { kind: "rect", size: "l" }, 520, 180, 10),
  // Interior B
  t("b1", "salon-b", "11", { kind: "round", size: "m" }, 64, 72, 4),
  t("b2", "salon-b", "12", { kind: "square", size: "m" }, 180, 56, 4, "paying", "sess-2"),
  t("b3", "salon-b", "13", { kind: "rect", size: "s" }, 320, 80, 4, "paying", "sess-2"),
  t("b4", "salon-b", "14", { kind: "round", size: "l" }, 460, 64, 6),
  t("b5", "salon-b", "15", { kind: "square", size: "s" }, 100, 220, 2),
  t("b6", "salon-b", "16", { kind: "round", size: "m" }, 260, 200, 4),
  // Patio
  t("p1", "patio", "P1", { kind: "round", size: "l" }, 80, 90, 6),
  t("p2", "patio", "P2", { kind: "round", size: "l" }, 220, 80, 6),
  t("p3", "patio", "P3", { kind: "square", size: "l" }, 380, 100, 6),
  t("p4", "patio", "P4", { kind: "rect", size: "m" }, 540, 88, 8),
  t("p5", "patio", "P5", { kind: "round", size: "m" }, 140, 240, 4),
  // Frente
  t("f1", "frente", "F1", { kind: "square", size: "s" }, 56, 80, 2),
  t("f2", "frente", "F2", { kind: "square", size: "s" }, 140, 80, 2),
  t("f3", "frente", "F3", { kind: "round", size: "s" }, 224, 72, 2),
  t("f4", "frente", "F4", { kind: "rect", size: "s" }, 320, 64, 4),
]

function d(
  id: string,
  salonId: string,
  kind: MesaFloorDecorKind,
  x: number,
  y: number,
  width: number,
  height: number,
  label?: string,
): MesaFloorDecor {
  return { id, salonId, kind, x, y, width, height, rotation: 0, label }
}

/** Elementos de ambientación del plano (paredes, plantas, barra…) por salón. */
export const MOCK_MESA_FLOOR_DECORS: MesaFloorDecor[] = [
  // Interior A — sector mesas + pasillo + barra
  d("da-wall-v", "salon-a", "wall_v", 248, 32, 10, 320),
  d("da-wall-h", "salon-a", "wall_h", 16, 168, 560, 8),
  d("da-entrance", "salon-a", "entrance", 16, 8, 120, 36, "Ingreso salón"),
  d("da-bar", "salon-a", "bar", 268, 48, 100, 48, "Barra"),
  d("da-pillar", "salon-a", "pillar", 268, 200, 28, 28),
  d("da-plant-1", "salon-a", "plant", 16, 188, 40, 40),
  d("da-plant-2", "salon-a", "plant", 580, 48, 36, 36),
  d("da-planter", "salon-a", "planter", 560, 360, 56, 56),

  // Interior B — división central
  d("db-wall-v", "salon-b", "wall_v", 400, 24, 10, 280),
  d("db-wall-h", "salon-b", "wall_h", 24, 160, 520, 8),
  d("db-plant-1", "salon-b", "plant", 24, 180, 44, 44),
  d("db-plant-2", "salon-b", "plant", 420, 200, 40, 40),
  d("db-pillar", "salon-b", "pillar", 400, 160, 24, 24),
  d("db-entrance", "salon-b", "entrance", 200, 8, 100, 32, "Pasillo"),

  // Patio — maceteros perimetrales
  d("dp-planter-1", "patio", "planter", 16, 16, 64, 64),
  d("dp-planter-2", "patio", "planter", 620, 16, 64, 64),
  d("dp-wall-h", "patio", "wall_h", 16, 320, 680, 6),
  d("dp-plant-1", "patio", "plant", 640, 280, 48, 48),
  d("dp-plant-2", "patio", "plant", 24, 280, 48, 48),
  d("dp-plant-3", "patio", "plant", 340, 340, 40, 40),

  // Frente — mostrador + ingreso calle
  d("df-bar", "frente", "bar", 16, 16, 180, 44, "Mostrador"),
  d("df-entrance", "frente", "entrance", 220, 8, 140, 36, "A la calle"),
  d("df-wall-h", "frente", "wall_h", 16, 72, 400, 6),
  d("df-plant", "frente", "plant", 380, 16, 36, 36),
]

export const MOCK_MESA_SESSIONS: MesaSession[] = [
  {
    id: "sess-1",
    tableIds: ["a6"],
    waiterId: "w1",
    guestCount: 4,
    note: "Sin gluten en la mesa",
    openedAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    checkout: null,
  },
  {
    id: "sess-2",
    tableIds: ["b2", "b3"],
    waiterId: "w2",
    guestCount: 6,
    note: "",
    openedAt: new Date(Date.now() - 20 * 60_000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60_000).toISOString(),
    checkout: null,
  },
]
