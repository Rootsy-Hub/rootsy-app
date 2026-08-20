import {
  CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS,
  currentAccountNotEnrolledMessage,
  currentAccountOpenAmount,
  type CurrentAccountDirection,
} from "@/lib/currentAccounts"
import { createClient } from "@/utils/supabase/server"

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

export type CurrentAccountCreditTerms = {
  enabled: boolean
  creditLimit: number | null
  termDays: number
}

export function normalizeCurrentAccountTermDays(raw: unknown): number {
  const n = Math.trunc(Number(raw))
  if (!Number.isFinite(n) || n < 1) return CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS
  return Math.min(365, n)
}

export function normalizeCurrentAccountCreditLimit(raw: unknown): number | null {
  if (raw == null || raw === "") return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0.009) return null
  return roundMoney(n)
}

export function currentAccountAvailableCredit(
  creditLimit: number | null,
  balance: number,
): number | null {
  if (creditLimit == null) return null
  return roundMoney(Math.max(0, creditLimit - balance))
}

export function currentAccountCreditExceededMessage(input: {
  direction: CurrentAccountDirection
  limit: number
  balance: number
  addAmount: number
}): string {
  const projected = roundMoney(input.balance + input.addAmount)
  const money = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  })
  const who = input.direction === "payable" ? "Este proveedor" : "Este cliente"
  return `${who} tiene un límite de ${money.format(input.limit)}. Con este comprobante el saldo quedaría en ${money.format(projected)}.`
}

export async function loadPartyCurrentAccountTerms(
  supabase: SupabaseClient,
  input: { direction: CurrentAccountDirection; partyId: string },
): Promise<CurrentAccountCreditTerms> {
  const table = input.direction === "payable" ? "suppliers" : "clients"
  const { data } = await supabase
    .from(table)
    .select(
      "current_account_enabled, current_account_credit_limit, current_account_term_days",
    )
    .eq("id", input.partyId)
    .maybeSingle()
  return {
    enabled: data?.current_account_enabled === true,
    creditLimit: normalizeCurrentAccountCreditLimit(
      data?.current_account_credit_limit,
    ),
    termDays: normalizeCurrentAccountTermDays(data?.current_account_term_days),
  }
}

export async function loadPartyCurrentAccountEnabled(
  supabase: SupabaseClient,
  input: { direction: CurrentAccountDirection; partyId: string },
): Promise<boolean> {
  const terms = await loadPartyCurrentAccountTerms(supabase, input)
  return terms.enabled
}

async function loadAllocatedByDocument(
  supabase: SupabaseClient,
  popId: string,
  kind: "sale" | "purchase",
  documentIds: string[],
): Promise<Map<string, number>> {
  const allocated = new Map<string, number>()
  if (documentIds.length === 0) return allocated
  const paymentTable = kind === "sale" ? "sale_payments" : "purchase_payments"
  const paymentFk = kind === "sale" ? "sale_id" : "purchase_id"
  const { data: payRows } = await supabase
    .from(paymentTable)
    .select(`${paymentFk}, amount`)
    .eq("pop_id", popId)
    .is("reversed_at", null)
    .in(paymentFk, documentIds)
  for (const row of payRows ?? []) {
    const raw = row as Record<string, unknown>
    const id = String(raw[paymentFk] ?? "")
    if (!id) continue
    allocated.set(
      id,
      roundMoney((allocated.get(id) ?? 0) + Number(raw.amount ?? 0)),
    )
  }
  const { data: appRows } = await supabase
    .from("current_account_applications")
    .select("document_id, amount")
    .eq("pop_id", popId)
    .eq("document_kind", kind)
    .in("document_id", documentIds)
  for (const row of appRows ?? []) {
    const id = String(row.document_id ?? "")
    if (!id) continue
    allocated.set(
      id,
      roundMoney((allocated.get(id) ?? 0) + Number(row.amount ?? 0)),
    )
  }
  return allocated
}

