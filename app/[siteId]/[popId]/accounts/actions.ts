"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopById, getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { monthBoundsISO } from "@/lib/expenseMonth"
import { createTreasuryChartSubaccount } from "@/lib/treasuryChartSubaccount"
import {
  type TreasuryAccountKind,
} from "@/lib/treasuryAccountKinds"
import { listPaymentMethodIdsForTreasuryAccount } from "@/lib/treasuryAccountResolve"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { createClient } from "@/utils/supabase/server"
import type { PaymentsHubSummary } from "@/app/[siteId]/[popId]/payment-methods/actions"

export type TreasuryAccountTableRow = {
  id: string
  name: string
  kind: TreasuryAccountKind
  isSystemDefault: boolean
  isActive: boolean
  sortOrder: number
  accountingAccountId: string
  accountingAccountLabel: string
  chartAccountCode: string
  receivedMonthTotal: number
  paidOutMonthTotal: number
  outstandingBalance: number
  settledTotal: number
  ledgerBalance: number | null
  isCardPayable: boolean
}

export type UpsertTreasuryAccountInput = {
  name: string
  kind: TreasuryAccountKind
  sortOrder: number
}

export type TreasuryFundingOption = {
  id: string
  name: string
  kind: TreasuryAccountKind
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function parseAmount(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? roundMoney(n) : 0
}

function monthLabelEs(year: number, month1: number): string {
  const d = new Date(year, month1 - 1, 1)
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(d)
}

function parseTreasuryKind(v: unknown): TreasuryAccountKind {
  const k = String(v ?? "other")
  if (k === "cash" || k === "bank" || k === "wallet" || k === "card_payable") {
    return k
  }
  return "other"
}

async function computeMonthTotalsByTreasuryAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  year: number,
  month1: number,
): Promise<Map<string, { received: number; paidOut: number }>> {
  const totals = new Map<string, { received: number; paidOut: number }>()
  const { start, end } = monthBoundsISO(year, month1)
  const soldAtEnd = `${end}T23:59:59.999`

  const { data: pmRows } = await supabase
    .from("payment_methods")
    .select("id, treasury_account_id")
    .eq("pop_id", popId)
    .not("treasury_account_id", "is", null)

  const pmToTa = new Map<string, string>()
  for (const pm of pmRows || []) {
    if (pm.treasury_account_id) {
      pmToTa.set(String(pm.id), String(pm.treasury_account_id))
    }
  }

  const bump = (taId: string, field: "received" | "paidOut", amount: number) => {
    if (!taId || amount <= 0) return
    const prev = totals.get(taId) ?? { received: 0, paidOut: 0 }
    prev[field] = roundMoney(prev[field] + amount)
    totals.set(taId, prev)
  }

  const { data: saleRows } = await supabase
    .from("sales")
    .select("id")
    .eq("pop_id", popId)
    .eq("status", "completed")
    .gte("sold_at", start)
    .lte("sold_at", soldAtEnd)
  const saleIds = (saleRows || []).map((r) => String(r.id))
  if (saleIds.length > 0) {
    const { data: spRows } = await supabase
      .from("sale_payments")
      .select("payment_method_id, amount")
      .eq("pop_id", popId)
      .in("sale_id", saleIds)
    for (const row of spRows || []) {
      const taId = pmToTa.get(String(row.payment_method_id))
      if (taId) bump(taId, "received", parseAmount(row.amount))
    }
  }

  const { data: purchasePayRows } = await supabase
    .from("purchase_payments")
    .select("payment_method_id, amount")
    .eq("pop_id", popId)
    .gte("paid_at", start)
    .lte("paid_at", end)
  for (const row of purchasePayRows || []) {
    if (row.payment_method_id == null) continue
    const taId = pmToTa.get(String(row.payment_method_id))
    if (taId) bump(taId, "paidOut", parseAmount(row.amount))
  }

  const { data: expensePayRows } = await supabase
    .from("expense_payments")
    .select("payment_method_id, amount")
    .eq("pop_id", popId)
    .gte("paid_at", start)
    .lte("paid_at", end)
  for (const row of expensePayRows || []) {
    if (row.payment_method_id == null) continue
    const taId = pmToTa.get(String(row.payment_method_id))
    if (taId) bump(taId, "paidOut", parseAmount(row.amount))
  }

  return totals
}

async function computeLifetimePaidOutByTreasuryAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<Map<string, number>> {
  const totals = new Map<string, number>()
  const { data: pmRows } = await supabase
    .from("payment_methods")
    .select("id, treasury_account_id")
    .eq("pop_id", popId)
    .not("treasury_account_id", "is", null)
  const pmToTa = new Map<string, string>()
  for (const pm of pmRows || []) {
    if (pm.treasury_account_id) {
      pmToTa.set(String(pm.id), String(pm.treasury_account_id))
    }
  }
  const bump = (taId: string, amount: number) => {
    if (!taId || amount <= 0) return
    totals.set(taId, roundMoney((totals.get(taId) ?? 0) + amount))
  }
  for (const table of ["purchase_payments", "expense_payments"] as const) {
    const { data } = await supabase
      .from(table)
      .select("payment_method_id, amount")
      .eq("pop_id", popId)
    for (const row of data || []) {
      if (row.payment_method_id == null) continue
      const taId = pmToTa.get(String(row.payment_method_id))
      if (taId) bump(taId, parseAmount(row.amount))
    }
  }
  return totals
}

async function computeSettlementsByTreasuryAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<Map<string, number>> {
  const totals = new Map<string, number>()
  const { data } = await supabase
    .from("treasury_settlements")
    .select("card_treasury_account_id, card_payment_method_id, amount")
    .eq("pop_id", popId)
  for (const row of data || []) {
    const taId =
      row.card_treasury_account_id != null
        ? String(row.card_treasury_account_id)
        : ""
    if (!taId) continue
    totals.set(taId, roundMoney((totals.get(taId) ?? 0) + parseAmount(row.amount)))
  }
  return totals
}

async function computeLedgerBalancesByAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  accountIds: string[],
): Promise<Map<string, number>> {
  const balances = new Map<string, number>()
  if (accountIds.length === 0) return balances
  const { data: accRows } = await supabase
    .from("accounting_chart_of_accounts")
    .select("id, nature")
    .eq("pop_id", popId)
    .in("id", accountIds)
  const natureById = new Map<string, string>()
  for (const a of accRows || []) {
    natureById.set(String(a.id), String(a.nature ?? "deudora"))
  }
  const { data: entryRows } = await supabase
    .from("accounting_entries")
    .select("id")
    .eq("pop_id", popId)
    .eq("status", "posted")
  const entryIds = (entryRows || []).map((r) => String(r.id))
  if (entryIds.length === 0) {
    for (const id of accountIds) balances.set(id, 0)
    return balances
  }
  const { data: lineRows } = await supabase
    .from("accounting_entry_lines")
    .select("account_id, debit_amount, credit_amount")
    .in("account_id", accountIds)
    .in("entry_id", entryIds)
  for (const id of accountIds) balances.set(id, 0)
  for (const ln of lineRows || []) {
    const aid = String(ln.account_id)
    const d = parseAmount(ln.debit_amount)
    const c = parseAmount(ln.credit_amount)
    const nature = natureById.get(aid) ?? "deudora"
    const prev = balances.get(aid) ?? 0
    const delta = nature === "acreedora" ? c - d : d - c
    balances.set(aid, roundMoney(prev + delta))
  }
  return balances
}

export async function getTreasuryAccountsHub(
  popId: string,
  year: number,
  month1: number,
): Promise<
  | {
      success: true
      rows: TreasuryAccountTableRow[]
      summary: PaymentsHubSummary
      fundingAccounts: TreasuryFundingOption[]
      popName: string
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
      canSettle: boolean
    }
  | {
      success: false
      error: string
      redirect?: string
      rows: TreasuryAccountTableRow[]
      summary: PaymentsHubSummary
      fundingAccounts: TreasuryFundingOption[]
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
      canSettle: boolean
      popName?: string
    }
