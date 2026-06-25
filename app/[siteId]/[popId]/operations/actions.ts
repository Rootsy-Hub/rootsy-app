"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopById, getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { popMenuHref, siteIdFromPopRow } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import {
  DEFAULT_SALE_SITE_ID,
  findSaleInvoiceTypeByArcaCbteTipo,
} from "@/lib/saleInvoiceTypes"
import { saleComprobanteAccruesOutputVat } from "@/lib/saleComprobantePicker"
import { createClient } from "@/utils/supabase/server"

export type OperationSaleLineItem = {
  articleId: string | null
  nameSnapshot: string
  quantity: number
  unitPrice: number
  lineTotal: number
  iva: number
  lineDiscount: number
  comment: string | null
}

export type OperationSalePayment = {
  amount: number
  methodName: string
}

export type OperationSaleArcaInvoice = {
  id: string
  tipoLabel: string
  arcaCbteTipo: number
  arcaRegimen: string
  ptoVta: number
  cbteNro: string
  cbteFch: string
  docTipo: number | null
  docNro: string
  receptorRazonSocial: string
  impTotal: number
  impNeto: number
  impIva: number
  cae: string | null
  caeFchVto: string | null
  status: string
}

export type OperationSaleRow = {
  id: string
  soldAt: string
  status: string
  total: number
  subtotal: number
  taxTotal: number
  discountTotal: number
  clientId: string | null
  customerName: string | null
  customerTaxId: string | null
  invoiceTypeLabel: string | null
  accruesOutputVat: boolean
  arcaInvoice: OperationSaleArcaInvoice | null
  currency: string
  lineItems: OperationSaleLineItem[]
  payments: OperationSalePayment[]
}

export type OperationExpenseLedgerRow = {
  entryId: string
  sourceType: "expense_payment" | "expense_void"
  entryDate: string
  amount: number
  description: string
  methodName: string | null
}

export type OperationPurchaseLineItem = {
  articleId: string | null
  nameSnapshot: string
  quantity: number
  unitCost: number
  lineTotal: number
  iva: number
}

export type OperationPurchasePayment = {
  amount: number
  methodName: string
  paidAt: string
}

export type OperationPurchaseRow = {
  id: string
  operationDate: string
  status: string
  purchaseKind: string
  total: number
  paidTotal: number
  supplierName: string
  documentNumber: string | null
  currency: string
  lineItems: OperationPurchaseLineItem[]
  payments: OperationPurchasePayment[]
}

function parseMoney(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

function parseQty(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 1e6) / 1e6
}

function parseLineItems(raw: unknown): OperationSaleLineItem[] {
  if (!Array.isArray(raw)) return []
  const out: OperationSaleLineItem[] = []
  for (const row of raw) {
    if (!row || typeof row !== "object") continue
    const o = row as Record<string, unknown>
    out.push({
      articleId: o.article_id != null ? String(o.article_id) : null,
      nameSnapshot: String(o.name_snapshot ?? "—"),
      quantity: parseQty(o.quantity),
      unitPrice: parseMoney(o.unit_price),
      lineTotal: parseMoney(o.line_total),
      iva: parseMoney(o.iva),
      lineDiscount: parseMoney(o.line_discount),
      comment:
        typeof o.comment === "string" && o.comment.trim()
          ? o.comment.trim()
          : null,
    })
  }
  return out
}

function parseSaleMetadata(
  metadata: unknown,
  fiscalSiteId: string,
): { invoiceTypeLabel: string | null; accruesOutputVat: boolean } {
  if (metadata == null || typeof metadata !== "object") {
    return { invoiceTypeLabel: null, accruesOutputVat: false }
  }
  const o = metadata as Record<string, unknown>
  const rawLabel = o.invoice_type_label
  const invoiceTypeLabel =
    typeof rawLabel === "string" && rawLabel.trim() ? rawLabel.trim() : null

  if (typeof o.invoice_accrues_output_vat === "boolean") {
    return { invoiceTypeLabel, accruesOutputVat: o.invoice_accrues_output_vat }
  }

  return {
    invoiceTypeLabel,
    accruesOutputVat: saleComprobanteAccruesOutputVat(
      fiscalSiteId,
      invoiceTypeLabel,
    ),
  }
}

