"use server"

import {
  CHART_COSTO_VENTAS_CODES,
  CHART_CUENTAS_POR_COBRAR_CODES,
  CHART_IVA_PAGAR_CODES,
  CHART_MERCADERIAS_CODES,
} from "@/lib/argV3DefaultChartAccounts"
import { parseCashRegisterSaleChannel } from "@/lib/cashRegisterSaleContextLabels"
import { chartVentasCodesForSaleChannel } from "@/lib/saleRevenueChartAccounts"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopById, validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import {
  entryDateIsoInTimezone,
  timezoneForPopLedger,
} from "@/lib/entryDateTimezone"
import { resolveOpenCashSession, assertCashSessionStillOpen } from "@/lib/cashRegisterSession"
import { createClient } from "@/utils/supabase/server"
import {
  articleReferenceCostError,
  resolveArticleReferenceUnitCost,
} from "@/lib/articleReferenceUnitCost"
import { resolveLedgerAccountForTreasuryPayment } from "@/lib/treasuryPaymentLedger"
import { isValidOperationPaymentKind } from "@/lib/operationPaymentKinds"
import {
  deleteCheckoutCheck,
  insertCheckoutCheck,
  parseCheckoutCheckDetails,
  resolveCheckTreasuryAccountId,
  type CheckoutCheckDetails,
} from "@/lib/checkoutCheck"
import { SALE_COMPROBANTE_RECIBO_X_LABEL, saleComprobanteAccruesOutputVat } from "@/lib/saleComprobantePicker"
import { siteIdFromPopRow } from "@/lib/popRoutes"
import { CLIENT_IVA_CONDITION_VALUES } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { consumptionQuantity, effectiveWastePct } from "@/lib/recipeCost"
import { priceComboPromotion, type PromotionCartSelection } from "@/lib/promotionPricing"
import {
  hasSaleLineManualDiscount,
  resolveSaleLineDiscount,
} from "@/lib/saleLineDiscount"
import { summarizeQuantityDealsFromLines } from "@/lib/saleCompleteLines"
import {
  SALE_SNAPSHOT_VERSION,
  buildLineDisplay,
  computeSnapshotTotals,
  snapshotTotalsToMetadata,
} from "@/lib/saleSnapshot"

function parseQty(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 1e6) / 1e6
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function normalizeCustomerIvaCondition(
  raw: string | null | undefined,
): string | null {
  const t = raw?.trim()
  if (!t) return null
  return (CLIENT_IVA_CONDITION_VALUES as readonly string[]).includes(t)
    ? t
    : null
}

function siteIdsMatchClientRoute(
  routeSiteId: string,
  popSiteId: string,
): boolean {
  return routeSiteId.trim().toLowerCase() === popSiteId.trim().toLowerCase()
}

type FifoAllocationPlan = {
  layerId: string
  qty: number
  unitCost: number
  remainingBefore: number
}

async function sumInventoryOnHandForArticle(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  articleId: string,
): Promise<{ success: true; onHand: number } | { success: false; error: string }> {
  const { data: rows, error } = await supabase
    .from("inventory_movements")
    .select("quantity_delta")
    .eq("pop_id", popId)
    .eq("article_id", articleId)
  if (error) {
    return { success: false, error: error.message || "No se pudo leer el stock." }
  }
  let t = 0
  for (const r of rows || []) {
    t += parseQty(r.quantity_delta)
  }
  return { success: true, onHand: Math.round(t * 1e6) / 1e6 }
}

async function resolveAccountId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  codes: readonly string[],
): Promise<string | null> {
  for (const code of codes) {
    const { data: row } = await supabase
      .from("accounting_chart_of_accounts")
      .select("id")
      .eq("pop_id", popId)
      .eq("code", code)
      .maybeSingle()
    if (row?.id) return String(row.id)
  }
  return null
}

async function undoFifoSaleMovement(
  supabase: Awaited<ReturnType<typeof createClient>>,
  movementId: string,
  fifoAllocations: FifoAllocationPlan[],
) {
  await supabase
    .from("inventory_layer_allocations")
    .delete()
    .eq("inventory_movement_id", movementId)
  if (fifoAllocations.length > 0) {
    for (const a of fifoAllocations) {
      await supabase
        .from("inventory_cost_layers")
        .update({ quantity_remaining: a.remainingBefore })
        .eq("id", a.layerId)
    }
  }
  await supabase.from("inventory_movements").delete().eq("id", movementId)
}

async function cancelSaleRollback(
  supabase: Awaited<ReturnType<typeof createClient>>,
  saleId: string,
  tracked: { id: string; fifo: FifoAllocationPlan[] }[],
) {
  for (const tm of tracked) {
    await undoFifoSaleMovement(supabase, tm.id, tm.fifo)
  }
  await supabase
    .from("sales")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", saleId)
}

async function cancelAccountingEntry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entryId: string,
) {
  await supabase
    .from("accounting_entries")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", entryId)
}

type StockDeductionNeed = {
  articleId: string
  qty: number
  label: string
}

async function collectStockDeductionNeeds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  built: Array<{
    lineKind: "article" | "recipe" | "promotion"
    articleId: string | null
    recipeId: string | null
    name: string
    qty: number
    promotionComponents?: Array<{
      kind: "article" | "recipe"
      articleId: string | null
      recipeId: string | null
      quantity: number
      name: string
    }>
  }>,
): Promise<
  | { success: true; needs: StockDeductionNeed[] }
  | { success: false; error: string }
