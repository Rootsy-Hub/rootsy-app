"use server"

import {
  postPurchasePaymentLedger,
  postPurchaseReceiptLedger,
} from "@/lib/purchaseAccountingPosting"
import {
  getPopById,
  validatePopAccess,
} from "@/lib/popHelpers"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import {
  entryDateIsoInTimezone,
  timezoneForPopLedger,
} from "@/lib/entryDateTimezone"
import { createClient } from "@/utils/supabase/server"
import type {
  CreatePurchaseInput,
  PurchaseKind,
} from "@/app/[siteId]/[popId]/purchases/actions"
import { purchaseComprobanteAccruesInputVat } from "@/lib/purchaseComprobantePicker"
import {
  finalizePurchaseCheckout,
  type PurchaseLineBuilt,
} from "@/lib/purchaseCheckoutLines"
import { resolvePurchaseCheckoutLine } from "@/app/[siteId]/[popId]/purchases/purchaseLineResolve"

export type CompletePurchaseInput = CreatePurchaseInput & {
  /** Sin pago inmediato: queda deuda en Proveedores. */
  payOnSupplierAccount?: boolean
  /** Cuotas con tarjeta de crédito (1 = contado). Solo informativo en notas si > 1. */
  cardInstallments?: number
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function parseMoney(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return roundMoney(n)
}

function parseQty(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 1e6) / 1e6
}

type BuiltLine = PurchaseLineBuilt

async function rollbackCompletePurchase(
  supabase: Awaited<ReturnType<typeof createClient>>,
  purchaseId: string | null,
  movementIds: string[],
) {
  if (!purchaseId) return
  for (const mid of movementIds) {
    await supabase.from("inventory_cost_layers").delete().eq("source_movement_id", mid)
  }
  if (movementIds.length > 0) {
    await supabase.from("inventory_movements").delete().in("id", movementIds)
  }
  await supabase.from("purchase_payments").delete().eq("purchase_id", purchaseId)
  await supabase.from("purchase_documents").delete().eq("purchase_id", purchaseId)
  await supabase.from("purchases").delete().eq("id", purchaseId)
}

