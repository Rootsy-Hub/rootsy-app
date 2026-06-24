"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import {
  getPopById,
  getPopSiteId,
  validatePopAccess,
} from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { createClient } from "@/utils/supabase/server"

export type PurchaseKind = "merchandise" | "raw_material" | "supply"

export type PurchaseStatus =
  | "draft"
  | "pending"
  | "partial"
  | "paid"
  | "cancelled"
  | "voided"

export type SupplierOption = {
  id: string
  name: string
  taxId: string
}

export type PurchaseArticleOption = {
  id: string
  name: string
  costPrice: number
  iva: number
}

export type PurchaseListRow = {
  id: string
  purchaseKind: PurchaseKind
  status: PurchaseStatus
  documentNumber: string | null
  documentDate: string | null
  dueDate: string | null
  supplierId: string | null
  supplierName: string
  supplierTaxId: string | null
  total: number
  currency: string
  lineCount: number
  paidTotal: number
  createdAt: string
  receivedAt: string | null
}

export type CreatePurchaseLineInput = {
  articleId: string
  quantity: number
  unitCost: number
}

export type PurchaseCatalogPaymentMethod = {
  id: string
  name: string
  kind: string
  sortOrder: number
}

export type CreatePurchaseInput = {
  supplierId: string | null
  purchaseKind: PurchaseKind
  documentNumber?: string
  documentDate?: string
  dueDate?: string
  documentKind?: string | null
  attachmentFileName?: string | null
  notes?: string
  lines: CreatePurchaseLineInput[]
  /** Si true, la compra queda confirmada (pending) y admite pagos. */
  confirmPurchase?: boolean
  generalDiscountMode?: "porcentaje" | "fijo"
  generalDiscountValue?: number
  paymentMethodId?: string | null
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

function parseLineItems(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return []
  return raw
}

async function purchasesAccess(popId: string) {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { ok: false as const, error: access.error || "Sin acceso" }
  }
  const snap = await loadPopPermissionsSnapshot(popId)
  const canRead = permissionKeysInclude(
    snap.keys,
    POP_PERMS.OPERATIONS_READ.resource,
    POP_PERMS.OPERATIONS_READ.action,
  )
  if (!canRead) {
    return {
      ok: false as const,
      error: "No tenés permiso para ver compras en este punto de venta.",
      redirect: popMenuHref(await getPopSiteId(popId), popId),
    }
  }
  const canCreate = permissionKeysInclude(
    snap.keys,
    POP_PERMS.OPERATIONS_CREATE.resource,
    POP_PERMS.OPERATIONS_CREATE.action,
  )
  const canUpdate = permissionKeysInclude(
    snap.keys,
    POP_PERMS.OPERATIONS_UPDATE.resource,
    POP_PERMS.OPERATIONS_UPDATE.action,
  )
  const canDelete = permissionKeysInclude(
    snap.keys,
    POP_PERMS.OPERATIONS_DELETE.resource,
    POP_PERMS.OPERATIONS_DELETE.action,
  )
  return { ok: true as const, canCreate, canUpdate, canDelete }
}

export type PurchaseCatalogSupplier = {
  id: string
  name: string
  taxId: string
}

export type PurchaseCatalogCategory = {
  id: string
  name: string
}

export type PurchaseCatalogArticle = {
  id: string
  name: string
  description: string
  costPrice: number
  iva: number
  categoryId: string
  categoryName: string
}

export async function getPurchaseCatalog(popId: string): Promise<
  | {
      success: true
      popName: string
      categories: PurchaseCatalogCategory[]
      articles: PurchaseCatalogArticle[]
      suppliers: PurchaseCatalogSupplier[]
      paymentMethods: PurchaseCatalogPaymentMethod[]
      canCreate: boolean
      canReadPaymentMethods: boolean
    }
  | { success: false; error: string }