> {
  const byArticle = new Map<string, { qty: number; labels: Set<string> }>()

  const addNeed = (articleId: string, qty: number, label: string) => {
    if (qty <= 0) return
    const prev = byArticle.get(articleId) ?? { qty: 0, labels: new Set<string>() }
    prev.qty += qty
    prev.labels.add(label)
    byArticle.set(articleId, prev)
  }

  for (const line of built) {
    if (line.lineKind === "promotion" && line.promotionComponents?.length) {
      for (const comp of line.promotionComponents) {
        const compQty = parseQty(comp.quantity)
        if (comp.kind === "article" && comp.articleId) {
          addNeed(comp.articleId, compQty, `${line.name} — ${comp.name}`)
        } else if (comp.kind === "recipe" && comp.recipeId) {
          const { data: ingRows, error: ingErr } = await supabase
            .from("recipe_ingredients")
            .select(
              `
              quantity,
              waste_pct,
              articles (
                id,
                name,
                default_waste_pct
              )
            `,
            )
            .eq("recipe_id", comp.recipeId)
            .eq("pop_id", popId)
            .order("sort_order", { ascending: true })
          if (ingErr) {
            return {
              success: false,
              error:
                ingErr.message ||
                "No se pudieron leer los ingredientes de la receta.",
            }
          }
          for (const row of ingRows ?? []) {
            const art = row.articles as {
              id?: string
              name?: string
              default_waste_pct?: number | null
            } | null
            if (!art?.id) continue
            const consumo = consumptionQuantity(
              Number(row.quantity ?? 0),
              row.waste_pct != null ? Number(row.waste_pct) : null,
              art.default_waste_pct != null ? Number(art.default_waste_pct) : null,
              compQty,
            )
            addNeed(
              String(art.id),
              consumo,
              `${line.name} — ${comp.name} — ${String(art.name ?? "Ingrediente")}`,
            )
          }
        }
      }
      continue
    }
    if (line.lineKind === "article" && line.articleId) {
      addNeed(line.articleId, line.qty, line.name)
      continue
    }
    if (line.lineKind !== "recipe" || !line.recipeId) continue

    const { data: ingRows, error: ingErr } = await supabase
      .from("recipe_ingredients")
      .select(
        `
        quantity,
        waste_pct,
        articles (
          id,
          name,
          default_waste_pct
        )
      `,
      )
      .eq("recipe_id", line.recipeId)
      .eq("pop_id", popId)
      .order("sort_order", { ascending: true })

    if (ingErr) {
      return {
        success: false,
        error: ingErr.message || "No se pudieron leer los ingredientes de la receta.",
      }
    }

    for (const row of ingRows ?? []) {
      const art = row.articles as {
        id?: string
        name?: string
        default_waste_pct?: number | null
      } | null
      if (!art?.id) continue
      const consumo = consumptionQuantity(
        Number(row.quantity ?? 0),
        row.waste_pct != null ? Number(row.waste_pct) : null,
        art.default_waste_pct != null ? Number(art.default_waste_pct) : null,
        line.qty,
      )
      const ingLabel = String(art.name ?? "Ingrediente")
      addNeed(String(art.id), consumo, `${line.name} — ${ingLabel}`)
    }
  }

  const needs: StockDeductionNeed[] = []
  for (const [articleId, entry] of byArticle.entries()) {
    needs.push({
      articleId,
      qty: parseQty(entry.qty),
      label: [...entry.labels].join(", "),
    })
  }
  return { success: true, needs }
}

async function deductArticleStockForSale(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  saleId: string,
  userId: string,
  need: StockDeductionNeed,
): Promise<
  | { success: true; amount: number; movement: { id: string; fifo: FifoAllocationPlan[] } }
  | { success: false; error: string }
> {
  const qtyAbs = need.qty
  const delta = -qtyAbs
  const { data: artRow } = await supabase
    .from("articles")
    .select("id, name")
    .eq("id", need.articleId)
    .eq("pop_id", popId)
    .maybeSingle()
  const articleName = String(artRow?.name ?? need.label ?? "")
  const articleCostRef = roundMoney(
    await resolveArticleReferenceUnitCost(supabase, popId, need.articleId),
  )

  const { data: layerRows, error: lrErr } = await supabase
    .from("inventory_cost_layers")
    .select("id, quantity_remaining, unit_cost, received_at")
    .eq("pop_id", popId)
    .eq("article_id", need.articleId)
    .gt("quantity_remaining", 0)
    .order("received_at", { ascending: true })
  if (lrErr) {
    return { success: false, error: lrErr.message || "No se pudieron leer capas de costo." }
  }
  const layers = layerRows || []
  let amount = 0
  let fifoAllocations: FifoAllocationPlan[] = []

  if (layers.length === 0) {
    const u = articleCostRef > 0 ? articleCostRef : null
    if (u == null || u <= 0) {
      return {
        success: false,
        error: articleReferenceCostError(articleName),
      }
    }
    amount = roundMoney(qtyAbs * u)
  } else {
    let needQty = qtyAbs
    let totalCost = 0
    const plans: FifoAllocationPlan[] = []
    for (const row of layers) {
      if (needQty <= 0) break
      const rem = parseQty(row.quantity_remaining)
      if (rem <= 0) continue
      const take = Math.min(needQty, rem)
      const uc = parseQty(row.unit_cost)
      totalCost += roundMoney(take * uc)
      plans.push({
        layerId: String(row.id),
        qty: take,
        unitCost: uc,
        remainingBefore: rem,
      })
      needQty = parseQty(needQty - take)
    }
    if (needQty > 0) {
      const u = articleCostRef > 0 ? articleCostRef : null
      if (u == null || u <= 0) {
        return {
          success: false,
          error: articleReferenceCostError(articleName),
        }
      }
      totalCost += roundMoney(needQty * u)
    }
    amount = roundMoney(totalCost)
    fifoAllocations = plans
  }

  if (amount <= 0) {
    return {
      success: false,
      error: `No se pudo valorar el costo de «${articleName}».`,
    }
  }

  const note = `Venta — ${articleName}`
  const { data: movIns, error: movErr } = await supabase
    .from("inventory_movements")
    .insert({
      pop_id: popId,
      article_id: need.articleId,
      quantity_delta: delta,
      movement_type: "sale",
      sale_id: saleId,
      note,
      created_by: userId,
    })
    .select("id")
    .single()
  if (movErr || !movIns?.id) {
    return { success: false, error: movErr?.message || "No se pudo registrar el movimiento de stock." }
  }
  const movementId = String(movIns.id)

  if (fifoAllocations.length > 0) {
    for (const a of fifoAllocations) {
      const { error: allocInsErr } = await supabase
        .from("inventory_layer_allocations")
        .insert({
          pop_id: popId,
          layer_id: a.layerId,
          article_id: need.articleId,
          inventory_movement_id: movementId,
          quantity: a.qty,
          unit_cost: a.unitCost,
        })
      if (allocInsErr) {
        return {
          success: false,
          error: allocInsErr.message || "No se pudo registrar la imputación FIFO.",
        }
      }
    }
    for (const a of fifoAllocations) {
      const newRem = parseQty(a.remainingBefore - a.qty)
      const { error: layUpdErr } = await supabase
        .from("inventory_cost_layers")
        .update({ quantity_remaining: newRem })
        .eq("id", a.layerId)
      if (layUpdErr) {
        return {
          success: false,
          error: layUpdErr.message || "No se pudo actualizar la capa de costo.",
        }
      }
    }
  }

  return {
    success: true,
    amount,
    movement: { id: movementId, fifo: fifoAllocations },
  }
}

