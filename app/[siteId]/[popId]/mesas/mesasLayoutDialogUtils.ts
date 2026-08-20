import type {
  MesasFloorDecorRow,
  MesasLayoutData,
  MesasSalonRow,
  MesasSortOrderUpdate,
  MesasTableRow,
  UpsertMesasFloorDecorInput,
  UpsertMesasSalonInput,
  UpsertMesasTableInput,
} from "@/app/[siteId]/[popId]/mesas/actions"
import type {
  MesaFloorDecorKind,
  MesaSalon,
  MesaTableShape,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"

export const decorKindOptions: { value: MesaFloorDecorKind; label: string }[] = [
  { value: "wall_h", label: "Pared horizontal" },
  { value: "wall_v", label: "Pared vertical" },
  { value: "pillar", label: "Columna" },
  { value: "entrance", label: "Puerta / acceso" },
  { value: "window", label: "Ventana" },
  { value: "bar", label: "Barra" },
  { value: "register", label: "Caja" },
  { value: "restroom", label: "Baños" },
  { value: "kitchen", label: "Cocina" },
  { value: "stairs", label: "Escalera" },
  { value: "plant", label: "Planta" },
  { value: "planter", label: "Macetero" },
  { value: "label", label: "Texto / etiqueta" },
  { value: "zone", label: "Zona / área" },
]

export const shapeOptions: { value: MesaTableShape["kind"]; label: string }[] = [
  { value: "round", label: "Redonda" },
  { value: "square", label: "Cuadrada" },
  { value: "rect", label: "Rectangular" },
]

export function defaultDecorSize(kind: MesaFloorDecorKind): {
  width: number
  height: number
} {
  switch (kind) {
    case "wall_h":
      return { width: 180, height: 6 }
    case "wall_v":
      return { width: 6, height: 180 }
    case "window":
      return { width: 88, height: 14 }
    case "bar":
      return { width: 132, height: 36 }
    case "entrance":
      return { width: 72, height: 28 }
    case "register":
    case "restroom":
    case "kitchen":
    case "stairs":
      return { width: 56, height: 56 }
    case "pillar":
      return { width: 22, height: 22 }
    case "plant":
      return { width: 28, height: 28 }
    case "planter":
      return { width: 44, height: 44 }
    case "label":
      return { width: 148, height: 24 }
    case "zone":
      return { width: 200, height: 140 }
  }
}

export function decorKindLabel(kind: MesaFloorDecorKind): string {
  return decorKindOptions.find((o) => o.value === kind)?.label ?? kind
}

export function decorLabelPlaceholder(kind: MesaFloorDecorKind): string {
  if (kind === "label" || kind === "zone") {
    return "Terraza, Patio, VIP, Sector fumadores…"
  }
  if (kind === "entrance") return "Entrada, salida, acceso…"
  if (kind === "bar") return "Barra tragos, mostrador…"
  if (kind === "register") return "Caja 1, cobro…"
  return "Nombre opcional del elemento"
}

export function defaultSalonForm(sortOrder: number): UpsertMesasSalonInput {
  return { name: "", sortOrder, isActive: true }
}

export function defaultTableForm(
  salonId: string,
  sortOrder: number,
): UpsertMesasTableInput {
  return {
    salonId,
    label: "",
    shape: { kind: "round", size: "m" },
    x: 64,
    y: 64,
    seats: 4,
    sortOrder,
    isActive: true,
  }
}

export function defaultDecorForm(
  salonId: string,
  sortOrder: number,
): UpsertMesasFloorDecorInput {
  const kind: MesaFloorDecorKind = "wall_h"
  const size = defaultDecorSize(kind)
  return {
    salonId,
    kind,
    x: 64,
    y: 64,
    width: size.width,
    height: size.height,
    label: "",
    sortOrder,
    isActive: true,
  }
}

export function tableRowToForm(row: MesasTableRow): UpsertMesasTableInput {
  return {
    id: row.id,
    salonId: row.salonId,
    label: row.label,
    shape: row.shape,
    x: row.x,
    y: row.y,
    seats: row.seats,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  }
}

export function decorRowToForm(row: MesasFloorDecorRow): UpsertMesasFloorDecorInput {
  return {
    id: row.id,
    salonId: row.salonId,
    kind: row.kind,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
    label: row.label,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  }
}

export function mapActiveLayoutSalons(rows: MesasSalonRow[]): MesaSalon[] {
  return rows
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((s) => ({
      id: s.id,
      name: s.name,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    }))
}

export function resolveFormSalonId(
  filterSalonId: string,
  fallbackSalonId: string,
): string {
  if (filterSalonId && filterSalonId !== "all") return filterSalonId
  return fallbackSalonId
}

export function applyLayoutSalons(data: MesasLayoutData): MesaSalon[] {
  return mapActiveLayoutSalons(data.salons)
}

export function mesasSortOrderUpdatesFromIds(ids: string[]): MesasSortOrderUpdate[] {
  return ids.map((id, sortOrder) => ({ id, sortOrder }))
}

export function sortMesasByOrder<T extends { sortOrder: number; id: string }>(
  rows: T[],
  labelKey?: (row: T) => string,
): T[] {
  return [...rows].sort((a, b) => {
    const byOrder = a.sortOrder - b.sortOrder
    if (byOrder !== 0) return byOrder
    if (labelKey) return labelKey(a).localeCompare(labelKey(b), "es")
    return a.id.localeCompare(b.id)
  })
}
