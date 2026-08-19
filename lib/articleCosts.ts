import { UNIT_OF_MEASURE_VALUES, type UnitOfMeasureValue } from "@/lib/articleItemKind"

/** Fila persistida en public.article_costs. */
export type ArticleCostRow = {
  id: string
  popId: string
  articleId: string
  supplierId: string | null
  supplierName: string | null
  /** Etiqueta opcional, ej. "Maple 32 huevos". */
  name: string
  /** Unidad de compra libre, ej. "maple de 32". */
  costUnitLabel: string
  /** Unidades de venta del artículo por 1 unidad de costo. */
  saleUnitsPerCostUnit: number
  /** Precio de 1 unidad de costo (catálogo). */
  unitPrice: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type ArticleCostInsertInput = {
  articleId: string
  supplierId?: string | null
  name?: string
  costUnitLabel: string
  saleUnitsPerCostUnit: number
  unitPrice: number
  isActive?: boolean
  sortOrder?: number
}

export type ArticleCostUpdateInput = Partial<
  Omit<ArticleCostInsertInput, "articleId">
>

export const ARTICLE_SALE_UNIT_OF_MEASURE_VALUES = UNIT_OF_MEASURE_VALUES

export type ArticleSaleUnitOfMeasure = UnitOfMeasureValue

function nestedSupplierName(row: Record<string, unknown>): string | null {
  const raw = row.suppliers
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const name = (raw as { name?: unknown }).name
  return typeof name === "string" && name.trim() ? name.trim() : null
}

export function mapArticleCostRow(row: Record<string, unknown>): ArticleCostRow {
  return {
    id: String(row.id),
    popId: String(row.pop_id),
    articleId: String(row.article_id),
    supplierId: row.supplier_id != null ? String(row.supplier_id) : null,
    supplierName: nestedSupplierName(row),
    name: String(row.name ?? ""),
    costUnitLabel: String(row.cost_unit_label ?? ""),
    saleUnitsPerCostUnit: Number(row.sale_units_per_cost_unit ?? 0) || 0,
    unitPrice: Number(row.unit_price ?? 0) || 0,
    isActive: Boolean(row.is_active ?? true),
    sortOrder: Number(row.sort_order ?? 0) || 0,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  }
}

/** Stock en UOM de venta que ingresa al comprar `costQuantity` unidades de costo. */
export function saleQuantityFromCostPurchase(
  costQuantity: number,
  saleUnitsPerCostUnit: number,
): number {
  if (!Number.isFinite(costQuantity) || !Number.isFinite(saleUnitsPerCostUnit)) {
    return 0
  }
  return costQuantity * saleUnitsPerCostUnit
}

/** Costo por 1 unidad de venta derivado de un costo de compra. */
export function unitCostInSaleUom(
  cost: Pick<ArticleCostRow, "unitPrice" | "saleUnitsPerCostUnit">,
): number {
  const factor = cost.saleUnitsPerCostUnit
  if (!Number.isFinite(factor) || factor <= 0) return 0
  return Math.round((cost.unitPrice / factor) * 100) / 100
}

/** Total de la línea al comprar `costQuantity` al precio unitario del costo. */
export function lineTotalFromCostPurchase(
  costQuantity: number,
  unitPrice: number,
): number {
  if (!Number.isFinite(costQuantity) || !Number.isFinite(unitPrice)) return 0
  return Math.round(costQuantity * unitPrice * 100) / 100
}

export type ArticleCostLineInput = {
  name?: string
  costUnitLabel: string
  saleUnitsPerCostUnit: number
  unitPrice: number
  supplierId?: string | null
  isActive?: boolean
}

function normalizeCostLine(raw: ArticleCostLineInput): ArticleCostLineInput | null {
  const costUnitLabel = raw.costUnitLabel.trim()
  const name = (raw.name ?? "").trim()
  const saleUnitsPerCostUnit = Number(raw.saleUnitsPerCostUnit)
  const unitPrice = Number(raw.unitPrice)
  const supplierId = raw.supplierId?.trim() || null

  const isEmpty =
    !costUnitLabel &&
    !name &&
    !Number.isFinite(saleUnitsPerCostUnit) &&
    !Number.isFinite(unitPrice) &&
    !supplierId

  if (isEmpty) return null

  return {
    name,
    costUnitLabel,
    saleUnitsPerCostUnit,
    unitPrice,
    supplierId,
    isActive: raw.isActive !== false,
  }
}

export function validateArticleCostLines(
  lines: ArticleCostLineInput[],
): { ok: true; lines: ArticleCostLineInput[] } | { ok: false; error: string } {
  const normalized = lines
    .map(normalizeCostLine)
    .filter((line): line is ArticleCostLineInput => line != null)

  for (let i = 0; i < normalized.length; i += 1) {
    const line = normalized[i]
    const row = i + 1
    if (!line.costUnitLabel.trim()) {
      return {
        ok: false,
        error: `Costo ${row}: indicá la unidad de compra (ej. maple de 32).`,
      }
    }
    const factor = Number(line.saleUnitsPerCostUnit)
    if (!Number.isFinite(factor) || factor <= 0) {
      return {
        ok: false,
        error: `Costo ${row}: la equivalencia debe ser mayor que cero.`,
      }
    }
    const price = Number(line.unitPrice)
    if (!Number.isFinite(price) || price < 0) {
      return {
        ok: false,
        error: `Costo ${row}: el precio de la unidad de compra no es válido.`,
      }
    }
  }

  return { ok: true, lines: normalized }
}

/** Costo por UOM de venta del primer costo activo con precio > 0 (para stock inicial). */
export function primarySaleUnitCostFromCosts(
  costs: ArticleCostLineInput[],
): number | null {
  for (const cost of costs) {
    if (cost.isActive === false) continue
    if (cost.unitPrice <= 0) continue
    const unit = unitCostInSaleUom(cost)
    if (unit > 0) return unit
  }
  return null
}

export function isArticleSaleUnitOfMeasure(value: string): value is ArticleSaleUnitOfMeasure {
  return (ARTICLE_SALE_UNIT_OF_MEASURE_VALUES as readonly string[]).includes(value)
}
