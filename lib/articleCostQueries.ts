import type { SupabaseClient } from "@supabase/supabase-js"

export type ArticleCostCatalogEntry = {
  id: string
  articleId: string
  name: string
  costUnitLabel: string
  saleUnitsPerCostUnit: number
  unitPrice: number
  supplierId: string | null
  sortOrder: number
}

function parseMoney(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

/** Cantidad de costos activos por artículo (consulta directa, sin embed PostgREST). */
export async function activeCostCountByArticleIds(
  supabase: SupabaseClient,
  popId: string,
  articleIds: string[],
): Promise<Map<string, number>> {
  const out = new Map<string, number>()
  if (articleIds.length === 0) return out

  const { data, error } = await supabase
    .from("article_costs")
    .select("article_id, is_active")
    .eq("pop_id", popId)
    .in("article_id", articleIds)

  if (error || !data) return out

  for (const row of data) {
    if (row.is_active === false) continue
    const id = String(row.article_id)
    out.set(id, (out.get(id) ?? 0) + 1)
  }
  return out
}

/** Costos activos del POP agrupados por artículo (consulta directa). */
export async function activeArticleCostsByArticleIdForPop(
  supabase: SupabaseClient,
  popId: string,
  articleIds?: string[],
): Promise<Map<string, ArticleCostCatalogEntry[]>> {
  const out = new Map<string, ArticleCostCatalogEntry[]>()

  let query = supabase
    .from("article_costs")
    .select(
      "id, article_id, name, cost_unit_label, sale_units_per_cost_unit, unit_price, supplier_id, is_active, sort_order",
    )
    .eq("pop_id", popId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (articleIds && articleIds.length > 0) {
    query = query.in("article_id", articleIds)
  }

  const { data, error } = await query
  if (error || !data) return out

  for (const row of data) {
    const costUnitLabel = String(row.cost_unit_label ?? "").trim()
    if (!costUnitLabel) continue
    const articleId = String(row.article_id)
    const entry: ArticleCostCatalogEntry = {
      id: String(row.id),
      articleId,
      name: String(row.name ?? ""),
      costUnitLabel,
      saleUnitsPerCostUnit:
        Number(row.sale_units_per_cost_unit ?? 0) || 0,
      unitPrice: parseMoney(row.unit_price),
      supplierId:
        row.supplier_id != null ? String(row.supplier_id) : null,
      sortOrder: Number(row.sort_order ?? 0) || 0,
    }
    const list = out.get(articleId) ?? []
    list.push(entry)
    out.set(articleId, list)
  }

  return out
}