> {
  try {
    const access = await purchasesAccess(popId)
    if (!access.ok) {
      return { success: false, error: access.error }
    }
    const supabase = await createClient()
    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""

    const { data: catRows, error: catErr } = await supabase
      .from("categories")
      .select("id, name")
      .eq("pop_id", popId)
      .order("name", { ascending: true })
    if (catErr) {
      return { success: false, error: catErr.message }
    }
    const categories: PurchaseCatalogCategory[] = (catRows || []).map((c) => ({
      id: String(c.id),
      name: String(c.name ?? ""),
    }))

    const { data: artRows, error: artErr } = await supabase
      .from("articles")
      .select(
        `
        id,
        name,
        description,
        cost_price,
        iva,
        category_id,
        categories ( id, name )
      `,
      )
      .eq("pop_id", popId)
      .eq("is_active", true)
      .order("name", { ascending: true })
    if (artErr) {
      return { success: false, error: artErr.message }
    }
    const articles: PurchaseCatalogArticle[] = (artRows || []).map((row) => {
      const cat = row.categories as unknown as { name?: string } | null
      return {
        id: String(row.id),
        name: String(row.name ?? ""),
        description: String(row.description ?? ""),
        costPrice: parseMoney(row.cost_price),
        iva: parseMoney(row.iva),
        categoryId: String(row.category_id ?? ""),
        categoryName: cat?.name ? String(cat.name) : "—",
      }
    })

    const { data: supRows, error: supErr } = await supabase
      .from("suppliers")
      .select("id, name, tax_id")
      .eq("pop_id", popId)
      .order("name", { ascending: true })
    if (supErr) {
      return { success: false, error: supErr.message }
    }
    const suppliers: PurchaseCatalogSupplier[] = (supRows || []).map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
      taxId: r.tax_id != null ? String(r.tax_id) : "",
    }))

    const canReadPaymentMethods = access.canCreate
    let paymentMethods: PurchaseCatalogPaymentMethod[] = []
    if (canReadPaymentMethods) {
      const { data: pmRows, error: pmErr } = await supabase
        .from("payment_methods")
        .select("id, name, kind, usage, sort_order")
        .eq("pop_id", popId)
        .eq("is_active", true)
        .in("usage", ["pay", "both"])
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })
      if (pmErr) {
        return { success: false, error: pmErr.message }
      }
      paymentMethods = (pmRows || []).map((p) => ({
        id: String(p.id),
        name: String(p.name ?? ""),
        kind: String(p.kind ?? "other"),
        sortOrder: Number(p.sort_order ?? 0) || 0,
      }))
    }

    return {
      success: true,
      popName,
      categories,
      articles,
      suppliers,
      paymentMethods,
      canCreate: access.canCreate,
      canReadPaymentMethods,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getPurchasesPageData(popId: string): Promise<
  | {
      success: true
      popName: string
      suppliers: SupplierOption[]
      articles: PurchaseArticleOption[]
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
  | { success: false; error: string; redirect?: string }
> {
  try {
    const access = await purchasesAccess(popId)
    if (!access.ok) {
      return {
        success: false,
        error: access.error,
        redirect: access.redirect,
      }
    }
    const supabase = await createClient()
    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""

    const { data: supRows, error: supErr } = await supabase
      .from("suppliers")
      .select("id, name, tax_id")
      .eq("pop_id", popId)
      .order("name", { ascending: true })
    if (supErr) {
      return {
        success: false,
        error: supErr.message || "No se pudieron cargar proveedores.",
      }
    }
    const suppliers: SupplierOption[] = (supRows || []).map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
      taxId: r.tax_id != null ? String(r.tax_id) : "",
    }))

    const { data: artRows, error: artErr } = await supabase
      .from("articles")
      .select("id, name, cost_price, iva")
      .eq("pop_id", popId)
      .eq("is_active", true)
      .order("name", { ascending: true })
    if (artErr) {
      return {
        success: false,
        error: artErr.message || "No se pudieron cargar artículos.",
      }
    }
    const articles: PurchaseArticleOption[] = (artRows || []).map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
      costPrice: parseMoney(r.cost_price),
      iva: parseMoney(r.iva),
    }))

    return {
      success: true,
      popName,
      suppliers,
      articles,
      canCreate: access.canCreate,
      canUpdate: access.canUpdate,
      canDelete: access.canDelete,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function listPurchases(popId: string): Promise<
  | { success: true; rows: PurchaseListRow[] }
  | { success: false; error: string }
> {
  try {
    const access = await purchasesAccess(popId)
    if (!access.ok) {
      return { success: false, error: access.error }
    }
    const supabase = await createClient()
    const { data: rows, error } = await supabase
      .from("purchases")
      .select(
        `
        id,
        purchase_kind,
        status,
        document_number,
        document_date,
        due_date,
        supplier_id,
        supplier_name,
        supplier_tax_id,
        total,
        currency,
        line_items,
        created_at,
        received_at,
        suppliers ( name, tax_id )
      `,
      )
      .eq("pop_id", popId)
      .order("created_at", { ascending: false })
      .limit(500)
    if (error) {
      return { success: false, error: error.message || "No se pudieron cargar compras." }
    }

    const list = rows || []
    const ids = list.map((r) => String(r.id))
    const paidByPurchase = new Map<string, number>()
    if (ids.length > 0) {
      const { data: payRows, error: payErr } = await supabase
        .from("purchase_payments")
        .select("purchase_id, amount")
        .eq("pop_id", popId)
        .in("purchase_id", ids)
      if (payErr) {
        return {
          success: false,
          error: payErr.message || "No se pudieron cargar pagos.",
        }
      }
      for (const p of payRows || []) {
        const pid = String(p.purchase_id)
        paidByPurchase.set(
          pid,
          roundMoney((paidByPurchase.get(pid) ?? 0) + parseMoney(p.amount)),
        )
      }
    }

    const out: PurchaseListRow[] = list.map((r) => {
      const sup = r.suppliers as { name?: string; tax_id?: string | null } | null
      const id = String(r.id)
      const supplierName =
        sup?.name?.trim() ||
        (r.supplier_name != null ? String(r.supplier_name) : "") ||
        "—"
      return {
        id,
        purchaseKind: String(r.purchase_kind ?? "merchandise") as PurchaseKind,
        status: String(r.status ?? "draft") as PurchaseStatus,
        documentNumber:
          r.document_number != null ? String(r.document_number) : null,
        documentDate:
          r.document_date != null ? String(r.document_date) : null,
        dueDate: r.due_date != null ? String(r.due_date) : null,
        supplierId: r.supplier_id != null ? String(r.supplier_id) : null,
        supplierName,
        supplierTaxId:
          sup?.tax_id != null
            ? String(sup.tax_id)
            : r.supplier_tax_id != null
              ? String(r.supplier_tax_id)
              : null,
        total: parseMoney(r.total),
        currency: String(r.currency ?? "ARS"),
        lineCount: parseLineItems(r.line_items).length,
        paidTotal: paidByPurchase.get(id) ?? 0,
        createdAt: String(r.created_at ?? ""),
        receivedAt: r.received_at != null ? String(r.received_at) : null,
      }
    })

    return { success: true, rows: out }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function createPurchase(
  popId: string,
  input: CreatePurchaseInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const access = await purchasesAccess(popId)
    if (!access.ok) {
      return { success: false, error: access.error }
    }
    if (!access.canCreate) {
      return { success: false, error: "Sin permiso para crear compras." }
    }

    const kind = input.purchaseKind
    if (!["merchandise", "raw_material", "supply"].includes(kind)) {
      return { success: false, error: "Tipo de compra inválido." }
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

    type BuiltLine = {
      articleId: string
      name: string
      qty: number
      unitCost: number
      ivaPct: number
      lineBase: number
    }
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
      built.push({
        articleId,
        name: String(artRow.name ?? "Artículo"),
        qty,
        unitCost,
        ivaPct,
        lineBase: roundMoney(qty * unitCost),
      })
    }
    if (built.length === 0) {
      return { success: false, error: "No hay ítems válidos en la compra." }
    }

    let subtotalNet = 0
    let taxTotal = 0
    const lineItemsJson: Record<string, unknown>[] = []

    for (const l of built) {
      let taxPart = 0
      let netPart = l.lineBase
      if (l.ivaPct > 0) {
        taxPart = roundMoney((l.lineBase * l.ivaPct) / (100 + l.ivaPct))
        netPart = roundMoney(l.lineBase - taxPart)
      }
      subtotalNet = roundMoney(subtotalNet + netPart)
      taxTotal = roundMoney(taxTotal + taxPart)
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

    const confirmPurchase = input.confirmPurchase !== false
    const initialStatus = confirmPurchase ? "pending" : "draft"

    const paymentMethodId = input.paymentMethodId?.trim() || null
    if (confirmPurchase && paymentMethodId) {
      const { data: pmRow, error: pmErr } = await supabase
        .from("payment_methods")
        .select("id")
        .eq("id", paymentMethodId)
        .eq("pop_id", popId)
        .eq("is_active", true)
        .maybeSingle()
      if (pmErr || !pmRow) {
        return { success: false, error: "Medio de pago inválido." }
      }
    }

    const { data: ins, error } = await supabase
      .from("purchases")
      .insert({
        pop_id: popId,
        supplier_id: supplierId,
        supplier_name: supplierName,
        supplier_tax_id: supplierTaxId,
        purchase_kind: kind,
        document_number: input.documentNumber?.trim() || null,
        document_date: input.documentDate?.trim() || null,
        due_date: input.dueDate?.trim() || null,
        line_items: lineItemsJson,
        subtotal: subtotalNet,
        tax_total: taxTotal,
        discount_total: discountTotal,
        total,
        currency: "ARS",
        status: initialStatus,
        notes: input.notes?.trim() || "",
        created_by: user.uid,
      })
      .select("id")
      .maybeSingle()

    if (error || !ins?.id) {
      return {
        success: false,
        error: error?.message || "No se pudo crear la compra.",
      }
    }

    const purchaseId = String(ins.id)
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
        metadata: attachmentName
          ? {
              attachment_name: attachmentName,
            }
          : {},
      })
      if (docErr) {
        return {
          success: false,
          error: docErr.message || "No se pudo registrar el comprobante.",
        }
      }
    }

    if (confirmPurchase && paymentMethodId) {
      const { error: payErr } = await supabase.from("purchase_payments").insert({
        pop_id: popId,
        purchase_id: purchaseId,
        payment_method_id: paymentMethodId,
        amount: total,
        paid_at: new Date().toISOString().slice(0, 10),
        created_by: user.uid,
      })
      if (payErr) {
        return {
          success: false,
          error: payErr.message || "No se pudo registrar el pago.",
        }
      }
    }

    return { success: true, id: purchaseId }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function cancelPurchaseDraft(
  popId: string,
  purchaseId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await purchasesAccess(popId)
    if (!access.ok) {
      return { success: false, error: access.error }
    }
    if (!access.canDelete) {
      return { success: false, error: "Sin permiso para anular compras." }
    }
    const supabase = await createClient()
    const { data: row, error: readErr } = await supabase
      .from("purchases")
      .select("id, status")
      .eq("id", purchaseId.trim())
      .eq("pop_id", popId)
      .maybeSingle()
    if (readErr || !row) {
      return { success: false, error: "Compra no encontrada." }
    }
    if (String(row.status) !== "draft") {
      return {
        success: false,
        error: "Solo se pueden anular compras en borrador.",
      }
    }
    const { error } = await supabase
      .from("purchases")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", purchaseId.trim())
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo anular." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
