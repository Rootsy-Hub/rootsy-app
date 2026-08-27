import { dtoToRecipeCategorySnapshot } from "@/lib/popLocalDb/mapRecipeCategory"
import type { RecipeCategorySnapshot } from "@/lib/popLocalDb/types"

export function recipeCategorySnapshotFromRealtimePayload(
  raw: unknown,
): RecipeCategorySnapshot | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  const id = typeof row.id === "string" ? row.id.trim() : ""
  const name = typeof row.name === "string" ? row.name.trim() : ""
  if (!id || !name) return null
  return dtoToRecipeCategorySnapshot({
    id,
    name,
    sortOrder: Number(row.sortOrder ?? 0) || 0,
    showInMenu: row.showInMenu !== false,
    isActive: row.isActive !== false,
    stationId:
      typeof row.stationId === "string" && row.stationId.trim()
        ? row.stationId.trim()
        : null,
  })
}

export function recipeCategoryIdFromRealtimeEvent(
  payload: Record<string, unknown>,
) {
  if (typeof payload.categoryId === "string" && payload.categoryId.trim()) {
    return payload.categoryId.trim()
  }
  const category = payload.category
  if (category && typeof category === "object" && "id" in category) {
    const id = (category as { id?: unknown }).id
    if (typeof id === "string" && id.trim()) return id.trim()
  }
  return null
}