export async function completePurchase(
  popId: string,
  input: CompletePurchaseInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  let purchaseId: string | null = null
  const movementIds: string[] = []

  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    const canCreate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.OPERATIONS_CREATE.resource,
      POP_PERMS.OPERATIONS_CREATE.action,
    )
    if (!canCreate) {
      return { success: false, error: "Sin permiso para registrar compras." }
    }

    const kind = input.purchaseKind
    if (!["merchandise", "raw_material", "supply"].includes(kind)) {
      return { success: false, error: "Tipo de compra inválido." }
    }

    const payOnAccount = Boolean(input.payOnSupplierAccount)
    const paymentKind = input.paymentKind?.trim() || null
    const treasuryAccountId = input.treasuryAccountId?.trim() || null

    if (!payOnAccount && (!paymentKind || !treasuryAccountId)) {
      return {
        success: false,
        error: "Elegí un medio de pago o registrá la compra a cuenta corriente del proveedor.",
      }
    }

    if (payOnAccount && !input.supplierId?.trim()) {
      return {
        success: false,
        error: "Para comprar a cuenta corriente tenés que elegir un proveedor.",
      }
    }

    const lines = input.lines.filter(
      (l) =>
        l.articleId?.trim() &&
        l.articleCostId?.trim() &&
        parseQty(l.costQuantity) > 0,
    )
    if (lines.length === 0) {
      return {
        success: false,
        error: "Agregá al menos un ítem con cantidad mayor a cero.",
      }
    }

    const canUpdateArticles = permissionKeysInclude(
      snap.keys,
      POP_PERMS.ARTICLE_UPDATE.resource,
      POP_PERMS.ARTICLE_UPDATE.action,
    )
    if (lines.some((l) => l.updateArticleCost) && !canUpdateArticles) {
      return {
        success: false,
        error: "Sin permiso para actualizar precios de costos de artículos.",
      }
    }

    const user = await requireAuthenticatedUser()
    const supabase = await createClient()
    const popRes = await getPopById(popId)
    if (!popRes.success || !popRes.pop) {
      return { success: false, error: popRes.error || "Punto de venta inválido." }
    }

    let supplierName: string | null = null
    let supplierTaxId: string | null = null
    const supplierId = input.supplierId?.trim() || null
    if (supplierId) {
      const { data: supRow, error: supErr } = await supabase
        .from("suppliers")
        .select("id, name, tax_id")
        .eq("id", supplierId)
        .eq("pop_id", popId)
        .maybeSingle()
      if (supErr || !supRow) {
        return { success: false, error: "Proveedor inválido." }
      }
      supplierName = String(supRow.name ?? "")
      supplierTaxId =
        supRow.tax_id != null ? String(supRow.tax_id) : null
    } else {
      const manual = input.supplierManual
      const manualName = manual?.name?.trim() || ""
      const manualTaxId = manual?.taxId?.trim() || ""
      if (manualName || manualTaxId) {
        supplierName = manualName || null
        supplierTaxId = manualTaxId || null
      }
    }

    let pmKind: string | null = paymentKind
    if (!payOnAccount && paymentKind && treasuryAccountId) {
      const { data: taRow, error: taErr } = await supabase
        .from("treasury_accounts")
        .select("id")
        .eq("id", treasuryAccountId)
        .eq("pop_id", popId)
        .eq("is_active", true)
        .maybeSingle()
      if (taErr || !taRow) {
        return { success: false, error: "Cuenta de tesorería inválida." }
      }
    }

    const installmentsRaw = Number(input.cardInstallments ?? 1)
    const installments =
      pmKind === "card_credit" &&
      Number.isFinite(installmentsRaw) &&
      installmentsRaw >= 2
        ? Math.min(24, Math.trunc(installmentsRaw))
        : 1

    const built: BuiltLine[] = []
    for (const l of lines) {
      const resolved = await resolvePurchaseCheckoutLine(supabase, popId, {
        articleId: l.articleId,
        articleCostId: l.articleCostId,
        costQuantity: l.costQuantity,
        unitCost: l.unitCost,
        itemDiscountMode: l.itemDiscountMode,
        itemDiscountDraft: l.itemDiscountDraft,
        comment: l.comment,
        updateArticleCost: l.updateArticleCost,
      })
      if ("error" in resolved) {
        return { success: false, error: resolved.error }
      }
      built.push(resolved.line)
    }
    if (built.length === 0) {
      return { success: false, error: "No hay ítems válidos en la compra." }
    }

    const checkout = finalizePurchaseCheckout(
      built,
      input.generalDiscountMode ?? "porcentaje",
      Number(input.generalDiscountValue ?? 0),
    )
    if (checkout.total <= 0) {
      return { success: false, error: "El total de la compra debe ser mayor que cero." }
    }

    const {
      generalDiscount,
      itemDiscountTotal,
      discountTotal,
      total,
      subtotalNet,
      taxTotal,
      fiscalLines,
      lineItemsJson,
      subtotalAfterItems,
    } = checkout

    const docKind = input.documentKind?.trim() || null
    const accrueInputVat = purchaseComprobanteAccruesInputVat(docKind)
    const persistedSubtotal = accrueInputVat ? subtotalNet : total
    const persistedTaxTotal = accrueInputVat ? taxTotal : 0
    const lineItemsToPersist = accrueInputVat
      ? lineItemsJson
      : lineItemsJson.map((li) => ({ ...li, iva: 0 }))

    const purchaseMetadata: Record<string, unknown> = {
      ...(payOnAccount ? { pay_on_supplier_account: true } : {}),
      purchase_accrues_input_vat: accrueInputVat,
    }
    if (docKind) {
      purchaseMetadata.purchase_document_kind = docKind
    }
    if (!accrueInputVat && taxTotal > 0) {
      purchaseMetadata.vat_included_estimate = taxTotal
    }
    if (itemDiscountTotal > 0) {
      purchaseMetadata.item_discount_total = itemDiscountTotal
    }
    if (generalDiscount > 0) {
      purchaseMetadata.general_discount_amount = generalDiscount
      purchaseMetadata.general_discount_mode = input.generalDiscountMode ?? "porcentaje"
      purchaseMetadata.general_discount_value = Number(input.generalDiscountValue ?? 0)
      purchaseMetadata.subtotal_before_general_discount = subtotalAfterItems
    }

    const receivedAt = new Date().toISOString()
    const paymentNotes =
      installments > 1 ? `Financiado en ${installments} cuotas` : null

    const { data: ins, error: insErr } = await supabase
      .from("purchases")
      .insert({
        pop_id: popId,
        supplier_id: supplierId,
        supplier_name: supplierName,
        supplier_tax_id: supplierTaxId,
        purchase_kind: kind as PurchaseKind,
        document_number: input.documentNumber?.trim() || null,
        document_date: input.documentDate?.trim() || null,
        due_date: input.dueDate?.trim() || null,
        received_at: receivedAt,
        line_items: lineItemsToPersist,
        subtotal: persistedSubtotal,
        tax_total: persistedTaxTotal,
        discount_total: discountTotal,
        total,
        currency: "ARS",
        status: "pending",
        notes: input.notes?.trim() || "",
        metadata: purchaseMetadata,
        created_by: user.uid,
      })
      .select("id")
      .maybeSingle()

    if (insErr || !ins?.id) {
      return {
        success: false,
        error: insErr?.message || "No se pudo crear la compra.",
      }
    }
    purchaseId = String(ins.id)

    const attachmentName = input.attachmentFileName?.trim() || null
    if (docKind || attachmentName || input.documentNumber?.trim()) {
      const { error: docErr } = await supabase.from("purchase_documents").insert({
        pop_id: popId,
        purchase_id: purchaseId,
        doc_kind: docKind,
        invoice_number: input.documentNumber?.trim() || null,
        invoice_date: input.documentDate?.trim() || null,
        amount: total,
        metadata: attachmentName ? { attachment_name: attachmentName } : {},
      })
      if (docErr) {
        await rollbackCompletePurchase(supabase, purchaseId, movementIds)
        return {
          success: false,
          error: docErr.message || "No se pudo registrar el comprobante.",
        }
      }
    }

    for (const l of fiscalLines) {
      const note = `Compra — ${l.name} (${l.costUnitLabel})`
      const { data: movIns, error: movErr } = await supabase
        .from("inventory_movements")
        .insert({
          pop_id: popId,
          article_id: l.articleId,
          quantity_delta: l.saleQty,
          movement_type: "purchase_receipt",
          purchase_id: purchaseId,
          note,
          created_by: user.uid,
        })
        .select("id")
        .single()
      if (movErr || !movIns?.id) {
        await rollbackCompletePurchase(supabase, purchaseId, movementIds)
        return {
          success: false,
          error: movErr?.message || "No se pudo registrar el ingreso de stock.",
        }
      }
      const movementId = String(movIns.id)
      movementIds.push(movementId)

      const layerUnitCost =
        l.saleQty > 0
          ? accrueInputVat
            ? l.netPart > 0
              ? roundMoney(l.netPart / l.saleQty)
              : roundMoney(l.unitCostSaleUom)
            : roundMoney(l.unitCostSaleUom)
          : 0
      const { error: layerErr } = await supabase.from("inventory_cost_layers").insert({
        pop_id: popId,
        article_id: l.articleId,
        source_movement_id: movementId,
        quantity_received: l.saleQty,
        quantity_remaining: l.saleQty,
        unit_cost: layerUnitCost,
      })
      if (layerErr) {
        await rollbackCompletePurchase(supabase, purchaseId, movementIds)
        return {
          success: false,
          error: layerErr.message || "No se pudo registrar la capa de costo.",
        }
      }
    }

    const tz = timezoneForPopLedger(popRes.pop.country, popRes.pop.siteId)
    const entryDate = entryDateIsoInTimezone(tz)

    const receiptLedger = await postPurchaseReceiptLedger(supabase, {
      popId,
      userId: user.uid,
      purchaseId,
      purchaseKind: kind as PurchaseKind,
      entryDate,
      subtotalNet: persistedSubtotal,
      taxTotal: persistedTaxTotal,
      total,
      supplierName,
    })
    if (!receiptLedger.success) {
      await rollbackCompletePurchase(supabase, purchaseId, movementIds)
      return { success: false, error: receiptLedger.error }
    }

    if (!payOnAccount && paymentKind && treasuryAccountId) {
      const paidAt = entryDate
      const { data: payIns, error: payErr } = await supabase
        .from("purchase_payments")
        .insert({
          pop_id: popId,
          purchase_id: purchaseId,
          payment_kind: paymentKind,
          treasury_account_id: treasuryAccountId,
          amount: total,
          paid_at: paidAt,
          notes: paymentNotes,
          created_by: user.uid,
        })
        .select("id")
        .single()
      if (payErr || !payIns?.id) {
        await rollbackCompletePurchase(supabase, purchaseId, movementIds)
        return {
          success: false,
          error: payErr?.message || "No se pudo registrar el pago al proveedor.",
        }
      }
      const payLedger = await postPurchasePaymentLedger(supabase, {
        popId,
        userId: user.uid,
        purchasePaymentId: String(payIns.id),
      })
      if (!payLedger.success) {
        await rollbackCompletePurchase(supabase, purchaseId, movementIds)
        return { success: false, error: payLedger.error }
      }
    }

    const costUpdates = new Map<string, number>()
    for (const l of fiscalLines) {
      if (!l.updateArticleCost) continue
      const effectiveUnit =
        l.costQty > 0
          ? accrueInputVat
            ? l.netUnitCost > 0
              ? l.netUnitCost
              : roundMoney(l.lineFinal / l.costQty)
            : roundMoney(l.lineFinal / l.costQty)
          : 0
      if (effectiveUnit < 0) continue
      costUpdates.set(l.articleCostId, effectiveUnit)
    }
    for (const [articleCostId, unitPrice] of costUpdates) {
      const { error: costErr } = await supabase
        .from("article_costs")
        .update({ unit_price: unitPrice })
        .eq("id", articleCostId)
        .eq("pop_id", popId)
      if (costErr) {
        await rollbackCompletePurchase(supabase, purchaseId, movementIds)
        return {
          success: false,
          error: costErr.message || "No se pudo actualizar el precio del costo.",
        }
      }
    }

    return { success: true, id: purchaseId }
  } catch (e: unknown) {
    if (purchaseId) {
      const supabase = await createClient()
      await rollbackCompletePurchase(supabase, purchaseId, movementIds)
    }
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
