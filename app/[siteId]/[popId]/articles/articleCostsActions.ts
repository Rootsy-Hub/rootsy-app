"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import {
  mapArticleCostRow,
  type ArticleCostLineInput,
  type ArticleCostRow,
  validateArticleCostLines,
} from "@/lib/articleCosts"
import { createClient } from "@/utils/supabase/server"

const ARTICLE_COST_SELECT = `
  id,
  pop_id,
  article_id,
  supplier_id,
  name,
  cost_unit_label,
  sale_units_per_cost_unit,
  unit_price,
  is_active,
  sort_order,
  created_at,
  updated_at,
  suppliers ( id, name )
`

export async function getPopArticleCosts(
  popId: string,
  articleId: string,
): Promise<
  | { success: true; costs: ArticleCostRow[] }
  | { success: false; error: string; costs: ArticleCostRow[] }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso", costs: [] }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.ARTICLE_READ.resource,
        POP_PERMS.ARTICLE_READ.action,
      )
    ) {
      return { success: false, error: "Sin permiso para ver artículos.", costs: [] }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("article_costs")
      .select(ARTICLE_COST_SELECT)
      .eq("pop_id", popId)
      .eq("article_id", articleId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      return {
        success: false,
        error: error.message || "No se pudieron cargar los costos.",
        costs: [],
      }
    }

    return {
      success: true,
      costs: (data ?? []).map((row) =>
        mapArticleCostRow(row as Record<string, unknown>),
      ),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message, costs: [] }
  }
}

export async function syncArticleCosts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  articleId: string,
  lines: ArticleCostLineInput[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const validated = validateArticleCostLines(lines)
  if (!validated.ok) {
    return { ok: false, error: validated.error }
  }

  const normalized = validated.lines
  const supplierIds = [
    ...new Set(
      normalized
        .map((line) => line.supplierId?.trim())
        .filter((id): id is string => Boolean(id)),
    ),
  ]

  if (supplierIds.length > 0) {
    const { data: validRows, error: validErr } = await supabase
      .from("suppliers")
      .select("id")
      .eq("pop_id", popId)
      .in("id", supplierIds)
    if (validErr) {
      return {
        ok: false,
        error: validErr.message || "No se pudieron validar proveedores.",
      }
    }
    const validIds = new Set((validRows ?? []).map((row) => String(row.id)))
    for (const id of supplierIds) {
      if (!validIds.has(id)) {
        return { ok: false, error: "Un proveedor del costo no es válido." }
      }
    }
  }

  const { error: delErr } = await supabase
    .from("article_costs")
    .delete()
    .eq("article_id", articleId)
    .eq("pop_id", popId)
  if (delErr) {
    return { ok: false, error: delErr.message || "No se pudieron actualizar costos." }
  }

  if (normalized.length === 0) return { ok: true }

  const { error: insErr } = await supabase.from("article_costs").insert(
    normalized.map((line, index) => ({
      pop_id: popId,
      article_id: articleId,
      supplier_id: line.supplierId?.trim() || null,
      name: (line.name ?? "").trim(),
      cost_unit_label: line.costUnitLabel.trim(),
      sale_units_per_cost_unit: line.saleUnitsPerCostUnit,
      unit_price: line.unitPrice,
      is_active: line.isActive !== false,
      sort_order: index,
    })),
  )
  if (insErr) {
    return { ok: false, error: insErr.message || "No se pudieron guardar los costos." }
  }

  return { ok: true }
}