export type CompleteSaleLineInput = {
  articleId?: string
  recipeId?: string
  promotionId?: string
  promotionSelections?: Array<{
    slotId: string
    kind: "article" | "recipe"
    refId: string
  }>
  promotionDealDiscount?: number
  promotionDealId?: string
  promotionDealName?: string
  /** Agrupa líneas del mismo quantity deal en detalle / metadata. */
  lineGroupId?: string
  quantity: number
  itemDiscountMode: "porcentaje" | "fijo"
  itemDiscountDraft: string
  /** Si true, no aplica el descuento de catálogo del artículo en esta venta. */
  suppressCatalogDiscount?: boolean
  comment?: string
}

export type CompleteSaleInput = {
  siteId: string
  lines: CompleteSaleLineInput[]
  clientId: string | null
  paymentKind?: string | null
  treasuryAccountId?: string | null
  checkDetails?: CheckoutCheckDetails | null
  payOnClientAccount?: boolean
  generalDiscountMode: "porcentaje" | "fijo"
  valorDescuentoPorcentaje: number
  valorDescuentoFijo: number
  invoiceTypeLabel?: string | null
  /** Condición IVA del receptor en esta venta (override o snapshot). */
  customerIvaCondition?: string | null
  /** Datos fiscales manuales o padrón (nombre / CUIT-DNI) cuando aplica override. */
  fiscalCustomer?: { name: string; taxId: string | null } | null
  /** Venta asociada a una sesión de mesa (canal table). */
  tableSessionId?: string | null
  /** Venta asociada a un pedido de mostrador (canal counter). */
  counterOrderId?: string | null
  /** Si true, cierra la sesión de mesa al completar (default true). */
  closeTableSession?: boolean
  /** Si true, vincula la venta al pedido de mostrador (default true). */
  linkCounterOrder?: boolean
  /** Total del pedido/mesa al momento del cobro (incluye pendiente). */
  channelOrderTotal?: number
  /** Total acumulado cobrado en el pedido/mesa tras este cobro. */
  channelPaidAccumulated?: number
  /** Cobro parcial de mesa/mostrador (no cierra sesión/pedido). */
  isPartialChannelPayment?: boolean
}

