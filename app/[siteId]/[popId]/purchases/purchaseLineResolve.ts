import type { PurchaseCheckoutLineInput, PurchaseLineBuilt } from "@/lib/purchaseCheckoutLines"
import { buildPurchaseLineFromInput } from "@/lib/purchaseCheckoutLines"
import { isArticleItemKind } from "@/lib/articleItemKind"
import type { createClient } from "@/utils/supabase/server"

function parseQty(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 1e6) / 1e6
}

function parseMoney(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

export async function resolvePurchaseCheckoutLine(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  input: PurchaseCheckoutLineInput,
): Promise<{ line: PurchaseLineBuilt } | { error: string }> {
  const articleId = input.articleId.trim()
  const articleCostId = input.articleCostId.trim()
  const costQty = parseQty(input.costQuantity)
  const unitCost = parseMoney(input.unitCost)

  if (!articleId || !articleCostId) {
    return { error: "Línea de compra incompleta." }
  }
  if (costQty <= 0) {
    return { error: "La cantidad de compra debe ser mayor que cero." }
  }
  if (unitCost < 0) {
    return { error: "El precio de la unidad de costo no puede ser negativo." }
  }

  const { data: artRow, error: artErr } = await supabase
    .from("articles")
    .select("id, name, iva, item_kind")
    .eq("id", articleId)
    .eq("pop_id", popId)
    .maybeSingle()
  if (artErr || !artRow) {
    return { error: "Artículo inválido o inactivo." }
  }
  const rawKind = String(artRow.item_kind ?? "merchandise")
  if (!isArticleItemKind(rawKind)) {
    return { error: "Tipo de artículo inválido para compra." }
  }

  const { data: costRow, error: costErr } = await supabase
    .from("article_costs")
    .select(
      "id, cost_unit_label, sale_units_per_cost_unit, unit_price, is_active",
    )
    .eq("id", articleCostId)
    .eq("article_id", articleId)
    .eq("pop_id", popId)
    .maybeSingle()
  if (costErr || !costRow) {
    return { error: "Costo de compra inválido para este artículo." }
  }
  if (!Boolean(costRow.is_active ?? true)) {
    return { error: "El costo de compra seleccionado está inactivo." }
  }

  const builtLine = buildPurchaseLineFromInput(input, {
    name: artRow.name,
    iva: artRow.iva,
    itemKind: rawKind,
  }, {
    costUnitLabel: String(costRow.cost_unit_label ?? ""),
    saleUnitsPerCostUnit: Number(costRow.sale_units_per_cost_unit ?? 0) || 0,
  })
  if (!builtLine) {
    return { error: "No se pudo calcular la línea de compra." }
  }

  return { line: builtLine }
}
