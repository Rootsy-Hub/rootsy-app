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
  { value: "entrance", label: "Ingreso / puerta" },
  { value: "bar", label: "Barra / mostrador" },
  { value: "wall_h", label: "Pared horizontal" },
  { value: "wall_v", label: "Pared vertical" },
  { value: "pillar", label: "Columna" },
  { value: "plant", label: "Planta" },
  { value: "planter", label: "Macetero" },
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
      return { width: 160, height: 8 }
    case "wall_v":
      return { width: 10, height: 160 }
    case "bar":
      return { width: 120, height: 44 }
    case "entrance":
      return { width: 120, height: 36 }
    case "pillar":
      return { width: 28, height: 28 }
    case "planter":
      return { width: 56, height: 56 }
    default:
      return { width: 40, height: 40 }
  }
}

export function decorKindLabel(kind: MesaFloorDecorKind): string {
  return decorKindOptions.find((o) => o.value === kind)?.label ?? kind
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
  const kind: MesaFloorDecorKind = "entrance"
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
