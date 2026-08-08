import type { OperationSaleLineItem } from "@/app/[siteId]/[popId]/operations/actions"
import { formatArticleDiscountBadge } from "@/lib/articleDiscount"
import type {
  MostradorCartDisplayRow,
  MostradorCartGroupPricing,
} from "@/lib/mostradorCartDisplay"
import { catalogDiscountLabel, resolvePersistedListLineTotal } from "@/lib/saleSnapshot"

function roundMoney(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

function listTotalForLine(line: OperationSaleLineItem): number {
  return resolvePersistedListLineTotal({
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    listLineTotal: line.listLineTotal,
    discountSource: line.discountSource,
    promotionListTotal: line.promotionSnapshot?.listTotal,
  })
}

function finalTotalForLine(line: OperationSaleLineItem): number {
  if (line.lineSubtotal != null && line.lineSubtotal > 0) {
    return line.lineSubtotal
  }
  return line.lineTotal
}

function discountGroupKey(
  line: OperationSaleLineItem,
  lineIndex: number,
): string {
  const fromDisplay = line.display?.groupId?.trim()
  if (fromDisplay && !fromDisplay.startsWith("qtydeal:")) {
    return fromDisplay
  }
  if (line.discountSource === "catalog") {
    return `discount:catalog:${lineIndex}`
  }
  if (line.discountSource === "manual") {
    return `discount:manual:${lineIndex}`
  }
  return `discount:${lineIndex}`
}

function isDiscountGroupLine(line: OperationSaleLineItem): boolean {
  if (line.discountSource === "quantity_deal") return false
  if (line.display?.groupType === "discount") return true
  if (line.discountSource === "catalog" || line.discountSource === "manual") {
    return true
  }
  if (line.itemDiscountAmount > 0.004) return true
  return listTotalForLine(line) > finalTotalForLine(line) + 0.004
}

function discountLabelForLine(line: OperationSaleLineItem): string | undefined {
  const raw = line.display?.groupLabel?.trim()
  if (raw) {
    if (raw.startsWith("Catálogo ")) return raw.slice("Catálogo ".length)
    if (raw !== "Descuento catálogo" && raw !== "Descuento manual") return raw
  }
  const fromCatalog = catalogDiscountLabel(
    line.itemDiscountMode,
    line.itemDiscountValue,
  )
  if (fromCatalog) return fromCatalog
  if (line.itemDiscountMode === "porcentaje" && line.itemDiscountValue != null) {
    return formatArticleDiscountBadge("porcentaje", line.itemDiscountValue)
  }
  if (line.itemDiscountMode === "fijo" && line.itemDiscountValue != null) {
    return formatArticleDiscountBadge("fijo", line.itemDiscountValue)
  }
  if (line.itemDiscountAmount > 0) {
    return formatArticleDiscountBadge("fijo", line.itemDiscountAmount)
  }
  return undefined
}

function baseRowFields(
  lineIndex: number,
  line: OperationSaleLineItem,
): Pick<
  MostradorCartDisplayRow,
  | "productoId"
  | "kind"
  | "producto"
  | "discountEditingDisabled"
  | "commentEditingDisabled"
  | "showGreenBorder"
  | "topCloudVariant"
> {
  return {
    productoId: line.articleId ?? line.recipeId ?? line.promotionId ?? "",
    kind:
      line.lineKind === "recipe"
        ? "recipe"
        : line.lineKind === "promotion"
          ? "promotion"
          : "article",
    producto: null,
    discountEditingDisabled: true,
    commentEditingDisabled: true,
    showGreenBorder: line.display?.groupType === "discount",
    topCloudVariant: "none",
  }
}

function pushComboRows(
  rows: MostradorCartDisplayRow[],
  lineIndex: number,
  line: OperationSaleLineItem,
) {
  const components = line.promotionSnapshot?.components ?? []
  if (components.length === 0) return

  const promoName = line.display?.groupLabel?.trim() || line.nameSnapshot
  const groupKey = line.display?.groupId ?? `combo:${lineIndex}`
  const groupPricing: MostradorCartGroupPricing = {
    listTotal:
      line.promotionSnapshot?.listTotal != null &&
      line.promotionSnapshot.listTotal > 0
        ? line.promotionSnapshot.listTotal
        : listTotalForLine(line),
    finalTotal: finalTotalForLine(line),
  }
  const promoGroupKey = groupKey

  for (let ci = 0; ci < components.length; ci++) {
    const component = components[ci]!
    const articleId = component.article_id ?? null
    const recipeId = component.recipe_id ?? null
    const slotId = component.slot_id ?? String(ci)
    const productoId =
      articleId ?? recipeId ?? `${lineIndex}:slot:${slotId}`
    const kind = recipeId ? "recipe" : "article"
    const cantidad = component.quantity ?? 1

    rows.push({
      productoId,
      kind,
      producto: null,
      discountEditingDisabled: true,
      commentEditingDisabled: true,
      showGreenBorder: true,
      topCloudVariant: "none",
      rowKey: `${lineIndex}:${slotId}:${productoId}`,
      lineId: `${lineIndex}:${slotId}:${productoId}`,
      cartLineId: String(lineIndex),
      variant: "combo_component",
      nombre: component.name_snapshot?.trim() || "—",
      cantidad: cantidad > 0 ? cantidad : 1,
      comboComponentKey: `${slotId}:${productoId}`,
      promoGroupKey,
      promoGroupLabel: promoName,
      promoGroupVariant: "promotion",
      hidePrice: true,
      comment: line.comment ?? undefined,
      quantityDealGroupPricing: groupPricing,
    })
  }
}

function pushQuantityDealGroupRows(
  rows: MostradorCartDisplayRow[],
  groupKey: string,
  groupLines: OperationSaleLineItem[],
  lineIndexByLine: Map<OperationSaleLineItem, number>,
) {
  if (groupLines.length === 0) return

  const first = groupLines[0]!
  const promoName =
    first.display?.groupLabel?.trim() ||
    first.promotionDealName?.trim() ||
    "Promoción"

  let listTotal = 0
  let finalTotal = 0
  const pendingRows: MostradorCartDisplayRow[] = []

  for (const line of groupLines) {
    const lineIndex = lineIndexByLine.get(line) ?? 0
    const lineList = listTotalForLine(line)
    const lineFinal = finalTotalForLine(line)
    listTotal = roundMoney(listTotal + lineList)
    finalTotal = roundMoney(finalTotal + lineFinal)

    pendingRows.push({
      ...baseRowFields(lineIndex, line),
      rowKey: `${groupKey}:${lineIndex}`,
      lineId: `${groupKey}:${lineIndex}`,
      cartLineId: String(lineIndex),
      variant: "product",
      nombre: line.nameSnapshot,
      cantidad: line.quantity,
      promoGroupKey: groupKey,
      promoGroupLabel: promoName,
      promoGroupVariant: "promotion",
      hidePrice: true,
      comment: line.comment ?? undefined,
      quantityDealListTotal: lineList,
      quantityDealDiscountTotal: roundMoney(lineList - lineFinal),
    })
  }

  const groupPricing: MostradorCartGroupPricing = {
    listTotal,
    finalTotal,
  }

  for (const row of pendingRows) {
    rows.push({ ...row, quantityDealGroupPricing: groupPricing })
  }
}

function pushRegularRow(
  rows: MostradorCartDisplayRow[],
  lineIndex: number,
  line: OperationSaleLineItem,
) {
  const listTotal = listTotalForLine(line)
  const finalTotal = finalTotalForLine(line)
  const isDiscountGroup = isDiscountGroupLine(line)
  const label = isDiscountGroup
    ? discountLabelForLine(line) ?? "Descuento"
    : undefined
  const groupKey = isDiscountGroup ? discountGroupKey(line, lineIndex) : undefined

  rows.push({
    ...baseRowFields(lineIndex, line),
    showGreenBorder: isDiscountGroup,
    rowKey: `line:${lineIndex}`,
    lineId: `line:${lineIndex}`,
    cartLineId: String(lineIndex),
    variant: "product",
    nombre: line.nameSnapshot,
    cantidad: line.quantity,
    promoGroupKey: groupKey,
    promoGroupLabel: label,
    promoGroupVariant: isDiscountGroup ? "discount" : undefined,
    promoGroupDiscountMode: line.itemDiscountMode ?? undefined,
    comment: line.comment ?? undefined,
    readOnlyPricing: { listTotal, finalTotal },
  })
}

export function buildSaleDetailCartDisplayRows(
  lineItems: OperationSaleLineItem[],
): MostradorCartDisplayRow[] {
  const rows: MostradorCartDisplayRow[] = []
  const lineIndexByLine = new Map(
    lineItems.map((line, index) => [line, index] as const),
  )
  const processedQtyGroups = new Set<string>()

  for (let lineIndex = 0; lineIndex < lineItems.length; lineIndex++) {
    const line = lineItems[lineIndex]!

    if (
      line.lineKind === "promotion" &&
      (line.promotionSnapshot?.components?.length ?? 0) > 0
    ) {
      pushComboRows(rows, lineIndex, line)
      continue
    }

    if (line.discountSource === "quantity_deal") {
      const groupKey =
        line.display?.groupId ?? line.lineGroupId ?? `qtydeal:${lineIndex}`
      if (processedQtyGroups.has(groupKey)) continue
      processedQtyGroups.add(groupKey)

      const groupLines = lineItems.filter((candidate) => {
        if (candidate.discountSource !== "quantity_deal") return false
        const candidateKey =
          candidate.display?.groupId ??
          candidate.lineGroupId ??
          `qtydeal:${lineIndexByLine.get(candidate) ?? 0}`
        return candidateKey === groupKey
      })

      pushQuantityDealGroupRows(rows, groupKey, groupLines, lineIndexByLine)
      continue
    }

    pushRegularRow(rows, lineIndex, line)
  }

  return rows
}