function parsePurchaseLineItems(raw: unknown): OperationPurchaseLineItem[] {
  if (!Array.isArray(raw)) return []
  const out: OperationPurchaseLineItem[] = []
  for (const row of raw) {
    if (!row || typeof row !== "object") continue
    const o = row as Record<string, unknown>
    out.push({
      articleId: o.article_id != null ? String(o.article_id) : null,
      nameSnapshot: String(o.name_snapshot ?? "—"),
      quantity: parseQty(o.quantity),
      unitCost: parseMoney(o.unit_cost),
      lineTotal: parseMoney(o.line_total),
      iva: parseMoney(o.iva),
    })
  }
  return out
}

export async function getOperationsSales(popId: string): Promise<
  | {
      success: true
      popName: string
      sales: OperationSaleRow[]
      expenseLedger: OperationExpenseLedgerRow[]
      purchases: OperationPurchaseRow[]
    }
  | {
      success: false
      error: string
      redirect?: string
      sales: OperationSaleRow[]
      expenseLedger: OperationExpenseLedgerRow[]
      purchases: OperationPurchaseRow[]
      popName?: string
    }
> {
  const emptySales: OperationSaleRow[] = []
  const emptyExpenseLedger: OperationExpenseLedgerRow[] = []
  const emptyPurchases: OperationPurchaseRow[] = []
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return {
        success: false,
        error: access.error || "Sin acceso",
        redirect: "/home",
        sales: emptySales,
        expenseLedger: emptyExpenseLedger,
        purchases: emptyPurchases,
        popName: "",
      }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.OPERATIONS_READ.resource,
        POP_PERMS.OPERATIONS_READ.action,
      )
    ) {
      return {
        success: false,
        error: "No tenés permiso para ver operaciones en este punto.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
        sales: emptySales,
        expenseLedger: emptyExpenseLedger,
        purchases: emptyPurchases,
        popName: "",
      }
    }

    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""
    const fiscalSiteId =
      popRes.success && popRes.pop
        ? siteIdFromPopRow(popRes.pop)
        : DEFAULT_SALE_SITE_ID

    const supabase = await createClient()

    const { data: pmRows } = await supabase
      .from("payment_methods")
      .select("id, name")
      .eq("pop_id", popId)
    const methodNameById = new Map<string, string>()
    for (const p of pmRows || []) {
      methodNameById.set(String(p.id), String(p.name ?? ""))
    }

    const { data: saleRows, error: saleErr } = await supabase
      .from("sales")
      .select(
        `
        id,
        sold_at,
        status,
        total,
        subtotal,
        tax_total,
        discount_total,
        client_id,
        customer_name,
        customer_tax_id,
        metadata,
        line_items,
        currency,
        sale_payments (
          amount,
          sort_order,
          payment_method_id
        )
      `,
      )
      .eq("pop_id", popId)
      .order("sold_at", { ascending: false })
      .limit(500)

    if (saleErr) {
      return {
        success: false,
        error: saleErr.message || "No se pudieron cargar las ventas.",
        sales: emptySales,
        expenseLedger: emptyExpenseLedger,
        purchases: emptyPurchases,
        popName,
      }
    }

    const saleIds = (saleRows || []).map((r) => String(r.id))
    const arcaBySaleId = new Map<string, OperationSaleArcaInvoice>()
    if (saleIds.length > 0) {
      const { data: invRows } = await supabase
        .from("invoices_arca")
        .select(
          `
          id,
          sale_id,
          arca_cbte_tipo,
          arca_regimen,
          pto_vta,
          cbte_nro,
          cbte_fch,
          doc_tipo,
          doc_nro,
          receptor_razon_social,
          imp_total,
          imp_neto,
          imp_iva,
          cae,
          cae_fch_vto,
          status
        `,
        )
        .eq("pop_id", popId)
        .in("sale_id", saleIds)
        .order("created_at", { ascending: false })

      for (const row of invRows || []) {
        const sid =
          row.sale_id != null ? String(row.sale_id) : ""
        if (!sid || arcaBySaleId.has(sid)) continue
        const cbteTipo = Number(row.arca_cbte_tipo ?? 0)
        const opt = findSaleInvoiceTypeByArcaCbteTipo(fiscalSiteId, cbteTipo)
        const nro = row.cbte_nro
        arcaBySaleId.set(sid, {
          id: String(row.id),
          tipoLabel: opt?.label ?? `CbteTipo ${cbteTipo}`,
          arcaCbteTipo: cbteTipo,
          arcaRegimen: String(row.arca_regimen ?? "fe_general"),
          ptoVta: Number(row.pto_vta ?? 0),
          cbteNro:
            typeof nro === "bigint" || typeof nro === "number"
              ? String(nro)
              : String(nro ?? ""),
          cbteFch: String(row.cbte_fch ?? ""),
          docTipo: row.doc_tipo != null ? Number(row.doc_tipo) : null,
          docNro: String(row.doc_nro ?? ""),
          receptorRazonSocial: String(row.receptor_razon_social ?? ""),
          impTotal: parseMoney(row.imp_total),
          impNeto: parseMoney(row.imp_neto),
          impIva: parseMoney(row.imp_iva),
          cae: row.cae != null ? String(row.cae) : null,
          caeFchVto:
            row.cae_fch_vto != null ? String(row.cae_fch_vto) : null,
          status: String(row.status ?? ""),
        })
      }
    }

    const sales: OperationSaleRow[] = (saleRows || []).map((row) => {
      const saleId = String(row.id)
      const paymentsRaw = row.sale_payments as
        | Array<{
            amount?: unknown
            sort_order?: unknown
            payment_method_id?: unknown
          }>
        | null
      const payments: OperationSalePayment[] = []
      const payList = Array.isArray(paymentsRaw) ? [...paymentsRaw] : []
      payList.sort(
        (a, b) =>
          Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
      )
      for (const p of payList) {
        const mid = p.payment_method_id != null ? String(p.payment_method_id) : ""
        payments.push({
          amount: parseMoney(p.amount),
          methodName: methodNameById.get(mid) || "—",
        })
      }

      const saleMeta = parseSaleMetadata(row.metadata, fiscalSiteId)
      const rowTotal = parseMoney(row.total)
      const accruesOutputVat = saleMeta.accruesOutputVat

      return {
        id: saleId,
        soldAt: String(row.sold_at ?? ""),
        status: String(row.status ?? ""),
        total: rowTotal,
        subtotal: accruesOutputVat
          ? parseMoney(row.subtotal)
          : rowTotal,
        taxTotal: accruesOutputVat ? parseMoney(row.tax_total) : 0,
        discountTotal: parseMoney(row.discount_total),
        clientId: row.client_id != null ? String(row.client_id) : null,
        customerName: row.customer_name != null ? String(row.customer_name) : null,
        customerTaxId:
          row.customer_tax_id != null ? String(row.customer_tax_id) : null,
        invoiceTypeLabel: saleMeta.invoiceTypeLabel,
        accruesOutputVat,
        arcaInvoice: arcaBySaleId.get(saleId) ?? null,
        currency: String(row.currency ?? "ARS"),
        lineItems: parseLineItems(row.line_items),
        payments,
      }
    })

    const { data: aeRows, error: aeErr } = await supabase
      .from("accounting_entries")
      .select("id, entry_date, description, source_type, source_id, status")
      .eq("pop_id", popId)
      .in("source_type", ["expense_payment", "expense_void"])
      .eq("status", "posted")
      .order("entry_date", { ascending: false })
      .limit(400)

    if (aeErr) {
      return {
        success: false,
        error: aeErr.message || "No se pudieron cargar los asientos de gastos.",
        sales,
        expenseLedger: emptyExpenseLedger,
        purchases: emptyPurchases,
        popName,
      }
    }

    const aeList = aeRows || []
    const payIds = aeList
      .map((r) => (r.source_id != null ? String(r.source_id) : ""))
      .filter((id) => id.length > 0)

    const amountByPaymentId = new Map<string, number>()
    const methodByPaymentId = new Map<string, string>()
    if (payIds.length > 0) {
      const { data: epRows } = await supabase
        .from("expense_payments")
        .select(
          `
          id,
          amount,
          payment_methods ( name )
        `,
        )
        .eq("pop_id", popId)
        .in("id", payIds)
      for (const p of epRows || []) {
        const pid = String(p.id)
        amountByPaymentId.set(pid, parseMoney(p.amount))
        const pm = p.payment_methods as unknown as { name?: string } | null
        methodByPaymentId.set(pid, pm?.name ? String(pm.name) : "—")
      }
    }

    const expenseLedger: OperationExpenseLedgerRow[] = aeList.map((row) => {
      const sid = row.source_id != null ? String(row.source_id) : ""
      const src = String(row.source_type ?? "")
      const amt = amountByPaymentId.get(sid) ?? 0
      return {
        entryId: String(row.id),
        sourceType:
          src === "expense_void" ? "expense_void" : "expense_payment",
        entryDate: String(row.entry_date ?? "").slice(0, 10),
        amount: amt,
        description: String(row.description ?? "").trim() || "—",
        methodName: methodByPaymentId.get(sid) ?? null,
      }
    })

    const { data: purchaseRows, error: purchaseErr } = await supabase
      .from("purchases")
      .select(
        `
        id,
        purchase_kind,
        status,
        document_number,
        document_date,
        supplier_name,
        total,
        currency,
        line_items,
        created_at,
        received_at,
        suppliers ( name ),
        purchase_payments (
          amount,
          paid_at,
          payment_method_id
        )
      `,
      )
      .eq("pop_id", popId)
      .neq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(500)

    if (purchaseErr) {
      return {
        success: false,
        error: purchaseErr.message || "No se pudieron cargar las compras.",
        sales,
        expenseLedger,
        purchases: emptyPurchases,
        popName,
      }
    }

    const purchases: OperationPurchaseRow[] = (purchaseRows || []).map(
      (row) => {
        const sup = row.suppliers as { name?: string } | null
        const supplierName =
          sup?.name?.trim() ||
          (row.supplier_name != null ? String(row.supplier_name) : "") ||
          "—"
        const receivedAt =
          row.received_at != null ? String(row.received_at) : ""
        const documentDate =
          row.document_date != null ? String(row.document_date) : ""
        const createdAt = String(row.created_at ?? "")
        const operationDate =
          receivedAt.slice(0, 10) ||
          documentDate.slice(0, 10) ||
          createdAt.slice(0, 10)

        const paymentsRaw = row.purchase_payments as
          | Array<{
              amount?: unknown
              paid_at?: unknown
              payment_method_id?: unknown
            }>
          | null
        const payments: OperationPurchasePayment[] = []
        const payList = Array.isArray(paymentsRaw) ? [...paymentsRaw] : []
        payList.sort((a, b) =>
          String(a.paid_at ?? "").localeCompare(String(b.paid_at ?? "")),
        )
        let paidTotal = 0
        for (const p of payList) {
          const amt = parseMoney(p.amount)
          paidTotal = Math.round((paidTotal + amt) * 100) / 100
          const mid =
            p.payment_method_id != null ? String(p.payment_method_id) : ""
          payments.push({
            amount: amt,
            methodName: methodNameById.get(mid) || "—",
            paidAt: String(p.paid_at ?? "").slice(0, 10),
          })
        }

        return {
          id: String(row.id),
          operationDate,
          status: String(row.status ?? ""),
          purchaseKind: String(row.purchase_kind ?? "merchandise"),
          total: parseMoney(row.total),
          paidTotal,
          supplierName,
          documentNumber:
            row.document_number != null ? String(row.document_number) : null,
          currency: String(row.currency ?? "ARS"),
          lineItems: parsePurchaseLineItems(row.line_items),
          payments,
        }
      },
    )

    return { success: true, popName, sales, expenseLedger, purchases }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return {
      success: false,
      error: message,
      sales: emptySales,
      expenseLedger: emptyExpenseLedger,
      purchases: emptyPurchases,
      popName: "",
    }
  }
}
