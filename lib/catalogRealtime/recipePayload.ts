import { recipeDumpRowToSnapshot } from "@/lib/popLocalDb/mapRecipe"
import type { RecipeSnapshot } from "@/lib/popLocalDb/types"

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value)
}

export function recipeSnapshotFromRealtimePayload(
  raw: unknown,
): RecipeSnapshot | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  const id = asString(row.id).trim()
  const name = asString(row.name).trim()
  if (!id || !name) return null
  return recipeDumpRowToSnapshot({
    id,
    name,
    description: asString(row.description),
    imageUrl:
      typeof row.imageUrl === "string" && row.imageUrl.trim()
        ? row.imageUrl.trim()
        : null,
    categoryId:
      typeof row.categoryId === "string" && row.categoryId.trim()
        ? row.categoryId.trim()
        : null,
    categoryName: asString(row.categoryName),
    salePrice: Number(row.salePrice) || 0,
    iva: Number(row.iva) || 0,
    isActive: row.isActive !== false,
    allowNegativeStock: Boolean(row.allowNegativeStock),
    stationId:
      typeof row.stationId === "string" && row.stationId.trim()
        ? row.stationId.trim()
        : null,
    listPrices: Array.isArray(row.listPrices)
      ? row.listPrices.flatMap((item) => {
          if (!item || typeof item !== "object") return []
          const price = item as { listId?: unknown; amount?: unknown }
          const listId = asString(price.listId)
          const amount = Number(price.amount)
          if (!listId || !Number.isFinite(amount)) return []
          return [{ listId, amount }]
        })
      : [],
  })
}

export function recipeIdFromRealtimeEvent(payload: Record<string, unknown>) {
  if (typeof payload.recipeId === "string" && payload.recipeId.trim()) {
    return payload.recipeId.trim()
  }
  const recipe = payload.recipe
  if (recipe && typeof recipe === "object" && "id" in recipe) {
    const id = (recipe as { id?: unknown }).id
    if (typeof id === "string" && id.trim()) return id.trim()
  }
  return null
}