> {
  const now = new Date()
  const y = Number.isFinite(year) && year >= 2000 ? Math.trunc(year) : now.getFullYear()
  const m =
    Number.isFinite(month1) && month1 >= 1 && month1 <= 12
      ? Math.trunc(month1)
      : now.getMonth() + 1

  const emptySummary: PaymentsHubSummary = {
    year: y,
    month: m,
    monthLabel: monthLabelEs(y, m),
    receivedMonthTotal: 0,
    paidOutMonthTotal: 0,
    netMonthTotal: 0,
  }
  const empty = {
    rows: [] as TreasuryAccountTableRow[],
    summary: emptySummary,
    fundingAccounts: [] as TreasuryFundingOption[],
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canSettle: false,
  }

  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso", redirect: "/home", ...empty }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.PAYMENT_METHOD_READ.resource,
        POP_PERMS.PAYMENT_METHOD_READ.action,
      )
    ) {
      return {
        success: false,
        error: "No tenés permiso para ver cuentas de tesorería.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
        ...empty,
      }
    }
    const canCreate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_CREATE.resource,
      POP_PERMS.PAYMENT_METHOD_CREATE.action,
    )
    const canUpdate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_UPDATE.resource,
      POP_PERMS.PAYMENT_METHOD_UPDATE.action,
    )
    const canDelete = permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_DELETE.resource,
      POP_PERMS.PAYMENT_METHOD_DELETE.action,
    )

    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("treasury_accounts")
      .select(
        `
        id,
        name,
        kind,
        is_system_default,
        is_active,
        sort_order,
        accounting_chart_account_id,
        accounting_chart_of_accounts (
          code,
          name
        )
      `,
      )
      .eq("pop_id", popId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      return {
        success: false,
        error: error.message || "No se pudieron cargar las cuentas.",
        ...empty,
        popName,
        canCreate,
        canUpdate,
        canDelete,
        canSettle: canUpdate,
      }
    }

    const monthTotals = await computeMonthTotalsByTreasuryAccount(supabase, popId, y, m)
    const lifetimePaid = await computeLifetimePaidOutByTreasuryAccount(supabase, popId)
    const settlementsByTa = await computeSettlementsByTreasuryAccount(supabase, popId)

    const accountIds = (data || []).map((r) =>
      String(r.accounting_chart_account_id),
    )
    const ledgerBalances = await computeLedgerBalancesByAccount(
      supabase,
      popId,
      accountIds,
    )

    let receivedMonthTotal = 0
    let paidOutMonthTotal = 0

    const rows: TreasuryAccountTableRow[] = (data || []).map((r) => {
      const id = String(r.id)
      const kind = parseTreasuryKind(r.kind)
      const chart = r.accounting_chart_of_accounts as unknown as {
        code?: string
        name?: string
      } | null
      const chartId = String(r.accounting_chart_account_id)
      const mt = monthTotals.get(id) ?? { received: 0, paidOut: 0 }
      receivedMonthTotal += mt.received
      paidOutMonthTotal += mt.paidOut
      const charged = lifetimePaid.get(id) ?? 0
      const settled = settlementsByTa.get(id) ?? 0
      const isCardPayable = kind === "card_payable"
      return {
        id,
        name: String(r.name ?? ""),
        kind,
        isSystemDefault: Boolean(r.is_system_default),
        isActive: Boolean(r.is_active),
        sortOrder: Number(r.sort_order ?? 0),
        accountingAccountId: chartId,
        accountingAccountLabel: chart
          ? `${chart.code ?? ""} ${chart.name ?? ""}`.trim()
          : "",
        chartAccountCode: String(chart?.code ?? ""),
        receivedMonthTotal: mt.received,
        paidOutMonthTotal: mt.paidOut,
        outstandingBalance: isCardPayable
          ? roundMoney(charged - settled)
          : 0,
        settledTotal: settled,
        ledgerBalance: ledgerBalances.get(chartId) ?? null,
        isCardPayable,
      }
    })

    const fundingAccounts: TreasuryFundingOption[] = rows
      .filter((r) => r.isActive && !r.isCardPayable)
      .map((r) => ({ id: r.id, name: r.name, kind: r.kind }))

    return {
      success: true,
      rows,
      summary: {
        year: y,
        month: m,
        monthLabel: monthLabelEs(y, m),
        receivedMonthTotal: roundMoney(receivedMonthTotal),
        paidOutMonthTotal: roundMoney(paidOutMonthTotal),
        netMonthTotal: roundMoney(receivedMonthTotal - paidOutMonthTotal),
      },
      fundingAccounts,
      popName,
      canCreate,
      canUpdate,
      canDelete,
      canSettle: canUpdate,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message, ...empty, popName: "" }
  }
}