export async function loadPartyCurrentAccountBalance(
  supabase: SupabaseClient,
  popId: string,
  direction: CurrentAccountDirection,
  partyId: string,
): Promise<number> {
  const kind = direction === "payable" ? "purchase" : "sale"
  const docs =
    kind === "sale"
      ? await supabase
          .from("sales")
          .select("id, total, on_account, status")
          .eq("pop_id", popId)
          .eq("client_id", partyId)
          .neq("status", "cancelled")
      : await supabase
          .from("purchases")
          .select("id, total, on_account, status")
          .eq("pop_id", popId)
          .eq("supplier_id", partyId)
          .neq("status", "voided")
  const rows = docs.data ?? []
  const ids = rows.map((row) => String(row.id))
  const allocated = await loadAllocatedByDocument(supabase, popId, kind, ids)
  let remaining = 0
  for (const row of rows) {
    const id = String(row.id)
    const total = Number(row.total ?? 0) || 0
    const open = currentAccountOpenAmount(total, allocated.get(id) ?? 0)
    const onAccount = Boolean(row.on_account)
    if (!onAccount && open <= 0.009) continue
    if (open > 0.009) remaining = roundMoney(remaining + open)
  }

  const receipts =
    direction === "receivable"
      ? await supabase
          .from("current_account_receipts")
          .select("id, amount")
          .eq("pop_id", popId)
          .eq("direction", "receivable")
          .eq("client_id", partyId)
      : await supabase
          .from("current_account_receipts")
          .select("id, amount")
          .eq("pop_id", popId)
          .eq("direction", "payable")
          .eq("supplier_id", partyId)
  const receiptRows = receipts.data ?? []
  let unapplied = 0
  if (receiptRows.length > 0) {
    const receiptIds = receiptRows.map((row) => String(row.id))
    const { data: appRows } = await supabase
      .from("current_account_applications")
      .select("receipt_id, amount")
      .eq("pop_id", popId)
      .in("receipt_id", receiptIds)
    const applied = new Map<string, number>()
    for (const row of appRows ?? []) {
      const id = String(row.receipt_id ?? "")
      applied.set(
        id,
        roundMoney((applied.get(id) ?? 0) + Number(row.amount ?? 0)),
      )
    }
    for (const row of receiptRows) {
      const leftover = currentAccountOpenAmount(
        Number(row.amount ?? 0) || 0,
        applied.get(String(row.id)) ?? 0,
      )
      if (leftover > 0.009) unapplied = roundMoney(unapplied + leftover)
    }
  }
  return roundMoney(remaining - unapplied)
}

export async function assertPartyCurrentAccountCredit(
  supabase: SupabaseClient,
  popId: string,
  input: {
    direction: CurrentAccountDirection
    partyId: string
    addAmount: number
  },
): Promise<
  | {
      ok: true
      termDays: number
      creditLimit: number | null
      balance: number
    }
  | { ok: false; error: string }
> {
  const terms = await loadPartyCurrentAccountTerms(supabase, {
    direction: input.direction,
    partyId: input.partyId,
  })
  if (!terms.enabled) {
    return {
      ok: false,
      error: currentAccountNotEnrolledMessage(input.direction),
    }
  }
  const balance = await loadPartyCurrentAccountBalance(
    supabase,
    popId,
    input.direction,
    input.partyId,
  )
  if (terms.creditLimit != null) {
    const projected = roundMoney(balance + input.addAmount)
    if (projected > terms.creditLimit + 0.009) {
      return {
        ok: false,
        error: currentAccountCreditExceededMessage({
          direction: input.direction,
          limit: terms.creditLimit,
          balance,
          addAmount: input.addAmount,
        }),
      }
    }
  }
  return {
    ok: true,
    termDays: terms.termDays,
    creditLimit: terms.creditLimit,
    balance,
  }
}
