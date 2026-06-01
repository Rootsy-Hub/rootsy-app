"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopById, getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
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

export type OperationSaleRow = {
  id: string
  soldAt: string
  status: string
  total: number
  subtotal: number
  taxTotal: number
  discountTotal: number
  customerName: string | null
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

export async function getOperationsSales(popId: string): Promise<
  | {
      success: true
      popName: string
      sales: OperationSaleRow[]
      expenseLedger: OperationExpenseLedgerRow[]
    }
  | {
      success: false
      error: string
      redirect?: string
      sales: OperationSaleRow[]
      expenseLedger: OperationExpenseLedgerRow[]
      popName?: string
    }
> {
  const emptySales: OperationSaleRow[] = []
  const emptyExpenseLedger: OperationExpenseLedgerRow[] = []
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return {
        success: false,
        error: access.error || "Sin acceso",
        redirect: "/home",
        sales: emptySales,
        expenseLedger: emptyExpenseLedger,
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
        popName: "",
      }
    }

    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""

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
        customer_name,
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
        popName,
      }
    }

    const sales: OperationSaleRow[] = (saleRows || []).map((row) => {
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

      return {
        id: String(row.id),
        soldAt: String(row.sold_at ?? ""),
        status: String(row.status ?? ""),
        total: parseMoney(row.total),
        subtotal: parseMoney(row.subtotal),
        taxTotal: parseMoney(row.tax_total),
        discountTotal: parseMoney(row.discount_total),
        customerName: row.customer_name != null ? String(row.customer_name) : null,
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

    return { success: true, popName, sales, expenseLedger }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return {
      success: false,
      error: message,
      sales: emptySales,
      expenseLedger: emptyExpenseLedger,
      popName: "",
    }
  }
}