export async function completeSale(
  popId: string,
  input: CompleteSaleInput,
): Promise<{ success: true; saleId: string } | { success: false; error: string }> {
  const trackedMovements: {
    id: string
    fifo: FifoAllocationPlan[]
  }[] = []
  let saleIdForRollback: string | null = null
  let revenueEntryId: string | null = null

  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.SALE_CREATE.resource,
        POP_PERMS.SALE_CREATE.action,
      ) ||
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.SALE_UPDATE.resource,
        POP_PERMS.SALE_UPDATE.action,
      )
    ) {
      return {
        success: false,
        error:
          "Sin permiso para completar ventas (se requieren sale:create y sale:update: stock, cobro y asiento se registran en el mismo flujo).",
      }
    }

    const popRes = await getPopById(popId)
    if (!popRes.success || !popRes.pop) {
      return { success: false, error: popRes.error || "No se pudo validar el punto de venta." }
    }
    if (!siteIdsMatchClientRoute(input.siteId, popRes.pop.siteId)) {
      return {
        success: false,
        error: "El sitio de la URL no coincide con el punto de venta.",
      }
    }

    const linesIn = input.lines || []
    if (linesIn.length < 1) {
      return { success: false, error: "Agregá al menos un producto al pedido." }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.id) {
      return { success: false, error: "Sesión requerida." }
    }

    const cashRes = await resolveOpenCashSession(supabase, popId, user.id)
    if (!cashRes.success) {
      return { success: false, error: cashRes.error }
    }
    const {
      sessionId: cashRegisterSessionId,
      cashRegisterId,
      cashTreasuryAccountId,
    } = cashRes.ctx

    const sessionStillOpen = await assertCashSessionStillOpen(
      supabase,
      popId,
      cashRegisterSessionId,
    )
    if (!sessionStillOpen.success) {
      return { success: false, error: sessionStillOpen.error }
    }

    const payOnClientAccount = Boolean(input.payOnClientAccount)
    const tableSessionId = input.tableSessionId?.trim() || null
    if (tableSessionId && !/^[0-9a-f-]{36}$/i.test(tableSessionId)) {
      return { success: false, error: "Sesión de mesa inválida." }
    }
    const counterOrderId = input.counterOrderId?.trim() || null
    if (counterOrderId && !/^[0-9a-f-]{36}$/i.test(counterOrderId)) {
      return { success: false, error: "Pedido de mostrador inválido." }
    }
    if (tableSessionId && counterOrderId) {
      return {
        success: false,
        error: "No se puede vincular una venta a mesa y mostrador a la vez.",
      }
    }
    const paymentKind = input.paymentKind?.trim() || null
    let treasuryAccountId = input.treasuryAccountId?.trim() || null
    let checkoutCheckDetails: CheckoutCheckDetails | null = null

    if (!payOnClientAccount && paymentKind === "cash") {
      treasuryAccountId = cashTreasuryAccountId
    }

    if (!payOnClientAccount && paymentKind === "check") {
      const parsed = parseCheckoutCheckDetails(input.checkDetails)
      if (!parsed.ok) {
        return { success: false, error: parsed.error }
      }
      checkoutCheckDetails = parsed.details
      const checkTreasuryId = await resolveCheckTreasuryAccountId(
        supabase,
        popId,
        "received",
      )
      if (!checkTreasuryId) {
        return {
          success: false,
          error: "Faltan las cuentas de cheques. Recargá la página o contactá a soporte.",
        }
      }
      treasuryAccountId = checkTreasuryId
    }

    if (!payOnClientAccount && (!paymentKind || !treasuryAccountId)) {
      return {
        success: false,
        error: "Elegí un medio de pago o registrá la venta a cuenta corriente del cliente.",
      }
    }

    if (
      !payOnClientAccount &&
      paymentKind &&
      !isValidOperationPaymentKind(paymentKind)
    ) {
      return { success: false, error: "Tipo de pago inválido." }
    }

    if (payOnClientAccount && !input.clientId?.trim()) {
      return {
        success: false,
        error: "Para vender a cuenta corriente tenés que elegir un cliente.",
      }
    }

    let paymentAccountId: string | null = null
    if (!payOnClientAccount && paymentKind && treasuryAccountId) {
      paymentAccountId = await resolveLedgerAccountForTreasuryPayment(
        supabase,
        popId,
        paymentKind,
        treasuryAccountId,
      )
      if (!paymentAccountId) {
        return {
          success: false,
          error:
            "Configurá una cuenta contable en tesorería o el plan de cuentas (caja/bancos) para registrar el cobro.",
        }
      }
    }

    let clientName: string | null = null
    let clientTaxId: string | null = null
    let clientIvaFromDb: string | null = null
    if (input.clientId?.trim()) {
      const cid = input.clientId.trim()
      const { data: cl, error: clErr } = await supabase
        .from("clients")
        .select("id, name, tax_id, iva_condition")
        .eq("id", cid)
        .eq("pop_id", popId)
        .maybeSingle()
      if (clErr || !cl?.id) {
        return { success: false, error: "Cliente no encontrado en este punto." }
      }
      clientName = String(cl.name ?? "")
      clientTaxId = cl.tax_id ? String(cl.tax_id) : null
      clientIvaFromDb = normalizeCustomerIvaCondition(
        cl.iva_condition != null ? String(cl.iva_condition) : null,
      )
    }
    const fc = input.fiscalCustomer
    if (input.clientId?.trim()) {
      if (fc) {
        if (fc.taxId?.trim()) clientTaxId = fc.taxId.trim()
        if (fc.name?.trim()) clientName = fc.name.trim()
      }
    } else if (fc?.name?.trim() || fc?.taxId?.trim()) {
      clientName = fc.name?.trim() || null
      clientTaxId = fc.taxId?.trim() || null
    }

    type BuiltLine = {
      lineKind: "article" | "recipe" | "promotion"
      articleId: string | null
      recipeId: string | null
      promotionId: string | null
      name: string
      qty: number
      unitPrice: number
      ivaPct: number
      itemDiscountMode: "porcentaje" | "fijo" | null
      itemDiscountValue: number | null
      itemDiscount: number
      lineBase: number
      comment: string | null
      discountSource: "none" | "catalog" | "manual" | "quantity_deal" | "combo"
      promotionDealId: string | null
      promotionDealName: string | null
      lineGroupId: string | null
      promotionSnapshot?: Record<string, unknown>
      promotionComponents?: Array<{
        kind: "article" | "recipe"
        articleId: string | null
        recipeId: string | null
        quantity: number
        name: string
      }>
    }

    const built: BuiltLine[] = []
    for (const raw of linesIn) {
      const qty = parseQty(raw.quantity)
      if (qty <= 0 || qty > 100000) {
        return { success: false, error: "Hay cantidades inválidas en el pedido." }
      }

      const articleId = raw.articleId?.trim() || ""
      const recipeId = raw.recipeId?.trim() || ""
      const promotionId = raw.promotionId?.trim() || ""
      const selectionCount = raw.promotionSelections?.length ?? 0
      const kindCount =
        (articleId ? 1 : 0) + (recipeId ? 1 : 0) + (promotionId ? 1 : 0)
      if (kindCount !== 1) {
        return { success: false, error: "Hay líneas de pedido inválidas." }
      }
      if (promotionId && selectionCount === 0) {
        return { success: false, error: "Hay promociones sin selección de ítems." }
      }

      let name = ""
      let unitPrice = 0
      let ivaPct = 0
      let lineKind: BuiltLine["lineKind"] = "article"
      let resolvedArticleId: string | null = null
      let resolvedRecipeId: string | null = null
      let resolvedPromotionId: string | null = null
      let promotionSnapshot: Record<string, unknown> | undefined
      let promotionComponents: BuiltLine["promotionComponents"]

      let itemDiscount = 0
      let itemDiscountMode: "porcentaje" | "fijo" | null = null
      let itemDiscountValue: number | null = null
      let lineBase = 0
      let discountSource: BuiltLine["discountSource"] = "none"
      let promotionDealId: string | null = raw.promotionDealId?.trim() || null
      let promotionDealName: string | null = raw.promotionDealName?.trim() || null
      const lineGroupId = raw.lineGroupId?.trim() || null

      const dealDiscount = Math.max(0, Number(raw.promotionDealDiscount ?? 0) || 0)
      const suppressForQuantityDeal = dealDiscount > 0
      const manualDiscountInput = hasSaleLineManualDiscount({
        mode: raw.itemDiscountMode ?? "porcentaje",
        draft: raw.itemDiscountDraft ?? "",
      })
        ? {
            mode: raw.itemDiscountMode ?? "porcentaje",
            draft: raw.itemDiscountDraft ?? "",
          }
        : null

      if (promotionId) {
        const { data: promo, error: promoErr } = await supabase
          .from("promotions")
          .select(
            "id, name, promotion_type, pricing_mode, fixed_price, discount_mode, discount_value, is_active",
          )
          .eq("id", promotionId)
          .eq("pop_id", popId)
          .eq("is_active", true)
          .maybeSingle()
        if (promoErr || !promo?.id) {
          return {
            success: false,
            error: "Una de las promociones ya no está disponible.",
          }
        }
        if (String(promo.promotion_type) !== "combo") {
          return { success: false, error: "Promoción de combo inválida." }
        }

        const { data: slotRows } = await supabase
          .from("promotion_slots")
          .select("id, label, quantity")
          .eq("promotion_id", promotionId)
          .eq("pop_id", popId)
          .order("sort_order", { ascending: true })

        const slotIds = (slotRows ?? []).map((s) => String(s.id))
        const { data: optRows } =
          slotIds.length > 0
            ? await supabase
                .from("promotion_slot_options")
                .select("promotion_slot_id, article_id, recipe_id")
                .eq("pop_id", popId)
                .in("promotion_slot_id", slotIds)
            : { data: [] as Record<string, unknown>[] }

        const allowed = new Map<string, Set<string>>()
        for (const slot of slotRows ?? []) {
          allowed.set(String(slot.id), new Set())
        }
        for (const opt of optRows ?? []) {
          const slotId = String(opt.promotion_slot_id)
          const set = allowed.get(slotId)
          if (!set) continue
          if (opt.article_id) set.add(`article:${String(opt.article_id)}`)
          if (opt.recipe_id) set.add(`recipe:${String(opt.recipe_id)}`)
        }

        const selections: PromotionCartSelection[] = []
        for (const sel of raw.promotionSelections ?? []) {
          const slotId = sel.slotId?.trim()
          const refId = sel.refId?.trim()
          if (!slotId || !refId || (sel.kind !== "article" && sel.kind !== "recipe")) {
            return { success: false, error: "Selección de promoción inválida." }
          }
          const slot = (slotRows ?? []).find((s) => String(s.id) === slotId)
          if (!slot) {
            return { success: false, error: "Ítem de promoción inválido." }
          }
          const pool = allowed.get(slotId)
          if (!pool?.has(`${sel.kind}:${refId}`)) {
            return {
              success: false,
              error: "Una opción de la promoción ya no está disponible.",
            }
          }

          let selName = ""
          let listUnitPrice = 0
          let iva = 0
          if (sel.kind === "article") {
            const { data: art } = await supabase
              .from("articles")
              .select("id, name, sale_price, iva, discount_mode, discount_value")
              .eq("id", refId)
              .eq("pop_id", popId)
              .eq("is_active", true)
              .maybeSingle()
            if (!art?.id) {
              return {
                success: false,
                error: "Un producto de la promoción ya no está disponible.",
              }
            }
            selName = String(art.name ?? "")
            listUnitPrice = roundMoney(Number(art.sale_price ?? 0))
            iva = Number(art.iva ?? 0) || 0
          } else {
            const { data: recipe } = await supabase
              .from("recipes")
              .select("id, name, sale_price, iva")
              .eq("id", refId)
              .eq("pop_id", popId)
              .eq("is_active", true)
              .maybeSingle()
            if (!recipe?.id) {
              return {
                success: false,
                error: "Una receta de la promoción ya no está disponible.",
              }
            }
            selName = String(recipe.name ?? "")
            listUnitPrice = roundMoney(Number(recipe.sale_price ?? 0))
            iva = Number(recipe.iva ?? 0) || 0
          }

          selections.push({
            slotId,
            slotLabel: String(slot.label ?? ""),
            kind: sel.kind,
            refId,
            name: selName,
            listUnitPrice,
            slotQuantity: Number(slot.quantity ?? 1) || 1,
            iva,
          })
        }

        if (selections.length !== (slotRows ?? []).length) {
          return {
            success: false,
            error: "Faltan ítems por elegir en una promoción.",
          }
        }

        const priced = priceComboPromotion(
          {
            pricingMode:
              String(promo.pricing_mode) === "percent_off"
                ? "percent_off"
                : String(promo.pricing_mode) === "fixed_off"
                  ? "fixed_off"
                  : "fixed_total",
            fixedPrice:
              promo.fixed_price != null ? Number(promo.fixed_price) : null,
            discountMode:
              promo.discount_mode === "porcentaje" || promo.discount_mode === "fijo"
                ? promo.discount_mode
                : null,
            discountValue:
              promo.discount_value != null ? Number(promo.discount_value) : null,
          },
          selections,
          qty,
        )

        lineKind = "promotion"
        resolvedPromotionId = String(promo.id)
        name = String(promo.name ?? "")
        unitPrice = qty > 0 ? roundMoney(priced.promoTotal / qty) : 0
        ivaPct = priced.weightedIvaPct
        itemDiscount = priced.promoDiscount
        lineBase = priced.promoTotal
        discountSource = "combo"

        promotionComponents = priced.components.map((c) => ({
          kind: c.kind,
          articleId: c.kind === "article" ? c.refId : null,
          recipeId: c.kind === "recipe" ? c.refId : null,
          quantity: roundMoney(c.slotQuantity * qty),
          name: c.name,
        }))

        promotionSnapshot = {
          promotion_id: resolvedPromotionId,
          pricing_mode: String(promo.pricing_mode),
          list_total: priced.listTotal,
          promo_discount: priced.promoDiscount,
          components: priced.components.map((c) => ({
            slot_id: c.slotId,
            slot_label: c.slotLabel,
            article_id: c.kind === "article" ? c.refId : null,
            recipe_id: c.kind === "recipe" ? c.refId : null,
            name_snapshot: c.name,
            list_unit_price: c.listUnitPrice,
            allocated_unit_price: c.allocatedUnitPrice,
            quantity: roundMoney(c.slotQuantity * qty),
            iva: c.iva,
            promo_discount: c.promoDiscount,
          })),
        }
      } else if (recipeId) {
        const { data: recipe, error: rErr } = await supabase
          .from("recipes")
          .select("id, name, sale_price, iva")
          .eq("id", recipeId)
          .eq("pop_id", popId)
          .eq("is_active", true)
          .maybeSingle()
        if (rErr || !recipe?.id) {
          return { success: false, error: "Una de las recetas ya no está disponible." }
        }
        lineKind = "recipe"
        resolvedRecipeId = String(recipe.id)
        name = String(recipe.name ?? "")
        unitPrice = roundMoney(Number(recipe.sale_price ?? 0))
        ivaPct = Math.max(0, Number(recipe.iva ?? 0) || 0)

        const lineDiscount = resolveSaleLineDiscount({
          listUnitPrice: unitPrice,
          quantity: qty,
          manualDiscount:
            suppressForQuantityDeal ? null : manualDiscountInput,
        })
        itemDiscount = lineDiscount.itemDiscountAmount
        itemDiscountMode = lineDiscount.itemDiscountMode
        itemDiscountValue = lineDiscount.itemDiscountValue
        lineBase = lineDiscount.lineSubtotal
        discountSource = lineDiscount.discountSource
      } else {
        const { data: art, error: aErr } = await supabase
          .from("articles")
          .select("id, name, sale_price, iva, discount_mode, discount_value")
          .eq("id", articleId)
          .eq("pop_id", popId)
          .eq("is_active", true)
          .maybeSingle()
        if (aErr || !art?.id) {
          return { success: false, error: "Uno de los artículos ya no está disponible." }
        }
        lineKind = "article"
        resolvedArticleId = String(art.id)
        name = String(art.name ?? "")
        unitPrice = roundMoney(Number(art.sale_price ?? 0))
        ivaPct = Math.max(0, Number(art.iva ?? 0) || 0)

        const rawDiscountMode = art.discount_mode
        const catalogDiscountMode =
          typeof rawDiscountMode === "string" &&
          (rawDiscountMode === "porcentaje" || rawDiscountMode === "fijo")
            ? rawDiscountMode
            : null
        const catalogDiscountRaw = art.discount_value
        const catalogDiscountValue =
          catalogDiscountRaw != null &&
          Number.isFinite(Number(catalogDiscountRaw))
            ? Number(catalogDiscountRaw)
            : null

        const lineDiscount = resolveSaleLineDiscount({
          listUnitPrice: unitPrice,
          quantity: qty,
          catalogDiscountMode,
          catalogDiscountValue,
          manualDiscount:
            suppressForQuantityDeal ? null : manualDiscountInput,
          suppressCatalogDiscount:
            raw.suppressCatalogDiscount === true || suppressForQuantityDeal,
        })
        itemDiscount = lineDiscount.itemDiscountAmount
        itemDiscountMode = lineDiscount.itemDiscountMode
        itemDiscountValue = lineDiscount.itemDiscountValue
        lineBase = lineDiscount.lineSubtotal
        discountSource = lineDiscount.discountSource
      }

      if (dealDiscount > 0) {
        itemDiscount = roundMoney(dealDiscount)
        lineBase = roundMoney(Math.max(0, lineBase - dealDiscount))
        itemDiscountMode = null
        itemDiscountValue = null
        discountSource = "quantity_deal"
      }

      if (lineBase < 0) {
        return { success: false, error: "Los importes de línea no son válidos." }
      }
      const com = raw.comment?.trim()
      built.push({
        lineKind,
        articleId: resolvedArticleId,
        recipeId: resolvedRecipeId,
        promotionId: resolvedPromotionId,
        name,
        qty,
        unitPrice,
        ivaPct,
        itemDiscountMode,
        itemDiscountValue,
        itemDiscount,
        lineBase,
        comment: com ? com : null,
        discountSource,
        promotionDealId: discountSource === "quantity_deal" ? promotionDealId : null,
        promotionDealName:
          discountSource === "quantity_deal" ? promotionDealName : null,
        lineGroupId,
        promotionSnapshot,
        promotionComponents,
      })
    }

    const subtotalAfterItems = roundMoney(
      built.reduce((a, l) => a + l.lineBase, 0),
    )
    const genPct = Math.max(0, Math.min(100, Number(input.valorDescuentoPorcentaje) || 0))
    const genFijo = Math.max(0, Number(input.valorDescuentoFijo) || 0)
    let generalDiscount = 0
    if (input.generalDiscountMode === "porcentaje") {
      generalDiscount = roundMoney(subtotalAfterItems * (genPct / 100))
    } else {
      generalDiscount = roundMoney(Math.min(genFijo, subtotalAfterItems))
    }
    const discountTotal = roundMoney(
      built.reduce((a, l) => a + l.itemDiscount, 0) + generalDiscount,
    )

    const total = roundMoney(subtotalAfterItems - generalDiscount)
    if (total <= 0) {
      return { success: false, error: "El total de la venta debe ser mayor que cero." }
    }

    const scale =
      subtotalAfterItems > 0 ? roundMoney(total / subtotalAfterItems) : 1
    type FiscalLine = BuiltLine & { lineFinal: number; taxPart: number; netPart: number }
    const fiscalLines: FiscalLine[] = []
    let sumTax = 0
    let sumNet = 0
    for (const l of built) {
      const lineFinal = roundMoney(l.lineBase * scale)
      let taxPart = 0
      let netPart = lineFinal
      if (l.ivaPct > 0) {
        taxPart = roundMoney((lineFinal * l.ivaPct) / (100 + l.ivaPct))
        netPart = roundMoney(lineFinal - taxPart)
      }
      sumTax = roundMoney(sumTax + taxPart)
      sumNet = roundMoney(sumNet + netPart)
      fiscalLines.push({ ...l, lineFinal, taxPart, netPart })
    }

    let taxTotal = sumTax
    let subtotalNet = sumNet
    const drift = roundMoney(total - roundMoney(sumNet + sumTax))
    if (Math.abs(drift) >= 0.01 && fiscalLines.length > 0) {
      const last = fiscalLines[fiscalLines.length - 1]
      const adjNet = roundMoney(last.netPart + drift)
      fiscalLines[fiscalLines.length - 1] = {
        ...last,
        netPart: adjNet,
      }
      subtotalNet = roundMoney(
        fiscalLines.reduce((a, x) => a + x.netPart, 0),
      )
      taxTotal = roundMoney(total - subtotalNet)
    } else {
      taxTotal = roundMoney(sumTax)
      subtotalNet = roundMoney(total - taxTotal)
    }

    const snapshotTotals = computeSnapshotTotals({
      lines: built.map((l) => ({
        qty: l.qty,
        unitPrice: l.unitPrice,
        listLineTotal:
          l.discountSource === "combo" &&
          l.promotionSnapshot?.list_total != null
            ? roundMoney(Number(l.promotionSnapshot.list_total))
            : roundMoney(l.qty * l.unitPrice),
        itemDiscount: l.itemDiscount,
        discountSource: l.discountSource,
        promotionDealName: l.promotionDealName,
        name: l.name,
        lineGroupId: l.lineGroupId,
        lineKind: l.lineKind,
        itemDiscountMode: l.itemDiscountMode,
        itemDiscountValue: l.itemDiscountValue,
      })),
      generalDiscount,
      taxTotal,
      total,
      netSubtotalBeforeGeneral: subtotalAfterItems,
    })

    const lineItemsJson = fiscalLines.map((l, index) => {
      const generalShare =
        subtotalAfterItems > 0
          ? roundMoney(generalDiscount * (l.lineBase / subtotalAfterItems))
          : 0
      const display = buildLineDisplay(
        {
          qty: l.qty,
          unitPrice: l.unitPrice,
          itemDiscount: l.itemDiscount,
          discountSource: l.discountSource,
          promotionDealName: l.promotionDealName,
          name: l.name,
          lineGroupId: l.lineGroupId,
          lineKind: l.lineKind,
          itemDiscountMode: l.itemDiscountMode,
          itemDiscountValue: l.itemDiscountValue,
        },
        index,
      )
      return {
        article_id: l.articleId,
        recipe_id: l.recipeId,
        promotion_id: l.promotionId,
        line_kind: l.lineKind,
        quantity: l.qty,
        unit_price: l.unitPrice,
        iva: l.ivaPct,
        item_discount_mode: l.itemDiscountMode,
        item_discount_value: l.itemDiscountValue,
        item_discount_amount: l.itemDiscount,
        line_subtotal: l.lineBase,
        list_line_total:
          l.discountSource === "combo" &&
          l.promotionSnapshot?.list_total != null
            ? roundMoney(Number(l.promotionSnapshot.list_total))
            : roundMoney(l.qty * l.unitPrice),
        tax_base: l.netPart,
        tax_amount: l.taxPart,
        general_discount_share: generalShare,
        line_discount: roundMoney(l.itemDiscount + generalShare),
        line_total: l.lineFinal,
        name_snapshot: l.name,
        comment: l.comment,
        discount_source: l.discountSource,
        promotion_deal_id: l.promotionDealId,
        promotion_deal_name: l.promotionDealName,
        line_group_id: l.lineGroupId,
        display: {
          group_id: display.groupId,
          group_label: display.groupLabel,
          group_type: display.groupType,
          sort_order: display.sortOrder,
        },
        ...(l.promotionSnapshot ? { promotion_snapshot: l.promotionSnapshot } : {}),
      }
    })

    const metadata: Record<string, unknown> = {}
    const invLabel = input.invoiceTypeLabel?.trim()
    const fiscalSiteId = siteIdFromPopRow(popRes.pop)
    const accrueOutputVat = saleComprobanteAccruesOutputVat(
      fiscalSiteId,
      invLabel || null,
    )
    if (invLabel) {
      metadata.invoice_type_label = invLabel
      if (invLabel === SALE_COMPROBANTE_RECIBO_X_LABEL) {
        metadata.invoice_internal_only = true
      }
      metadata.invoice_accrues_output_vat = accrueOutputVat
    } else {
      metadata.invoice_accrues_output_vat = false
    }

    if (!accrueOutputVat && taxTotal > 0) {
      metadata.vat_included_estimate = taxTotal
    }

    if (payOnClientAccount) {
      metadata.pay_on_client_account = true
    }

    const itemDiscountTotal = roundMoney(
      built.reduce((a, l) => a + l.itemDiscount, 0),
    )
    if (itemDiscountTotal > 0) {
      metadata.item_discount_total = itemDiscountTotal
    }
    if (generalDiscount > 0) {
      metadata.general_discount_amount = generalDiscount
      metadata.general_discount_mode = input.generalDiscountMode
      metadata.general_discount_value =
        input.generalDiscountMode === "porcentaje" ? genPct : genFijo
      metadata.subtotal_before_general_discount = subtotalAfterItems
    }

    const customerIvaCondition =
      normalizeCustomerIvaCondition(input.customerIvaCondition) ??
      clientIvaFromDb
    if (customerIvaCondition) {
      metadata.customer_iva_condition = customerIvaCondition
    }

    if (tableSessionId || counterOrderId) {
      if (input.channelOrderTotal != null) {
        metadata.channel_order_total = roundMoney(input.channelOrderTotal)
      }
      if (input.channelPaidAccumulated != null) {
        metadata.channel_paid_accumulated = roundMoney(
          input.channelPaidAccumulated,
        )
      }
      if (input.isPartialChannelPayment === true) {
        metadata.partial_channel_payment = true
      }
    }

    const quantityDealSummaries = summarizeQuantityDealsFromLines(linesIn)
    if (quantityDealSummaries.length > 0) {
      metadata.quantity_deal_applications = quantityDealSummaries.map((d) => ({
        promotion_id: d.promotionId,
        promotion_name: d.promotionName,
        discount_amount: roundMoney(d.discountAmount),
        line_group_ids: d.lineGroupIds,
      }))
    }

    metadata.snapshot_version = SALE_SNAPSHOT_VERSION
    metadata.totals = snapshotTotalsToMetadata(snapshotTotals)

    const persistedSubtotal = accrueOutputVat ? subtotalNet : total
    const persistedTaxTotal = accrueOutputVat ? taxTotal : 0
    const lineItemsToPersist = accrueOutputVat
      ? lineItemsJson
      : lineItemsJson.map((li) => ({ ...li, iva: 0 }))

    const stockNeedsRes = await collectStockDeductionNeeds(supabase, popId, built)
    if (!stockNeedsRes.success) {
      return { success: false, error: stockNeedsRes.error }
    }

    for (const need of stockNeedsRes.needs) {
      const oh = await sumInventoryOnHandForArticle(supabase, popId, need.articleId)
      if (!oh.success) {
        return { success: false, error: oh.error }
      }
      if (need.qty > oh.onHand + 1e-6) {
        return {
          success: false,
          error: `Stock insuficiente para «${need.label || "Insumo"}».`,
        }
      }
    }

    const soldAtIso = new Date().toISOString()

    const { data: saleIns, error: saleErr } = await supabase
      .from("sales")
      .insert({
        pop_id: popId,
        client_id: input.clientId?.trim() || null,
        customer_name: clientName,
        customer_tax_id: clientTaxId,
        line_items: lineItemsToPersist,
        subtotal: persistedSubtotal,
        tax_total: persistedTaxTotal,
        discount_total: discountTotal,
        total,
        currency: "ARS",
        status: "draft",
        sold_at: soldAtIso,
        cash_register_id: cashRegisterId,
        cash_register_session_id: cashRegisterSessionId,
        created_by: user.id,
        metadata,
        sale_channel: counterOrderId
          ? "counter"
          : tableSessionId
            ? "table"
            : "pos",
        table_session_id: tableSessionId,
        counter_order_id: counterOrderId,
      })
      .select("id")
      .single()

    if (saleErr || !saleIns?.id) {
      return {
        success: false,
        error: saleErr?.message || "No se pudo crear la venta.",
      }
    }
    const saleId = String(saleIns.id)
    saleIdForRollback = saleId

    if (!payOnClientAccount && paymentKind && treasuryAccountId) {
      let checkId: string | null = null
      if (paymentKind === "check" && checkoutCheckDetails) {
        const checkRes = await insertCheckoutCheck(supabase, {
          popId,
          userId: user.id,
          direction: "received",
          amount: total,
          details: checkoutCheckDetails,
          sourceKind: "sale",
          sourceId: saleId,
        })
        if (!checkRes.success) {
          await cancelSaleRollback(supabase, saleId, [])
          return { success: false, error: checkRes.error }
        }
        checkId = checkRes.checkId
      }
      const { error: payErr } = await supabase.from("sale_payments").insert({
        pop_id: popId,
        sale_id: saleId,
        payment_kind: paymentKind,
        treasury_account_id: treasuryAccountId,
        amount: total,
        sort_order: 0,
        check_id: checkId,
      })
      if (payErr) {
        if (checkId) await deleteCheckoutCheck(supabase, checkId)
        await cancelSaleRollback(supabase, saleId, [])
        return { success: false, error: payErr.message || "No se pudo registrar el cobro." }
      }
    }

    let cogsTotal = 0
    for (const need of stockNeedsRes.needs) {
      const deductRes = await deductArticleStockForSale(
        supabase,
        popId,
        saleId,
        user.id,
        need,
      )
      if (!deductRes.success) {
        await cancelSaleRollback(supabase, saleId, trackedMovements)
        return { success: false, error: deductRes.error }
      }
      trackedMovements.push(deductRes.movement)
      cogsTotal = roundMoney(cogsTotal + deductRes.amount)
    }

    const tz = timezoneForPopLedger(popRes.pop.country, popRes.pop.siteId)
    const entryDate = entryDateIsoInTimezone(tz)

    const ledgerTaxTotal = accrueOutputVat ? taxTotal : 0
    const revenueCredit = accrueOutputVat ? subtotalNet : total

    let debitAccountId = paymentAccountId
    if (payOnClientAccount) {
      debitAccountId = await resolveAccountId(
        supabase,
        popId,
        CHART_CUENTAS_POR_COBRAR_CODES,
      )
      if (!debitAccountId) {
        await cancelSaleRollback(supabase, saleId, trackedMovements)
        return {
          success: false,
          error:
            "No hay cuenta Cuentas por Cobrar (p. ej. 1.1.2.01) en el plan de cuentas.",
        }
      }
    }

    const saleChannel = parseCashRegisterSaleChannel(
      counterOrderId ? "counter" : tableSessionId ? "table" : "pos",
    )
    const ventasId = await resolveAccountId(
      supabase,
      popId,
      chartVentasCodesForSaleChannel(saleChannel),
    )
    if (!ventasId) {
      await cancelSaleRollback(supabase, saleId, trackedMovements)
      return {
        success: false,
        error:
          "No hay cuenta de ingresos por ventas para este canal en el plan de cuentas.",
      }
    }

    const ivaId =
      ledgerTaxTotal > 0
        ? await resolveAccountId(supabase, popId, CHART_IVA_PAGAR_CODES)
        : null
    if (ledgerTaxTotal > 0 && !ivaId) {
      await cancelSaleRollback(supabase, saleId, trackedMovements)
      return {
        success: false,
        error: "No hay cuenta de IVA a pagar (p. ej. 2.1.2.01) en el plan de cuentas.",
      }
    }

    const mercaderiasId = await resolveAccountId(supabase, popId, CHART_MERCADERIAS_CODES)
    const costoVentasId = await resolveAccountId(supabase, popId, CHART_COSTO_VENTAS_CODES)
    if (cogsTotal > 0 && (!mercaderiasId || !costoVentasId)) {
      await cancelSaleRollback(supabase, saleId, trackedMovements)
      return {
        success: false,
        error:
          "No hay cuenta de mercaderías o costo de ventas (p. ej. 1.1.3.01 / 5.1.1.01) en el plan de cuentas.",
      }
    }

    const { data: maxRow } = await supabase
      .from("accounting_entries")
      .select("entry_number")
      .eq("pop_id", popId)
      .order("entry_number", { ascending: false })
      .limit(1)
      .maybeSingle()
    const nextNum =
      maxRow?.entry_number != null && Number.isFinite(Number(maxRow.entry_number))
        ? Number(maxRow.entry_number) + 1
        : 1

    const entryDescription = `Venta registrada`
    const { data: entIns, error: entErr } = await supabase
      .from("accounting_entries")
      .insert({
        pop_id: popId,
        entry_number: nextNum,
        entry_date: entryDate,
        source_type: "sale",
        source_id: saleId,
        description: entryDescription,
        status: "draft",
        created_by: user.id,
      })
      .select("id")
      .single()
    if (entErr || !entIns?.id) {
      await cancelSaleRollback(supabase, saleId, trackedMovements)
      return { success: false, error: entErr?.message || "No se pudo crear el asiento contable." }
    }
    revenueEntryId = String(entIns.id)

    const linesPayload: {
      account_id: string
      debit_amount: number
      credit_amount: number
      description: string | null
      line_order: number
    }[] = [
      {
        account_id: debitAccountId!,
        debit_amount: total,
        credit_amount: 0,
        description: entryDescription,
        line_order: 1,
      },
      {
        account_id: ventasId,
        debit_amount: 0,
        credit_amount: revenueCredit,
        description: entryDescription,
        line_order: 2,
      },
    ]
    let order = 3
    if (ledgerTaxTotal > 0 && ivaId) {
      linesPayload.push({
        account_id: ivaId,
        debit_amount: 0,
        credit_amount: ledgerTaxTotal,
        description: entryDescription,
        line_order: order,
      })
      order += 1
    }
    if (cogsTotal > 0 && mercaderiasId && costoVentasId) {
      linesPayload.push(
        {
          account_id: costoVentasId,
          debit_amount: cogsTotal,
          credit_amount: 0,
          description: "Costo de mercaderías vendidas",
          line_order: order,
        },
        {
          account_id: mercaderiasId,
          debit_amount: 0,
          credit_amount: cogsTotal,
          description: "Costo de mercaderías vendidas",
          line_order: order + 1,
        },
      )
    }

    const { error: linesErr } = await supabase.from("accounting_entry_lines").insert(
      linesPayload.map((row) => ({ ...row, entry_id: revenueEntryId })),
    )
    if (linesErr) {
      await cancelAccountingEntry(supabase, revenueEntryId)
      revenueEntryId = null
      await cancelSaleRollback(supabase, saleId, trackedMovements)
      return { success: false, error: linesErr.message || "No se pudieron crear las líneas del asiento." }
    }

    const { error: postErr } = await supabase
      .from("accounting_entries")
      .update({
        status: "posted",
        posted_at: new Date().toISOString(),
        posted_by: user.id,
      })
      .eq("id", revenueEntryId)
    if (postErr) {
      await cancelAccountingEntry(supabase, revenueEntryId)
      revenueEntryId = null
      await cancelSaleRollback(supabase, saleId, trackedMovements)
      return { success: false, error: postErr.message || "No se pudo registrar el asiento." }
    }

    const { error: compErr } = await supabase
      .from("sales")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", saleId)
    if (compErr) {
      await cancelAccountingEntry(supabase, revenueEntryId)
      revenueEntryId = null
      await cancelSaleRollback(supabase, saleId, trackedMovements)
      return { success: false, error: compErr.message || "No se pudo completar la venta." }
    }

    const channelFullyPaid =
      input.channelOrderTotal != null &&
      input.channelPaidAccumulated != null &&
      input.channelPaidAccumulated + 0.009 >= input.channelOrderTotal

    const shouldCloseTableSession =
      tableSessionId &&
      (input.closeTableSession === true ||
        (input.isPartialChannelPayment === true && channelFullyPaid))

    const shouldLinkCounterOrder =
      counterOrderId &&
      (input.linkCounterOrder === true ||
        (input.isPartialChannelPayment === true && channelFullyPaid))

    if (tableSessionId && shouldCloseTableSession) {
      const { error: closeSessionErr } = await supabase
        .from("table_sessions")
        .update({
          status: "closed",
          closed_at: new Date().toISOString(),
          closed_by: user.id,
        })
        .eq("id", tableSessionId)
        .eq("pop_id", popId)
        .eq("status", "open")

      if (closeSessionErr) {
        return {
          success: false,
          error:
            closeSessionErr.message ||
            "La venta se registró pero no se pudo cerrar la mesa.",
        }
      }
    }

    if (counterOrderId && shouldLinkCounterOrder) {
      const { error: linkOrderErr } = await supabase
        .from("counter_orders")
        .update({ sale_id: saleId })
        .eq("id", counterOrderId)
        .eq("pop_id", popId)

      if (linkOrderErr) {
        return {
          success: false,
          error:
            linkOrderErr.message ||
            "La venta se registró pero no se pudo vincular al pedido.",
        }
      }
    }

    return { success: true, saleId }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