export async function createTreasuryAccount(
  popId: string,
  input: UpsertTreasuryAccountInput,
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
        POP_PERMS.PAYMENT_METHOD_CREATE.resource,
        POP_PERMS.PAYMENT_METHOD_CREATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para crear cuentas." }
    }
    const name = input.name.trim()
    if (!name) return { success: false, error: "El nombre es obligatorio." }
    const kind = input.kind
    const sortOrder = Number(input.sortOrder)
    if (!Number.isFinite(sortOrder)) {
      return { success: false, error: "Orden inválido." }
    }

    const supabase = await createClient()
    const chart = await createTreasuryChartSubaccount(
      supabase,
      popId,
      kind,
      name,
    )
    if ("error" in chart) {
      return { success: false, error: chart.error }
    }

    const { error } = await supabase.from("treasury_accounts").insert({
      pop_id: popId,
      name,
      kind,
      accounting_chart_account_id: chart.id,
      is_system_default: false,
      is_active: true,
      sort_order: Math.trunc(sortOrder),
    })
    if (error) {
      return { success: false, error: error.message || "No se pudo crear." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function updateTreasuryAccount(
  popId: string,
  rowId: string,
  input: UpsertTreasuryAccountInput,
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
        POP_PERMS.PAYMENT_METHOD_UPDATE.resource,
        POP_PERMS.PAYMENT_METHOD_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para editar cuentas." }
    }
    const name = input.name.trim()
    if (!name) return { success: false, error: "El nombre es obligatorio." }
    const sortOrder = Number(input.sortOrder)
    if (!Number.isFinite(sortOrder)) {
      return { success: false, error: "Orden inválido." }
    }

    const supabase = await createClient()
    const { data: existing } = await supabase
      .from("treasury_accounts")
      .select("id, accounting_chart_account_id, is_system_default, kind")
      .eq("id", rowId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (!existing?.id) {
      return { success: false, error: "Cuenta no encontrada." }
    }

    const { error: taErr } = await supabase
      .from("treasury_accounts")
      .update({
        name,
        sort_order: Math.trunc(sortOrder),
      })
      .eq("id", rowId)
      .eq("pop_id", popId)
    if (taErr) {
      return { success: false, error: taErr.message || "No se pudo guardar." }
    }

    await supabase
      .from("accounting_chart_of_accounts")
      .update({ name })
      .eq("id", String(existing.accounting_chart_account_id))
      .eq("pop_id", popId)

    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function deleteTreasuryAccount(
  popId: string,
  rowId: string,
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
        POP_PERMS.PAYMENT_METHOD_DELETE.resource,
        POP_PERMS.PAYMENT_METHOD_DELETE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para eliminar cuentas." }
    }

    const supabase = await createClient()
    const { data: row } = await supabase
      .from("treasury_accounts")
      .select("is_system_default")
      .eq("id", rowId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (!row) return { success: false, error: "Cuenta no encontrada." }
    if (row.is_system_default) {
      return {
        success: false,
        error: "No podés eliminar una cuenta predeterminada del sistema.",
      }
    }

    const pmIds = await listPaymentMethodIdsForTreasuryAccount(
      supabase,
      popId,
      rowId,
    )
    if (pmIds.length > 0) {
      return {
        success: false,
        error:
          "Hay formas de pago vinculadas a esta cuenta. Reasignalas antes de eliminar.",
      }
    }

    const { error } = await supabase
      .from("treasury_accounts")
      .delete()
      .eq("id", rowId)
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
