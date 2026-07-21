export const SALE_SNAPSHOT_VERSION = 2

export type SaleDiscountSource =
  | "none"
  | "catalog"
  | "manual"
  | "quantity_deal"
  | "combo"

export type SaleDisplayGroupType = "product" | "promotion" | "discount"

export type SaleSnapshotTotals = {
  listSubtotal: number
  discountPromotionsAmount: number
  discountItemsCatalogAmount: number
  discountItemsManualAmount: number
  discountGeneralAmount: number
  netSubtotalBeforeGeneral: number
  taxTotal: number
  total: number
}

export type SaleLineDisplay = {
  groupId: string | null
  groupLabel: string | null
  groupType: SaleDisplayGroupType
  sortOrder: number
}

export type SaleLineDiscountEntry = {
  kind: SaleDiscountSource
  promotionId: string | null
  label: string | null
  amount: number
}

type LineForSnapshot = {
  qty: number
  unitPrice: number
  itemDiscount: number
  discountSource: SaleDiscountSource
  promotionDealName: string | null
  name: string
  lineGroupId: string | null
  lineKind: "article" | "recipe" | "promotion"
  itemDiscountMode: "porcentaje" | "fijo" | null
  itemDiscountValue: number | null
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

export function catalogDiscountLabel(
  mode: "porcentaje" | "fijo" | null,
  value: number | null,
): string | null {
  if (mode === "porcentaje" && value != null) {
    return `${Number.isInteger(value) ? value : value.toLocaleString("es-AR", { maximumFractionDigits: 2 })} %`
  }
  if (mode === "fijo" && value != null) {
    return "Descuento fijo"
  }
  return null
}

export function buildLineDisplay(
  line: LineForSnapshot,
  sortOrder: number,
): SaleLineDisplay {
  if (line.lineKind === "promotion") {
    return {
      groupId: `combo:${line.name}`,
      groupLabel: line.name,
      groupType: "promotion",
      sortOrder,
    }
  }
  if (line.discountSource === "quantity_deal" && line.lineGroupId) {
    return {
      groupId: line.lineGroupId,
      groupLabel: line.promotionDealName?.trim() || "Promoción",
      groupType: "promotion",
      sortOrder,
    }
  }
  if (line.discountSource === "catalog") {
    const label = catalogDiscountLabel(line.itemDiscountMode, line.itemDiscountValue)
    return {
      groupId: line.lineGroupId ?? `discount:catalog:${sortOrder}`,
      groupLabel: label ? `Catálogo ${label}` : "Descuento catálogo",
      groupType: "discount",
      sortOrder,
    }
  }
  if (line.discountSource === "manual" && line.itemDiscount > 0) {
    const label = catalogDiscountLabel(line.itemDiscountMode, line.itemDiscountValue)
    return {
      groupId: line.lineGroupId ?? `discount:manual:${sortOrder}`,
      groupLabel: label ?? "Descuento manual",
      groupType: "discount",
      sortOrder,
    }
  }
  return {
    groupId: null,
    groupLabel: null,
    groupType: "product",
    sortOrder,
  }
}

export function buildLineDiscountEntries(line: LineForSnapshot): SaleLineDiscountEntry[] {
  if (line.itemDiscount <= 0) return []
  if (line.discountSource === "combo") {
    return [
      {
        kind: "combo",
        promotionId: null,
        label: line.name,
        amount: line.itemDiscount,
      },
    ]
  }
  if (line.discountSource === "quantity_deal") {
    return [
      {
        kind: "quantity_deal",
        promotionId: null,
        label: line.promotionDealName,
        amount: line.itemDiscount,
      },
    ]
  }
  if (line.discountSource === "catalog") {
    return [
      {
        kind: "catalog",
        promotionId: null,
        label: catalogDiscountLabel(line.itemDiscountMode, line.itemDiscountValue),
        amount: line.itemDiscount,
      },
    ]
  }
  if (line.discountSource === "manual") {
    return [
      {
        kind: "manual",
        promotionId: null,
        label: catalogDiscountLabel(line.itemDiscountMode, line.itemDiscountValue),
        amount: line.itemDiscount,
      },
    ]
  }
  return []
}

export function computeSnapshotTotals(input: {
  lines: LineForSnapshot[]
  generalDiscount: number
  taxTotal: number
  total: number
  netSubtotalBeforeGeneral: number
}): SaleSnapshotTotals {
  let listSubtotal = 0
  let discountPromotionsAmount = 0
  let discountItemsCatalogAmount = 0
  let discountItemsManualAmount = 0

  for (const line of input.lines) {
    listSubtotal += roundMoney(line.qty * line.unitPrice)
    if (line.discountSource === "combo" || line.discountSource === "quantity_deal") {
      discountPromotionsAmount += line.itemDiscount
    } else if (line.discountSource === "catalog") {
      discountItemsCatalogAmount += line.itemDiscount
    } else if (line.discountSource === "manual") {
      discountItemsManualAmount += line.itemDiscount
    }
  }

  return {
    listSubtotal: roundMoney(listSubtotal),
    discountPromotionsAmount: roundMoney(discountPromotionsAmount),
    discountItemsCatalogAmount: roundMoney(discountItemsCatalogAmount),
    discountItemsManualAmount: roundMoney(discountItemsManualAmount),
    discountGeneralAmount: roundMoney(input.generalDiscount),
    netSubtotalBeforeGeneral: roundMoney(input.netSubtotalBeforeGeneral),
    taxTotal: roundMoney(input.taxTotal),
    total: roundMoney(input.total),
  }
}

export type SaleDetailDisplayGroup = {
  key: string
  groupType: SaleDisplayGroupType
  groupLabel: string | null
  listTotal: number
  discountTotal: number
  finalTotal: number
  rows: Array<{
    lineIndex: number
    name: string
    quantity: number
    unitPrice: number
    lineSubtotal: number
    isComponent?: boolean
    components?: Array<{ name: string; quantity: number }>
  }>
}

export type SaleDetailLineLike = {
  nameSnapshot: string
  quantity: number
  unitPrice: number
  lineSubtotal: number | null
  lineTotal: number
  listLineTotal?: number | null
  itemDiscountAmount: number
  discountSource: SaleDiscountSource | null
  lineKind: "article" | "recipe" | "promotion" | null
  display?: SaleLineDisplay | null
  promotionSnapshot?: {
    components?: Array<{ name_snapshot?: string; quantity?: number }>
  } | null
}

export function groupSaleDetailLines(
  lines: SaleDetailLineLike[],
): SaleDetailDisplayGroup[] {
  const groups: SaleDetailDisplayGroup[] = []
  const groupIndex = new Map<string, number>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const listLine =
      line.listLineTotal != null && line.listLineTotal > 0
        ? line.listLineTotal
        : roundMoney(line.quantity * line.unitPrice)
    const lineSub =
      line.lineSubtotal != null && line.lineSubtotal > 0
        ? line.lineSubtotal
        : line.lineTotal

    const display = line.display
    const groupKey =
      display?.groupId ??
      (line.lineKind === "promotion"
        ? `combo:${line.nameSnapshot}:${i}`
        : `line:${i}`)

    let idx = groupIndex.get(groupKey)
    if (idx == null) {
      idx = groups.length
      groupIndex.set(groupKey, idx)
      groups.push({
        key: groupKey,
        groupType: display?.groupType ?? (line.lineKind === "promotion" ? "promotion" : "product"),
        groupLabel: display?.groupLabel ?? null,
        listTotal: 0,
        discountTotal: 0,
        finalTotal: 0,
        rows: [],
      })
    }

    const group = groups[idx]!
    group.listTotal = roundMoney(group.listTotal + listLine)
    group.discountTotal = roundMoney(group.discountTotal + line.itemDiscountAmount)
    group.finalTotal = roundMoney(group.finalTotal + lineSub)

    const components =
      line.lineKind === "promotion" && line.promotionSnapshot?.components?.length
        ? line.promotionSnapshot.components
            .map((c) => ({
              name: c.name_snapshot?.trim() || "—",
              quantity: c.quantity ?? 0,
            }))
            .filter((c) => c.quantity > 0)
        : undefined

    group.rows.push({
      lineIndex: i,
      name: line.nameSnapshot,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineSubtotal: lineSub,
      components,
    })
  }

  groups.sort((a, b) => {
    const aOrder = lines[a.rows[0]?.lineIndex ?? 0]?.display?.sortOrder ?? 0
    const bOrder = lines[b.rows[0]?.lineIndex ?? 0]?.display?.sortOrder ?? 0
    return aOrder - bOrder
  })

  return groups
}

