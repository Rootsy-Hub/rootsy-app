import type { RecipeCategoryOption } from "@/app/[siteId]/[popId]/recipes/actions"
import type { SqlParams } from "@/lib/popLocalDb/database"
import type { RecipeCategorySnapshot } from "@/lib/popLocalDb/types"

type SqlRecipeCategoryRow = {
  id: unknown
  name: unknown
  sort_order: unknown
  show_in_menu: unknown
  is_active: unknown
  station_id: unknown
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value)
}

function asNullableString(value: unknown): string | null {
  const text = asString(value).trim()
  return text ? text : null
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asBool(value: unknown, fallback = true): boolean {
  if (value == null) return fallback
  return value === 1 || value === true || value === "1"
}

export type RecipeCategoryDto = {
  id: string
  name: string
  sortOrder: number
  showInMenu?: boolean
  isActive?: boolean
  stationId?: string | null
}

export function dtoToRecipeCategorySnapshot(
  row: RecipeCategoryDto,
): RecipeCategorySnapshot {
  return {
    id: row.id,
    name: row.name,
    sortOrder: Number.isFinite(row.sortOrder) ? row.sortOrder : 0,
    showInMenu: row.showInMenu !== false,
    isActive: row.isActive !== false,
    stationId: row.stationId ?? null,
  }
}

export function recipeCategorySnapshotToOption(
  row: RecipeCategorySnapshot,
): RecipeCategoryOption {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sortOrder,
    showInMenu: row.showInMenu,
    isActive: row.isActive,
    stationId: row.stationId,
    stationName: null,
  }
}

export function sqlRecipeCategoryRowToSnapshot(
  row: SqlRecipeCategoryRow,
): RecipeCategorySnapshot {
  return {
    id: asString(row.id),
    name: asString(row.name),
    sortOrder: asNumber(row.sort_order),
    showInMenu: asBool(row.show_in_menu, true),
    isActive: asBool(row.is_active, true),
    stationId: asNullableString(row.station_id),
  }
}

export function recipeCategorySnapshotBindValues(
  row: RecipeCategorySnapshot,
  updatedAt = new Date().toISOString(),
): SqlParams {
  return [
    row.id,
    row.name,
    row.sortOrder,
    row.showInMenu ? 1 : 0,
    row.isActive ? 1 : 0,
    row.stationId,
    updatedAt,
  ]
}
