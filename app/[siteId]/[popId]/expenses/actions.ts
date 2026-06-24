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
import { expenseDateBelongsToMonth, monthBoundsISO } from "@/lib/expenseMonth"
import {
  postExpensePaymentLedger,
  postExpenseVoidReversals,
} from "@/lib/expenseAccountingPosting"
import {
  entryDateIsoInTimezone,
  timezoneForPopLedger,
} from "@/lib/entryDateTimezone"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { createClient } from "@/utils/supabase/server"

export type ExpenseCategoryKind = "fijo" | "variable"

export type ExpenseCategoryRow = {
  id: string
  name: string
  kind: ExpenseCategoryKind
  sortOrder: number
  deletedAt: string | null
}

export type ExpenseStatus = "pending" | "partial" | "paid" | "voided"

export type ExpenseListRow = {
  id: string
  amount: number
  currency: string
  expenseDate: string
  dueDate: string | null
  description: string
  status: ExpenseStatus
  voidedAt: string | null
  voidReason: string | null
  categoryId: string
  categoryName: string
  categoryKind: ExpenseCategoryKind
  categoryDeletedAt: string | null
  paidTotal: number
}

export type PaymentMethodOption = {
  id: string
  name: string
}

export type MonthProgress = {
  totalDue: number
  totalPaid: number
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function parseMoney(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return roundMoney(n)
}

export async function getExpensesPageData(popId: string): Promise<
  | {
      success: true
      popName: string
      categories: ExpenseCategoryRow[]
      paymentMethods: PaymentMethodOption[]
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
  | { success: false; error: string; redirect?: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso", redirect: "/home" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    const canRead = permissionKeysInclude(
      snap.keys,
      POP_PERMS.EXPENSES_READ.resource,
      POP_PERMS.EXPENSES_READ.action,
    )
    if (!canRead) {
      return {
        success: false,
        error: "No tenés permiso para ver gastos en este punto de venta.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
      }
    }
    const canCreate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.EXPENSES_CREATE.resource,
      POP_PERMS.EXPENSES_CREATE.action,
    )
    const canUpdate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.EXPENSES_UPDATE.resource,
      POP_PERMS.EXPENSES_UPDATE.action,
    )
    const canDelete = permissionKeysInclude(
      snap.keys,
      POP_PERMS.EXPENSES_DELETE.resource,
      POP_PERMS.EXPENSES_DELETE.action,
    )
    const supabase = await createClient()
    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""
    const { data: catRows, error: catErr } = await supabase
      .from("expense_categories")
      .select("id, name, kind, sort_order, deleted_at")
      .eq("pop_id", popId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
    if (catErr) {
      return { success: false, error: catErr.message || "No se pudieron cargar categorías." }
    }
    const categories: ExpenseCategoryRow[] = (catRows || []).map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
      kind: r.kind === "variable" ? "variable" : "fijo",
      sortOrder: Number(r.sort_order ?? 0),
      deletedAt: r.deleted_at != null ? String(r.deleted_at) : null,
    }))
    const { data: pmRows, error: pmErr } = await supabase
      .from("payment_methods")
      .select("id, name")
      .eq("pop_id", popId)
      .eq("is_active", true)
      .in("usage", ["pay", "both"])
      .order("sort_order", { ascending: true })
    if (pmErr) {
      return { success: false, error: pmErr.message || "No se pudieron cargar medios de pago." }
    }
    const paymentMethods: PaymentMethodOption[] = (pmRows || []).map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
    }))
    return {
      success: true,
      popName,
      categories,
      paymentMethods,
      canCreate,
      canUpdate,
      canDelete,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function listExpensesForMonth(
  popId: string,
  year: number,
  month1: number,
): Promise<
  | { success: true; rows: ExpenseListRow[] }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.EXPENSES_READ.resource,
        POP_PERMS.EXPENSES_READ.action,
      )
    ) {
      return { success: false, error: "Sin permiso." }
    }
    const { start, end } = monthBoundsISO(year, month1)
    const supabase = await createClient()
    const { data: exRows, error: exErr } = await supabase
      .from("expenses")
      .select(
        `
        id,
        amount,
        currency,
        expense_date,
        due_date,
        description,
        status,
        voided_at,
        void_reason,
        category_id,
        expense_categories ( id, name, kind, deleted_at )
      `,
      )
      .eq("pop_id", popId)
      .gte("expense_date", start)
      .lte("expense_date", end)
      .order("expense_date", { ascending: false })
    if (exErr) {
      return { success: false, error: exErr.message || "No se pudieron cargar gastos." }
    }
    const list = exRows || []
    const ids = list.map((e) => String(e.id))
    const paidByExpense = new Map<string, number>()
    if (ids.length > 0) {
      const { data: payRows, error: payErr } = await supabase
        .from("expense_payments")
        .select("expense_id, amount")
        .in("expense_id", ids)
      if (payErr) {
        return { success: false, error: payErr.message || "No se pudieron cargar pagos." }
      }
      for (const p of payRows || []) {
        const eid = String(p.expense_id)
        const a = parseMoney(p.amount)
        paidByExpense.set(eid, (paidByExpense.get(eid) ?? 0) + a)
      }
    }
    const rows: ExpenseListRow[] = list.map((e) => {
      const cat = e.expense_categories as unknown as {
        id?: string
        name?: string
        kind?: string
        deleted_at?: string | null
      } | null
      const id = String(e.id)
      return {
        id,
        amount: parseMoney(e.amount),
        currency: String(e.currency ?? "ARS"),
        expenseDate: String(e.expense_date ?? ""),
        dueDate: e.due_date != null ? String(e.due_date) : null,
        description: String(e.description ?? ""),
        status: String(e.status ?? "pending") as ExpenseStatus,
        voidedAt: e.voided_at != null ? String(e.voided_at) : null,
        voidReason: e.void_reason != null ? String(e.void_reason) : null,
        categoryId: cat?.id != null ? String(cat.id) : String(e.category_id),
        categoryName: cat?.name ? String(cat.name) : "—",
        categoryKind: cat?.kind === "variable" ? "variable" : "fijo",
        categoryDeletedAt:
          cat?.deleted_at != null ? String(cat.deleted_at) : null,
        paidTotal: roundMoney(paidByExpense.get(id) ?? 0),
      }
    })
    return { success: true, rows }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getExpenseMonthProgress(
  popId: string,
  year: number,
  month1: number,
): Promise<
  | { success: true; progress: MonthProgress }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.EXPENSES_READ.resource,
        POP_PERMS.EXPENSES_READ.action,
      )
    ) {
      return { success: false, error: "Sin permiso." }
    }
    const { start, end } = monthBoundsISO(year, month1)
    const supabase = await createClient()
    const { data: exRows, error: exErr } = await supabase
      .from("expenses")
      .select("id, amount")
      .eq("pop_id", popId)
      .gte("expense_date", start)
      .lte("expense_date", end)
      .neq("status", "voided")
    if (exErr) {
      return { success: false, error: exErr.message || "Error al calcular totales." }
    }
    const expenses = exRows || []
    const totalDue = roundMoney(
      expenses.reduce((a, r) => a + parseMoney(r.amount), 0),
    )
    const ids = expenses.map((e) => String(e.id))
    let totalPaid = 0
    if (ids.length > 0) {
      const { data: payRows, error: payErr } = await supabase
        .from("expense_payments")
        .select("amount")
        .in("expense_id", ids)
      if (payErr) {
        return { success: false, error: payErr.message || "Error al calcular pagos." }
      }
      totalPaid = roundMoney(
        (payRows || []).reduce((a, r) => a + parseMoney(r.amount), 0),
      )
    }
    return {
      success: true,
      progress: { totalDue, totalPaid },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export type CreateExpenseInput = {
  categoryId: string
  amount: number
  expenseDate: string
  dueDate: string | null
  description: string
}

export async function createExpense(
  popId: string,
  year: number,
  month1: number,
  input: CreateExpenseInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.EXPENSES_CREATE.resource,
        POP_PERMS.EXPENSES_CREATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para cargar gastos." }
    }
    const amount = roundMoney(input.amount)
    if (!(amount > 0)) {
      return { success: false, error: "El importe debe ser mayor a cero." }
    }
    if (!expenseDateBelongsToMonth(input.expenseDate, year, month1)) {
      return {
        success: false,
        error: "La fecha del gasto debe estar dentro del mes seleccionado.",
      }
    }
    const user = await requireAuthenticatedUser()
    const supabase = await createClient()
    const { data: catOk, error: catErr } = await supabase
      .from("expense_categories")
      .select("id")
      .eq("id", input.categoryId.trim())
      .eq("pop_id", popId)
      .is("deleted_at", null)
      .maybeSingle()
    if (catErr || !catOk) {
      return { success: false, error: "Categoría inválida o eliminada." }
    }
    const { data: ins, error } = await supabase
      .from("expenses")
      .insert({
        pop_id: popId,
        category_id: input.categoryId.trim(),
        amount,
        currency: "ARS",
        expense_date: input.expenseDate.trim(),
        due_date: input.dueDate?.trim() || null,
        description: input.description.trim() || "",
        created_by: user.uid,
      })
      .select("id")
      .maybeSingle()
    if (error || !ins) {
      return { success: false, error: error?.message || "No se pudo crear el gasto." }
    }
    return { success: true, id: String(ins.id) }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function recordExpensePayment(
  popId: string,
  expenseId: string,
  amount: number,
  paidAt: string,
  paymentMethodId: string | null,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.EXPENSES_UPDATE.resource,
        POP_PERMS.EXPENSES_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para registrar pagos." }
    }
    const amt = roundMoney(amount)
    if (!(amt > 0)) {
      return { success: false, error: "El importe del pago debe ser mayor a cero." }
    }
    const user = await requireAuthenticatedUser()
    const supabase = await createClient()
    const { data: payIns, error } = await supabase
      .from("expense_payments")
      .insert({
        pop_id: popId,
        expense_id: expenseId.trim(),
        amount: amt,
        paid_at: paidAt.trim(),
        payment_method_id: paymentMethodId?.trim() || null,
        created_by: user.uid,
      })
      .select("id")
      .maybeSingle()
    if (error || !payIns?.id) {
      return { success: false, error: error?.message || "No se pudo registrar el pago." }
    }
    const paymentId = String(payIns.id)
    const ledger = await postExpensePaymentLedger(supabase, {
      popId,
      userId: user.uid,
      expensePaymentId: paymentId,
    })
    if (!ledger.success) {
      await supabase.from("expense_payments").delete().eq("id", paymentId).eq("pop_id", popId)
      return { success: false, error: ledger.error }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function deleteExpense(
  popId: string,
  expenseId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.EXPENSES_DELETE.resource,
        POP_PERMS.EXPENSES_DELETE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para eliminar gastos." }
    }
    const supabase = await createClient()
    const { count, error: cErr } = await supabase
      .from("expense_payments")
      .select("id", { count: "exact", head: true })
      .eq("expense_id", expenseId.trim())
      .eq("pop_id", popId)
    if (cErr) {
      return { success: false, error: cErr.message || "No se pudo verificar pagos." }
    }
    if ((count ?? 0) > 0) {
      return {
        success: false,
        error: "No se puede eliminar un gasto que ya tiene pagos. Anulalo en su lugar.",
      }
    }
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId.trim())
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo eliminar." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function voidExpense(
  popId: string,
  expenseId: string,
  reason: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.EXPENSES_UPDATE.resource,
        POP_PERMS.EXPENSES_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para anular gastos." }
    }
    const user = await requireAuthenticatedUser()
    const supabase = await createClient()
    const popRes = await getPopById(popId)
    const tz =
      popRes.success && popRes.pop
        ? timezoneForPopLedger(popRes.pop.country, popRes.pop.siteId)
        : "UTC"
    const entryDate = entryDateIsoInTimezone(tz)

    const eid = expenseId.trim()
    const rev = await postExpenseVoidReversals(supabase, {
      popId,
      userId: user.uid,
      expenseId: eid,
      entryDate,
    })
    if (!rev.success) {
      return rev
    }

    const { data: upd, error } = await supabase
      .from("expenses")
      .update({
        status: "voided",
        voided_at: new Date().toISOString(),
        void_reason: reason.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eid)
      .eq("pop_id", popId)
      .neq("status", "voided")
      .select("id")
      .maybeSingle()
    if (error) {
      return { success: false, error: error.message || "No se pudo anular." }
    }
    if (!upd) {
      const { data: st } = await supabase
        .from("expenses")
        .select("status")
        .eq("id", eid)
        .eq("pop_id", popId)
        .maybeSingle()
      if (String(st?.status ?? "") === "voided") {
        return { success: true }
      }
      return { success: false, error: "El gasto no existe o ya estaba anulado." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function deleteExpenseCategory(
  popId: string,
  categoryId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.EXPENSES_UPDATE.resource,
        POP_PERMS.EXPENSES_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para gestionar categorías." }
    }
    const supabase = await createClient()
    const { count, error: cErr } = await supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId.trim())
      .eq("pop_id", popId)
    if (cErr) {
      return { success: false, error: cErr.message || "No se pudo verificar gastos." }
    }
    if ((count ?? 0) > 0) {
      const { error: uErr } = await supabase
        .from("expense_categories")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", categoryId.trim())
        .eq("pop_id", popId)
      if (uErr) {
        return { success: false, error: uErr.message || "No se pudo eliminar la categoría." }
      }
      return { success: true }
    }
    const { error: dErr } = await supabase
      .from("expense_categories")
      .delete()
      .eq("id", categoryId.trim())
      .eq("pop_id", popId)
    if (dErr) {
      return { success: false, error: dErr.message || "No se pudo eliminar la categoría." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function createExpenseCategory(
  popId: string,
  name: string,
  kind: ExpenseCategoryKind,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.EXPENSES_UPDATE.resource,
        POP_PERMS.EXPENSES_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para crear categorías." }
    }
    const n = name.trim()
    if (!n) {
      return { success: false, error: "El nombre es obligatorio." }
    }
    const supabase = await createClient()
    const { error } = await supabase.from("expense_categories").insert({
      pop_id: popId,
      name: n,
      kind,
      sort_order: 1000,
    })
    if (error) {
      return { success: false, error: error.message || "No se pudo crear la categoría." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
