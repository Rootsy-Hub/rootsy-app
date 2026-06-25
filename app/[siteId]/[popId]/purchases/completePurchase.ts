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

type BuiltLine = {
  articleId: string
  name: string
  qty: number
  unitCost: number
  ivaPct: number
  lineBase: number
  netPart: number
  taxPart: number
  netUnitCost: number
}

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
    const paymentMethodId = input.paymentMethodId?.trim() || null

    if (!payOnAccount && !paymentMethodId) {
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
      (l) => l.articleId?.trim() && parseQty(l.quantity) > 0,
    )
    if (lines.length === 0) {
      return {
        success: false,
        error: "Agregá al menos un ítem con cantidad mayor a cero.",
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
    }

    let pmKind: string | null = null
    if (!payOnAccount && paymentMethodId) {
      const { data: pmRow, error: pmErr } = await supabase
        .from("payment_methods")
        .select("id, kind")
        .eq("id", paymentMethodId)
        .eq("pop_id", popId)
        .eq("is_active", true)
        .maybeSingle()
      if (pmErr || !pmRow) {
        return { success: false, error: "Medio de pago inválido." }
      }
      pmKind = String(pmRow.kind ?? "other")
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
      const articleId = l.articleId.trim()
      const qty = parseQty(l.quantity)
      const unitCost = parseMoney(l.unitCost)
      if (qty <= 0) continue
      if (unitCost < 0) {
        return { success: false, error: "El costo unitario no puede ser negativo." }
      }
      const { data: artRow, error: artErr } = await supabase
        .from("articles")
        .select("id, name, iva")
        .eq("id", articleId)
        .eq("pop_id", popId)
        .maybeSingle()
      if (artErr || !artRow) {
        return { success: false, error: "Artículo inválido o inactivo." }
      }
      const ivaPct = parseMoney(artRow.iva)
      const lineBase = roundMoney(qty * unitCost)
      let taxPart = 0
      let netPart = lineBase
      if (ivaPct > 0) {
        taxPart = roundMoney((lineBase * ivaPct) / (100 + ivaPct))
        netPart = roundMoney(lineBase - taxPart)
      }
      const netUnitCost = qty > 0 ? roundMoney(netPart / qty) : 0
      built.push({
        articleId,
        name: String(artRow.name ?? "Artículo"),
        qty,
        unitCost,
        ivaPct,
        lineBase,
        netPart,
        taxPart,
        netUnitCost,
      })
    }
    if (built.length === 0) {
      return { success: false, error: "No hay ítems válidos en la compra." }
    }

    let subtotalNet = 0
    let taxTotal = 0
    const lineItemsJson: Record<string, unknown>[] = []
    for (const l of built) {
      subtotalNet = roundMoney(subtotalNet + l.netPart)
      taxTotal = roundMoney(taxTotal + l.taxPart)
      lineItemsJson.push({
        article_id: l.articleId,
        quantity: l.qty,
        unit_cost: l.unitCost,
        iva: l.ivaPct,
        line_total: l.lineBase,
        name_snapshot: l.name,
      })
    }

    const totalBeforeDiscount = roundMoney(subtotalNet + taxTotal)
    let discountTotal = 0
    const discountMode = input.generalDiscountMode ?? "porcentaje"
    const discountVal = Number(input.generalDiscountValue ?? 0)
    if (Number.isFinite(discountVal) && discountVal > 0) {
      discountTotal =
        discountMode === "porcentaje"
          ? roundMoney(
              totalBeforeDiscount *
                (Math.min(100, Math.max(0, discountVal)) / 100),
            )
          : roundMoney(Math.min(Math.max(0, discountVal), totalBeforeDiscount))
    }
    const total = roundMoney(totalBeforeDiscount - discountTotal)
    if (total <= 0) {
      return { success: false, error: "El total de la compra debe ser mayor que cero." }
    }

    let netAfter = subtotalNet
    let taxAfter = taxTotal
    if (discountTotal > 0 && totalBeforeDiscount > 0) {
      netAfter = roundMoney(subtotalNet * (total / totalBeforeDiscount))
      taxAfter = roundMoney(total - netAfter)
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
        line_items: lineItemsJson,
        subtotal: netAfter,
        tax_total: taxAfter,
        discount_total: discountTotal,
        total,
        currency: "ARS",
        status: "pending",
        notes: input.notes?.trim() || "",
        metadata: payOnAccount ? { pay_on_supplier_account: true } : {},
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

    const docKind = input.documentKind?.trim() || null
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

    for (const l of built) {
      const note = `Compra — ${l.name}`
      const { data: movIns, error: movErr } = await supabase
        .from("inventory_movements")
        .insert({
          pop_id: popId,
          article_id: l.articleId,
          quantity_delta: l.qty,
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

      const layerUnitCost = l.netUnitCost > 0 ? l.netUnitCost : l.unitCost
      const { error: layerErr } = await supabase.from("inventory_cost_layers").insert({
        pop_id: popId,
        article_id: l.articleId,
        source_movement_id: movementId,
        quantity_received: l.qty,
        quantity_remaining: l.qty,
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
      subtotalNet: netAfter,
      taxTotal: taxAfter,
      total,
      supplierName,
    })
    if (!receiptLedger.success) {
      await rollbackCompletePurchase(supabase, purchaseId, movementIds)
      return { success: false, error: receiptLedger.error }
    }

    if (!payOnAccount && paymentMethodId) {
      const paidAt = entryDate
      const { data: payIns, error: payErr } = await supabase
        .from("purchase_payments")
        .insert({
          pop_id: popId,
          purchase_id: purchaseId,
          payment_method_id: paymentMethodId,
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