export function parseLineDisplay(raw: unknown): SaleLineDisplay | null {
  if (raw == null || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const groupTypeRaw = o.group_type
  const groupType: SaleDisplayGroupType =
    groupTypeRaw === "product" ||
    groupTypeRaw === "promotion" ||
    groupTypeRaw === "discount"
      ? groupTypeRaw
      : "product"
  return {
    groupId:
      typeof o.group_id === "string" && o.group_id.trim()
        ? o.group_id.trim()
        : null,
    groupLabel:
      typeof o.group_label === "string" && o.group_label.trim()
        ? o.group_label.trim()
        : null,
    groupType,
    sortOrder: Number(o.sort_order ?? 0) || 0,
  }
}

export function snapshotTotalsToMetadata(totals: SaleSnapshotTotals): Record<string, number> {
  return {
    list_subtotal: totals.listSubtotal,
    discount_promotions_amount: totals.discountPromotionsAmount,
    discount_items_catalog_amount: totals.discountItemsCatalogAmount,
    discount_items_manual_amount: totals.discountItemsManualAmount,
    discount_general_amount: totals.discountGeneralAmount,
    net_subtotal_before_general: totals.netSubtotalBeforeGeneral,
    tax_total: totals.taxTotal,
    total: totals.total,
  }
}

export function parseSnapshotTotals(raw: unknown): SaleSnapshotTotals | null {
  if (raw == null || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  return {
    listSubtotal: roundMoney(Number(o.list_subtotal ?? 0) || 0),
    discountPromotionsAmount: roundMoney(Number(o.discount_promotions_amount ?? 0) || 0),
    discountItemsCatalogAmount: roundMoney(
      Number(o.discount_items_catalog_amount ?? 0) || 0,
    ),
    discountItemsManualAmount: roundMoney(
      Number(o.discount_items_manual_amount ?? 0) || 0,
    ),
    discountGeneralAmount: roundMoney(Number(o.discount_general_amount ?? 0) || 0),
    netSubtotalBeforeGeneral: roundMoney(
      Number(o.net_subtotal_before_general ?? 0) || 0,
    ),
    taxTotal: roundMoney(Number(o.tax_total ?? 0) || 0),
    total: roundMoney(Number(o.total ?? 0) || 0),
  }
}
