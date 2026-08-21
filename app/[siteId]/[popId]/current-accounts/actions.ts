"use server"

import {
  CURRENT_ACCOUNT_TABLE_PAGE_SIZES,
  CURRENT_ACCOUNT_TABLE_SORT_KEYS,
  DEFAULT_CURRENT_ACCOUNT_TABLE_PAGE_SIZE,
  type CurrentAccountTableSortKey,
} from "@/app/[siteId]/[popId]/current-accounts/workspaceUrl"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import {
  assertCashSessionStillOpen,
  resolveOpenCashSession,
} from "@/lib/cashRegisterSession"
import {
  checkoutCheckDirection,
  deleteCheckoutCheck,
  insertCheckoutCheck,
  parseCheckoutCheckDetails,
  resolveCheckTreasuryAccountId,
} from "@/lib/checkoutCheck"
import {
  cancelCurrentAccountAccountingEntry,
  postCurrentAccountReceiptLedger,
} from "@/lib/currentAccountAccountingPosting"
import {
  addCurrentAccountAgingAmount,
  CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS,
  currentAccountAgingBucket,
  currentAccountDaysOverdue,
  currentAccountDocumentKindForDirection,
  currentAccountDocumentLabel,
  currentAccountIsOpen,
  currentAccountOpenAmount,
  emptyCurrentAccountAgingTotals,
  isCurrentAccountAgingFilter,
  isCurrentAccountDirection,
  type CurrentAccountAgingBucket,
  type CurrentAccountAgingFilter,
  type CurrentAccountAgingTotals,
  type CurrentAccountDirection,
  type CurrentAccountDocumentKind,
} from "@/lib/currentAccounts"
import {
  isValidOperationPaymentKind,
  operationPaymentKindLabel,
} from "@/lib/operationPaymentKinds"
import {
  currentAccountAvailableCredit,
  normalizeCurrentAccountCreditLimit,
  normalizeCurrentAccountTermDays,
} from "@/lib/currentAccountEnrollment"
import { getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { popMenuHref } from "@/lib/popRoutes"
import { isCalendarDateOnly, toPopCalendarDate } from "@/lib/popTimezone"
import { loadPopLedgerTimeZone } from "@/lib/popTimezoneServer"
import { createClient } from "@/utils/supabase/server"

export type CurrentAccountPartyRow = {
  partyId: string
  partyName: string
  enrolled: boolean
  openCount: number
  overdueAmount: number
  aging: CurrentAccountAgingTotals
  balance: number
  unappliedCredit: number
  creditLimit: number | null
  termDays: number
}

export type CurrentAccountLedgerLine = {
  id: string
  date: string
  occurredAt: string | null
  documentLabel: string
  description: string
  paymentKindLabel: string | null
  debit: number
  credit: number
  balance: number
}

export type CurrentAccountOpenDocument = {
  id: string
  date: string
  occurredAt: string | null
  dueDate: string
  documentLabel: string
  remaining: number
  daysOverdue: number
  agingBucket: CurrentAccountAgingBucket
}

export type SettleCurrentAccountApplicationInput = {
  documentId: string
  amount: number
}

export type SettleCurrentAccountInput = {
  direction: CurrentAccountDirection
  partyId: string
  paidAt: string
  paymentKind: string
  treasuryAccountId: string
  checkDetails?: unknown
  applications: SettleCurrentAccountApplicationInput[]
  extraAmount?: number
  notes?: string
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function emptyParties() {
  return {
    parties: [] as CurrentAccountPartyRow[],
    totalCount: 0,
    page: 1,
    canCreate: false,
  }
}

async function requireCurrentAccountAccess(popId: string) {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return {
      ok: false as const,
      error: access.error || "Sin acceso",
      redirect: "/home",
    }
  }
  const snap = await loadPopPermissionsSnapshot(popId)
  const canRead = permissionKeysInclude(
    snap.keys,
    POP_PERMS.CURRENT_ACCOUNT_READ.resource,
    POP_PERMS.CURRENT_ACCOUNT_READ.action,
  )
  if (!canRead) {
    return {
      ok: false as const,
      error: "No tenés permiso para ver cuentas corrientes.",
      redirect: popMenuHref(await getPopSiteId(popId), popId),
    }
  }
  const canCreate = permissionKeysInclude(
    snap.keys,
    POP_PERMS.CURRENT_ACCOUNT_CREATE.resource,
    POP_PERMS.CURRENT_ACCOUNT_CREATE.action,
  )
  return { ok: true as const, canCreate }
}

async function requireCurrentAccountWrite(popId: string) {
  const access = await requireCurrentAccountAccess(popId)
  if (!access.ok) return access
  if (!access.canCreate) {
    return {
      ok: false as const,
      error: "No tenés permiso para cobrar o pagar en cuenta corriente.",
      redirect: popMenuHref(await getPopSiteId(popId), popId),
    }
  }
  return access
}

async function loadAllocatedByDocument(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  kind: CurrentAccountDocumentKind,
  documentIds: string[],
): Promise<Map<string, number>> {
  const allocated = new Map<string, number>()
  if (documentIds.length === 0) return allocated

  const paymentTable =
    kind === "sale" ? "sale_payments" : "purchase_payments"
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

type DocumentOpenItem = {
  id: string
  partyId: string
  partyName: string
  total: number
  remaining: number
  dueDate: string
  date: string
  occurredAt: string | null
  documentNumber: string
  includedInLedger: boolean
}

function ledgerOccurredAt(raw: unknown): string | null {
  const value = String(raw ?? "").trim()
  if (!value || isCalendarDateOnly(value)) return null
  const ms = Date.parse(value)
  if (!Number.isFinite(ms)) return null
  return new Date(ms).toISOString()
}

function compareLedgerWhen(
  a: { date: string; occurredAt: string | null; id: string },
  b: { date: string; occurredAt: string | null; id: string },
): number {
  const byDate = a.date.localeCompare(b.date)
  if (byDate !== 0) return byDate
  const timeA = a.occurredAt ?? ""
  const timeB = b.occurredAt ?? ""
  if (timeA && timeB) {
    const byTime = timeA.localeCompare(timeB)
    if (byTime !== 0) return byTime
  } else if (timeA) {
    return 1
  } else if (timeB) {
    return -1
  }
  return a.id.localeCompare(b.id)
}

async function loadOpenDocuments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  direction: CurrentAccountDirection,
  timeZone: string,
  partyId?: string,
): Promise<DocumentOpenItem[]> {
  const kind = currentAccountDocumentKindForDirection(direction)

  if (kind === "sale") {
    let query = supabase
      .from("sales")
      .select(
        "id, client_id, customer_name, total, sold_at, due_date, on_account, status, clients!client_id ( name )",
      )
      .eq("pop_id", popId)
      .not("client_id", "is", null)
      .neq("status", "cancelled")
    if (partyId) query = query.eq("client_id", partyId)
    const { data } = await query
    const rows = data ?? []
    const ids = rows.map((row) => String(row.id))
    const allocated = await loadAllocatedByDocument(supabase, popId, "sale", ids)
    return rows.flatMap((row) => {
      const id = String(row.id)
      const total = Number(row.total ?? 0) || 0
      const remaining = currentAccountOpenAmount(total, allocated.get(id) ?? 0)
      const onAccount = Boolean(row.on_account)
      if (!onAccount && !currentAccountIsOpen(total, allocated.get(id) ?? 0)) {
        return []
      }
      const clients = row.clients as { name?: string } | { name?: string }[] | null
      const clientName = Array.isArray(clients) ? clients[0]?.name : clients?.name
      const date = toPopCalendarDate(String(row.sold_at ?? ""), timeZone)
      const rawDue = String(row.due_date ?? "").slice(0, 10)
      const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDue) ? rawDue : date
      return [
        {
          id,
          partyId: String(row.client_id),
          partyName: String(clientName || row.customer_name || "").trim() || "Cliente",
          total,
          remaining,
          dueDate,
          date,
          occurredAt: ledgerOccurredAt(row.sold_at),
          documentNumber: "",
          includedInLedger: true,
        },
      ]
    })
  }

  let query = supabase
    .from("purchases")
    .select(
      "id, supplier_id, supplier_name, total, document_number, document_date, due_date, created_at, on_account, status, suppliers!supplier_id ( name )",
    )
    .eq("pop_id", popId)
    .not("supplier_id", "is", null)
    .neq("status", "voided")
  if (partyId) query = query.eq("supplier_id", partyId)
  const { data } = await query
  const rows = data ?? []
  const ids = rows.map((row) => String(row.id))
  const allocated = await loadAllocatedByDocument(
    supabase,
    popId,
    "purchase",
    ids,
  )
  return rows.flatMap((row) => {
    const id = String(row.id)
    const total = Number(row.total ?? 0) || 0
    const remaining = currentAccountOpenAmount(total, allocated.get(id) ?? 0)
    const onAccount = Boolean(row.on_account)
    if (!onAccount && !currentAccountIsOpen(total, allocated.get(id) ?? 0)) {
      return []
    }
    const suppliers = row.suppliers as
      | { name?: string }
      | { name?: string }[]
      | null
    const supplierName = Array.isArray(suppliers)
      ? suppliers[0]?.name
      : suppliers?.name
    const date = toPopCalendarDate(
      String(row.document_date || row.created_at || ""),
      timeZone,
    )
    const dueDate = toPopCalendarDate(
      String(row.due_date || row.document_date || row.created_at || ""),
      timeZone,
    )
    return [
      {
        id,
        partyId: String(row.supplier_id),
        partyName:
          String(supplierName || row.supplier_name || "").trim() || "Proveedor",
        total,
        remaining,
        dueDate,
        date,
        occurredAt: ledgerOccurredAt(row.created_at),
        documentNumber: String(row.document_number ?? "").trim(),
        includedInLedger: true,
      },
    ]
  })
}

async function loadUnappliedByParty(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  direction: CurrentAccountDirection,
  partyId?: string,
): Promise<Map<string, number>> {
  let query =
    direction === "receivable"
      ? supabase
          .from("current_account_receipts")
          .select("id, amount, client_id")
          .eq("pop_id", popId)
          .eq("direction", "receivable")
      : supabase
          .from("current_account_receipts")
          .select("id, amount, supplier_id")
          .eq("pop_id", popId)
          .eq("direction", "payable")
  if (partyId) {
    query =
      direction === "receivable"
        ? query.eq("client_id", partyId)
        : query.eq("supplier_id", partyId)
  }
  const { data: receipts } = await query
  const unapplied = new Map<string, number>()
  if (!receipts?.length) return unapplied

  const receiptIds = receipts.map((row) => String(row.id))
  const { data: appRows } = await supabase
    .from("current_account_applications")
    .select("receipt_id, amount")
    .eq("pop_id", popId)
    .in("receipt_id", receiptIds)
  const applied = new Map<string, number>()
  for (const row of appRows ?? []) {
    const id = String(row.receipt_id ?? "")
    applied.set(id, roundMoney((applied.get(id) ?? 0) + Number(row.amount ?? 0)))
  }

  for (const row of receipts) {
    const raw = row as Record<string, unknown>
    const party = String(
      direction === "receivable" ? raw.client_id : raw.supplier_id,
    )
    if (!party) continue
    const leftover = currentAccountOpenAmount(
      Number(raw.amount ?? 0) || 0,
      applied.get(String(raw.id)) ?? 0,
    )
    if (leftover <= 0.009) continue
    unapplied.set(party, roundMoney((unapplied.get(party) ?? 0) + leftover))
  }
  return unapplied
}

function treasuryAccountNameFromRel(raw: unknown): string {
  if (raw == null) return ""
  const row = Array.isArray(raw) ? raw[0] : raw
  if (row == null || typeof row !== "object") return ""
  return String((row as { name?: unknown }).name ?? "").trim()
}

function currentAccountPaymentDescription(
  paymentKind: string,
  treasuryName: string,
  notes?: string,
): string {
  const kindLabel = operationPaymentKindLabel(paymentKind)
  const account = treasuryName.trim()
  const base =
    kindLabel && account ? `${kindLabel} · ${account}` : kindLabel || account
  const extra = notes?.trim() ?? ""
  if (
    extra &&
    extra !== base &&
    extra !== kindLabel &&
    extra !== account
  ) {
    return `${base} · ${extra}`
  }
  return base || "—"
}

function emptyPartyRow(
  partyId: string,
  partyName: string,
  enrolled = false,
): CurrentAccountPartyRow {
  return {
    partyId,
    partyName,
    enrolled,
    openCount: 0,
    overdueAmount: 0,
    aging: emptyCurrentAccountAgingTotals(),
    balance: 0,
    unappliedCredit: 0,
    creditLimit: null,
    termDays: CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS,
  }
}

type EnrolledPartyRecord = {
  id: string
  name: string
  creditLimit: number | null
  termDays: number
}

async function loadEnrolledParties(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  direction: CurrentAccountDirection,
): Promise<EnrolledPartyRecord[]> {
  const table = direction === "receivable" ? "clients" : "suppliers"
  const { data } = await supabase
    .from(table)
    .select("id, name, current_account_credit_limit, current_account_term_days")
    .eq("pop_id", popId)
    .eq("current_account_enabled", true)
    .order("name", { ascending: true })
  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name ?? "").trim(),
    creditLimit: normalizeCurrentAccountCreditLimit(
      row.current_account_credit_limit,
    ),
    termDays: normalizeCurrentAccountTermDays(row.current_account_term_days),
  }))
}

function applyEnrollmentTerms(
  party: CurrentAccountPartyRow,
  enrolled: EnrolledPartyRecord,
) {
  party.enrolled = true
  party.creditLimit = enrolled.creditLimit
  party.termDays = enrolled.termDays
  if (!party.partyName.trim() && enrolled.name) {
    party.partyName = enrolled.name
  }
}

function mergeEnrolledParties(
  parties: CurrentAccountPartyRow[],
  enrolled: EnrolledPartyRecord[],
): CurrentAccountPartyRow[] {
  const byId = new Map(parties.map((row) => [row.partyId, row]))
  for (const row of enrolled) {
    const current = byId.get(row.id)
    if (current) {
      applyEnrollmentTerms(current, row)
      continue
    }
    const next = emptyPartyRow(row.id, row.name || "—", true)
    applyEnrollmentTerms(next, row)
    byId.set(row.id, next)
  }
  return [...byId.values()]
}

function groupParties(
  documents: DocumentOpenItem[],
  today: string,
  unappliedByParty: Map<string, number>,
): CurrentAccountPartyRow[] {
  const byParty = new Map<string, CurrentAccountPartyRow>()
  for (const doc of documents) {
    const current = byParty.get(doc.partyId) ?? emptyPartyRow(doc.partyId, doc.partyName)
    if (doc.remaining > 0.009) {
      current.openCount += 1
      current.balance = roundMoney(current.balance + doc.remaining)
      const bucket = currentAccountAgingBucket(doc.dueDate, today)
      current.aging = addCurrentAccountAgingAmount(
        current.aging,
        bucket,
        doc.remaining,
      )
      if (bucket !== "current") {
        current.overdueAmount = roundMoney(current.overdueAmount + doc.remaining)
      }
    }
    if (doc.partyName && current.partyName === "Cliente") {
      current.partyName = doc.partyName
    }
    byParty.set(doc.partyId, current)
  }
  for (const [partyId, credit] of unappliedByParty) {
    const current = byParty.get(partyId) ?? emptyPartyRow(partyId, "")
    current.unappliedCredit = credit
    current.balance = roundMoney(current.balance - credit)
    byParty.set(partyId, current)
  }
  return [...byParty.values()].filter(
    (row) => row.openCount > 0 || Math.abs(row.balance) > 0.009,
  )
}

async function fillMissingPartyNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  direction: CurrentAccountDirection,
  parties: CurrentAccountPartyRow[],
): Promise<void> {
  const missing = parties.filter((row) => !row.partyName.trim())
  if (missing.length === 0) return
  const table = direction === "receivable" ? "clients" : "suppliers"
  const { data } = await supabase
    .from(table)
    .select("id, name")
    .in(
      "id",
      missing.map((row) => row.partyId),
    )
  const names = new Map(
    (data ?? []).map((row) => [String(row.id), String(row.name ?? "").trim()]),
  )
  const fallback = direction === "receivable" ? "Cliente" : "Proveedor"
  for (const row of missing) {
    row.partyName = names.get(row.partyId) || fallback
  }
}

function creditLimitSortValue(row: CurrentAccountPartyRow): number {
  if (!row.enrolled) return Number.NEGATIVE_INFINITY
  if (row.creditLimit == null) return Number.POSITIVE_INFINITY
  return row.creditLimit
}

function termDaysSortValue(row: CurrentAccountPartyRow): number {
  if (!row.enrolled) return Number.NEGATIVE_INFINITY
  return row.termDays
}

function sortParties(
  rows: CurrentAccountPartyRow[],
  sort: CurrentAccountTableSortKey | null,
  ascending: boolean,
): CurrentAccountPartyRow[] {
  const key = sort ?? "balance"
  const dir = ascending ? 1 : -1
  return [...rows].sort((a, b) => {
    if (key === "party_name") {
      return a.partyName.localeCompare(b.partyName, "es") * dir
    }
    if (key === "credit_limit") {
      const left = creditLimitSortValue(a)
      const right = creditLimitSortValue(b)
      if (left === right) return 0
      return (left < right ? -1 : 1) * dir
    }
    if (key === "term_days") {
      const left = termDaysSortValue(a)
      const right = termDaysSortValue(b)
      if (left === right) return 0
      return (left < right ? -1 : 1) * dir
    }
    if (key === "open_count") return (a.openCount - b.openCount) * dir
    if (key === "overdue") return (a.overdueAmount - b.overdueAmount) * dir
    return (a.balance - b.balance) * dir
  })
}

export async function getPopCurrentAccountParties(
  popId: string,
  input: {
    q?: string
    page?: number
    pageSize?: number
    direction?: CurrentAccountDirection | ""
    aging?: CurrentAccountAgingFilter | ""
    sort?: string | null
    ord?: "asc" | "desc"
  },
): Promise<
  | {
      success: true
      parties: CurrentAccountPartyRow[]
      totalCount: number
      page: number
      popName: string
      direction: CurrentAccountDirection
      canCreate: boolean
    }
  | {
      success: false
      error: string
      redirect?: string
      parties: CurrentAccountPartyRow[]
      totalCount: number
      page: number
      popName?: string
      direction: CurrentAccountDirection
      canCreate: boolean
    }
> {
  const empty = emptyParties()
  const directionRaw = input.direction ?? ""
  const direction = isCurrentAccountDirection(directionRaw)
    ? directionRaw
    : "receivable"
  try {
    const access = await requireCurrentAccountAccess(popId)
    if (!access.ok) {
      return {
        success: false,
        error: access.error,
        redirect: access.redirect,
        ...empty,
        popName: "",
        direction,
      }
    }

    const pageSizeRaw = Number(input.pageSize)
    const pageSize = CURRENT_ACCOUNT_TABLE_PAGE_SIZES.includes(
      pageSizeRaw as (typeof CURRENT_ACCOUNT_TABLE_PAGE_SIZES)[number],
    )
      ? pageSizeRaw
      : DEFAULT_CURRENT_ACCOUNT_TABLE_PAGE_SIZE
    const pageRaw = Number(input.page)
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1
    const q = input.q?.trim().toLowerCase() ?? ""
    const sort = (input.sort ?? null) as CurrentAccountTableSortKey | null
    const ascending = input.ord === "asc"

    const supabase = await createClient()
    const timeZone = await loadPopLedgerTimeZone(supabase, popId)
    const today = toPopCalendarDate(new Date().toISOString(), timeZone)
    const { data: popRow } = await supabase
      .from("pops")
      .select("name")
      .eq("id", popId)
      .maybeSingle()

    const documents = await loadOpenDocuments(
      supabase,
      popId,
      direction,
      timeZone,
    )
    const unapplied = await loadUnappliedByParty(supabase, popId, direction)
    const enrolled = await loadEnrolledParties(supabase, popId, direction)
    let parties = mergeEnrolledParties(
      groupParties(documents, today, unapplied),
      enrolled,
    )
    await fillMissingPartyNames(supabase, direction, parties)
    if (q) {
      parties = parties.filter((row) =>
        row.partyName.toLowerCase().includes(q),
      )
    }
    const agingRaw = input.aging ?? "all"
    const agingFilter = isCurrentAccountAgingFilter(agingRaw)
      ? agingRaw
      : "all"
    if (agingFilter !== "all") {
      parties = parties.filter((row) => row.aging[agingFilter] > 0.009)
    }
    parties = sortParties(
      parties,
      sort &&
        CURRENT_ACCOUNT_TABLE_SORT_KEYS.includes(
          sort as CurrentAccountTableSortKey,
        )
        ? sort
        : "balance",
      sort ? ascending : false,
    )
    const totalCount = parties.length
    const from = (page - 1) * pageSize
    return {
      success: true,
      parties: parties.slice(from, from + pageSize),
      totalCount,
      page,
      popName: String(popRow?.name ?? ""),
      direction,
      canCreate: access.canCreate,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return {
      success: false,
      error: message,
      ...empty,
      popName: "",
      direction,
    }
  }
}

export type CurrentAccountEnrollmentCandidate = {
  id: string
  name: string
  taxId: string | null
}

function escapeIlikeToken(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

export async function searchPopCurrentAccountEnrollmentCandidates(
  popId: string,
  input: { direction: CurrentAccountDirection; q?: string },
): Promise<
  | { success: true; parties: CurrentAccountEnrollmentCandidate[] }
  | { success: false; error: string; parties: CurrentAccountEnrollmentCandidate[] }
> {
  const empty = { parties: [] as CurrentAccountEnrollmentCandidate[] }
  try {
    const access = await requireCurrentAccountWrite(popId)
    if (!access.ok) {
      return { success: false, error: access.error, ...empty }
    }
    if (!isCurrentAccountDirection(input.direction)) {
      return { success: false, error: "Dirección inválida.", ...empty }
    }
    const table = input.direction === "receivable" ? "clients" : "suppliers"
    const q = input.q?.trim() ?? ""
    if (!q) {
      return { success: true, ...empty }
    }
    const supabase = await createClient()
    const pattern = `%${escapeIlikeToken(q)}%`
    const query = supabase
      .from(table)
      .select("id, name, tax_id")
      .eq("pop_id", popId)
      .eq("current_account_enabled", false)
      .eq("is_active", true)
      .or(`name.ilike.${pattern},tax_id.ilike.${pattern}`)
      .order("name", { ascending: true })
      .limit(30)
    const { data, error } = await query
    if (error) {
      return { success: false, error: error.message, ...empty }
    }
    return {
      success: true,
      parties: (data ?? []).map((row) => ({
        id: String(row.id),
        name: String(row.name ?? "").trim() || "—",
        taxId:
          row.tax_id != null && String(row.tax_id).trim()
            ? String(row.tax_id).trim()
            : null,
      })),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message, ...empty }
  }
}

export async function setPopCurrentAccountEnrollment(
  popId: string,
  input: {
    direction: CurrentAccountDirection
    partyId: string
    enabled: boolean
    creditLimit?: number | null
    termDays?: number
  },
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await requireCurrentAccountWrite(popId)
    if (!access.ok) {
      return { success: false, error: access.error }
    }
    if (!isCurrentAccountDirection(input.direction)) {
      return { success: false, error: "Dirección inválida." }
    }
    const partyId = input.partyId.trim()
    if (!/^[0-9a-f-]{36}$/i.test(partyId)) {
      return { success: false, error: "Cuenta inválida." }
    }
    const table = input.direction === "receivable" ? "clients" : "suppliers"
    const supabase = await createClient()
    const patch: Record<string, unknown> = {
      current_account_enabled: input.enabled,
    }
    if (input.enabled) {
      if (input.creditLimit !== undefined) {
        patch.current_account_credit_limit =
          normalizeCurrentAccountCreditLimit(input.creditLimit)
      }
      if (input.termDays !== undefined) {
        patch.current_account_term_days = normalizeCurrentAccountTermDays(
          input.termDays,
        )
      }
    }
    const { data, error } = await supabase
      .from(table)
      .update(patch)
      .eq("id", partyId)
      .eq("pop_id", popId)
      .select("id")
      .maybeSingle()
    if (error) {
      return { success: false, error: error.message }
    }
    if (!data) {
      return {
        success: false,
        error:
          input.direction === "receivable"
            ? "No se encontró el cliente."
            : "No se encontró el proveedor.",
      }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getPopCurrentAccountLedger(
  popId: string,
  input: { direction: CurrentAccountDirection; partyId: string },
): Promise<
  | {
      success: true
      partyName: string
      balance: number
      openCount: number
      overdueAmount: number
      aging: CurrentAccountAgingTotals
      lines: CurrentAccountLedgerLine[]
      openDocuments: CurrentAccountOpenDocument[]
      unappliedCredit: number
      canCreate: boolean
      enrolled: boolean
      creditLimit: number | null
      termDays: number
      availableCredit: number | null
      popName: string
    }
  | {
      success: false
      error: string
      redirect?: string
      partyName?: string
      balance: number
      openCount: number
      overdueAmount: number
      aging: CurrentAccountAgingTotals
      lines: CurrentAccountLedgerLine[]
      openDocuments: CurrentAccountOpenDocument[]
      unappliedCredit: number
      canCreate: boolean
      enrolled: boolean
      creditLimit: number | null
      termDays: number
      availableCredit: number | null
      popName?: string
    }
> {
  const empty = {
    balance: 0,
    openCount: 0,
    overdueAmount: 0,
    aging: emptyCurrentAccountAgingTotals(),
    lines: [] as CurrentAccountLedgerLine[],
    openDocuments: [] as CurrentAccountOpenDocument[],
    unappliedCredit: 0,
    canCreate: false,
    enrolled: false,
    creditLimit: null,
    termDays: 30,
    availableCredit: null,
  }
  try {
    const access = await requireCurrentAccountAccess(popId)
    if (!access.ok) {
      return {
        success: false,
        error: access.error,
        redirect: access.redirect,
        ...empty,
        popName: "",
      }
    }
    if (!isCurrentAccountDirection(input.direction)) {
      return { success: false, error: "Dirección inválida.", ...empty }
    }
    const partyId = input.partyId.trim()
    if (!/^[0-9a-f-]{36}$/i.test(partyId)) {
      return { success: false, error: "Cuenta inválida.", ...empty }
    }

    const supabase = await createClient()
    const timeZone = await loadPopLedgerTimeZone(supabase, popId)
    const today = toPopCalendarDate(new Date().toISOString(), timeZone)
    const { data: popRow } = await supabase
      .from("pops")
      .select("name")
      .eq("id", popId)
      .maybeSingle()

    const documents = await loadOpenDocuments(
      supabase,
      popId,
      input.direction,
      timeZone,
      partyId,
    )
    const unapplied = await loadUnappliedByParty(
      supabase,
      popId,
      input.direction,
      partyId,
    )
    const grouped = groupParties(documents, today, unapplied)
    await fillMissingPartyNames(supabase, input.direction, grouped)
    const table = input.direction === "receivable" ? "clients" : "suppliers"
    const { data: partyRow } = await supabase
      .from(table)
      .select(
        "id, name, current_account_enabled, current_account_credit_limit, current_account_term_days",
      )
      .eq("id", partyId)
      .maybeSingle()
    const enrolled = partyRow?.current_account_enabled === true
    const creditLimit = normalizeCurrentAccountCreditLimit(
      partyRow?.current_account_credit_limit,
    )
    const termDays = normalizeCurrentAccountTermDays(
      partyRow?.current_account_term_days,
    )
    let summary = grouped[0]
    if (!summary) {
      if (!partyRow) {
        return {
          success: false,
          error:
            input.direction === "receivable"
              ? "No se encontró el cliente."
              : "No se encontró el proveedor.",
          ...empty,
          popName: String(popRow?.name ?? ""),
        }
      }
      summary = emptyPartyRow(
        partyId,
        String(partyRow.name ?? "").trim() || "—",
        enrolled,
      )
    } else {
      summary.enrolled = enrolled
      if (!summary.partyName.trim() && partyRow?.name) {
        summary.partyName = String(partyRow.name).trim()
      }
    }
    const partyName = summary.partyName || "—"

    const kind = currentAccountDocumentKindForDirection(input.direction)
    const documentIds = documents.map((doc) => doc.id)
    const paymentTable =
      kind === "sale" ? "sale_payments" : "purchase_payments"
    const paymentFk = kind === "sale" ? "sale_id" : "purchase_id"

    const paymentSelect =
      kind === "sale"
        ? "sale_id, amount, payment_kind, created_at, treasury_account_id, treasury_accounts ( name )"
        : "purchase_id, amount, payment_kind, created_at, paid_at, treasury_account_id, treasury_accounts ( name )"
    const payRows =
      documentIds.length === 0
        ? []
        : (((
            await supabase
              .from(paymentTable)
              .select(paymentSelect)
              .eq("pop_id", popId)
              .is("reversed_at", null)
              .in(paymentFk, documentIds)
          ).data ?? []) as unknown[])

    const receiptQuery =
      input.direction === "receivable"
        ? supabase
            .from("current_account_receipts")
            .select(
              "id, amount, paid_at, created_at, payment_kind, notes, treasury_account_id, treasury_accounts ( name )",
            )
            .eq("pop_id", popId)
            .eq("client_id", partyId)
        : supabase
            .from("current_account_receipts")
            .select(
              "id, amount, paid_at, created_at, payment_kind, notes, treasury_account_id, treasury_accounts ( name )",
            )
            .eq("pop_id", popId)
            .eq("supplier_id", partyId)
    const { data: receiptRows } = await receiptQuery

    type DraftLine = Omit<CurrentAccountLedgerLine, "balance">
    const drafts: DraftLine[] = []
    const isReceivable = input.direction === "receivable"

    for (const doc of documents) {
      const label = currentAccountDocumentLabel(kind, doc.documentNumber)
      drafts.push({
        id: `doc-${doc.id}`,
        date: doc.date,
        occurredAt: doc.occurredAt,
        documentLabel: label,
        description: label,
        paymentKindLabel: null,
        debit: isReceivable ? doc.total : 0,
        credit: isReceivable ? 0 : doc.total,
      })
    }

    for (const row of payRows) {
      const raw = row as unknown as Record<string, unknown>
      const amount = Number(raw.amount ?? 0) || 0
      if (!(amount > 0)) continue
      const paidAt =
        raw.paid_at != null
          ? toPopCalendarDate(String(raw.paid_at), timeZone)
          : toPopCalendarDate(String(raw.created_at ?? ""), timeZone)
      drafts.push({
        id: `pay-${String(raw[paymentFk])}-${paidAt}-${amount}`,
        date: paidAt,
        occurredAt: ledgerOccurredAt(raw.created_at ?? raw.paid_at),
        documentLabel: kind === "sale" ? "Cobro" : "Pago",
        description: currentAccountPaymentDescription(
          String(raw.payment_kind ?? ""),
          treasuryAccountNameFromRel(raw.treasury_accounts),
        ),
        paymentKindLabel: isValidOperationPaymentKind(
          String(raw.payment_kind ?? ""),
        )
          ? operationPaymentKindLabel(String(raw.payment_kind ?? ""))
          : null,
        debit: isReceivable ? 0 : amount,
        credit: isReceivable ? amount : 0,
      })
    }

    for (const row of receiptRows ?? []) {
      const amount = Number(row.amount ?? 0) || 0
      if (!(amount > 0)) continue
      const notes = String(row.notes ?? "").trim()
      drafts.push({
        id: `receipt-${String(row.id)}`,
        date: toPopCalendarDate(String(row.paid_at ?? ""), timeZone),
        occurredAt: ledgerOccurredAt(
          (row as { created_at?: unknown }).created_at,
        ),
        documentLabel: input.direction === "receivable" ? "Recibo" : "Orden de pago",
        description: currentAccountPaymentDescription(
          String(row.payment_kind ?? ""),
          treasuryAccountNameFromRel(
            (row as { treasury_accounts?: unknown }).treasury_accounts,
          ),
          notes,
        ),
        paymentKindLabel: isValidOperationPaymentKind(
          String(row.payment_kind ?? ""),
        )
          ? operationPaymentKindLabel(String(row.payment_kind ?? ""))
          : null,
        debit: isReceivable ? 0 : amount,
        credit: isReceivable ? amount : 0,
      })
    }

    drafts.sort(compareLedgerWhen)

    let running = 0
    const lines: CurrentAccountLedgerLine[] = drafts
      .map((line) => {
        running = roundMoney(running + line.debit - line.credit)
        return { ...line, balance: running }
      })
      .reverse()

    const openDocuments: CurrentAccountOpenDocument[] = documents
      .filter((doc) => doc.remaining > 0.009)
      .map((doc) => ({
        id: doc.id,
        date: doc.date,
        occurredAt: doc.occurredAt,
        dueDate: doc.dueDate,
        documentLabel: currentAccountDocumentLabel(kind, doc.documentNumber),
        remaining: doc.remaining,
        daysOverdue: currentAccountDaysOverdue(doc.dueDate, today),
        agingBucket: currentAccountAgingBucket(doc.dueDate, today),
      }))
      .sort((a, b) => compareLedgerWhen(b, a))

    return {
      success: true,
      partyName,
      balance: summary?.balance ?? 0,
      openCount: summary?.openCount ?? 0,
      overdueAmount: summary?.overdueAmount ?? 0,
      aging: summary?.aging ?? emptyCurrentAccountAgingTotals(),
      lines,
      openDocuments,
      unappliedCredit: unapplied.get(partyId) ?? 0,
      canCreate: access.canCreate,
      enrolled,
      creditLimit,
      termDays,
      availableCredit: currentAccountAvailableCredit(
        creditLimit,
        summary?.balance ?? 0,
      ),
      popName: String(popRow?.name ?? ""),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message, ...empty, popName: "" }
  }
}

export async function settlePopCurrentAccount(
  popId: string,
  input: SettleCurrentAccountInput,
): Promise<{ success: true } | { success: false; error: string; redirect?: string }> {
  try {
    const access = await requireCurrentAccountWrite(popId)
    if (!access.ok) {
      return { success: false, error: access.error, redirect: access.redirect }
    }
    if (!isCurrentAccountDirection(input.direction)) {
      return { success: false, error: "Dirección inválida." }
    }
    const partyId = input.partyId.trim()
    if (!/^[0-9a-f-]{36}$/i.test(partyId)) {
      return { success: false, error: "Cuenta inválida." }
    }
    const paidAt = String(input.paidAt ?? "").trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(paidAt)) {
      return { success: false, error: "Revisá la fecha de cobro o pago." }
    }
    if (!isValidOperationPaymentKind(input.paymentKind)) {
      return { success: false, error: "Medio de cobro o pago inválido." }
    }

    const requested = new Map<string, number>()
    for (const row of input.applications ?? []) {
      const documentId = String(row.documentId ?? "").trim()
      if (!/^[0-9a-f-]{36}$/i.test(documentId)) {
        return { success: false, error: "Hay un comprobante inválido." }
      }
      const amount = roundMoney(Number(row.amount ?? 0) || 0)
      if (amount <= 0.009) continue
      requested.set(documentId, roundMoney((requested.get(documentId) ?? 0) + amount))
    }

    const extraAmount = Math.max(0, roundMoney(Number(input.extraAmount ?? 0) || 0))
    const notes = String(input.notes ?? "").trim().slice(0, 500) || null

    const user = await requireAuthenticatedUser()
    const supabase = await createClient()
    const timeZone = await loadPopLedgerTimeZone(supabase, popId)
    const documents = await loadOpenDocuments(
      supabase,
      popId,
      input.direction,
      timeZone,
      partyId,
    )
    const remainingById = new Map(documents.map((doc) => [doc.id, doc.remaining]))

    const applications: { documentId: string; amount: number }[] = []
    for (const [documentId, asked] of requested) {
      const remaining = remainingById.get(documentId)
      if (remaining == null) {
        return {
          success: false,
          error: "Uno de los comprobantes ya no está abierto.",
        }
      }
      const amount = Math.min(asked, remaining)
      if (amount <= 0.009) continue
      applications.push({ documentId, amount: roundMoney(amount) })
    }

    const appliedTotal = applications.reduce(
      (sum, row) => roundMoney(sum + row.amount),
      0,
    )
    const receiptAmount = roundMoney(appliedTotal + extraAmount)
    if (!(receiptAmount > 0.009)) {
      return {
        success: false,
        error: "El cobro o pago tiene que ser mayor a cero.",
      }
    }

    const partyTable = input.direction === "receivable" ? "clients" : "suppliers"
    const { data: partyRow } = await supabase
      .from(partyTable)
      .select("id, name")
      .eq("id", partyId)
      .maybeSingle()
    if (!partyRow) {
      return {
        success: false,
        error:
          input.direction === "receivable"
            ? "No se encontró el cliente."
            : "No se encontró el proveedor.",
      }
    }
    const partyName = String(partyRow.name ?? "").trim() || "—"

    const kind = currentAccountDocumentKindForDirection(input.direction)
    const checkFlow = input.direction === "payable" ? "purchase" : "sale"
    let treasuryAccountId = String(input.treasuryAccountId ?? "").trim()
    let checkId: string | null = null
    let cashRegisterSessionId: string | null = null

    if (input.paymentKind === "cash") {
      const cashRes = await resolveOpenCashSession(supabase, popId, user.uid)
      if (!cashRes.success) return cashRes
      if (!cashRes.ctx.cashTreasuryAccountId) {
        return {
          success: false,
          error: "La caja abierta no tiene cuenta de efectivo configurada.",
        }
      }
      const stillOpen = await assertCashSessionStillOpen(
        supabase,
        popId,
        cashRes.ctx.sessionId,
      )
      if (!stillOpen.success) return stillOpen
      cashRegisterSessionId = cashRes.ctx.sessionId
      treasuryAccountId = cashRes.ctx.cashTreasuryAccountId
    }

    if (input.paymentKind === "check") {
      const parsed = parseCheckoutCheckDetails(input.checkDetails)
      if (!parsed.ok) return { success: false, error: parsed.error }
      const details = {
        ...parsed.details,
        partyId: parsed.details.partyId || partyId,
        partyName: parsed.details.partyName || partyName,
      }
      const resolved = await resolveCheckTreasuryAccountId(
        supabase,
        popId,
        checkoutCheckDirection(checkFlow),
      )
      if (!resolved) {
        return {
          success: false,
          error: "Configurá una cuenta de cheques en tesorería.",
        }
      }
      treasuryAccountId = resolved
      const firstApp = applications[0]
      const inserted = await insertCheckoutCheck(supabase, {
        popId,
        userId: user.uid,
        direction: checkoutCheckDirection(checkFlow),
        amount: receiptAmount,
        details,
        sourceKind: firstApp ? kind : "manual",
        sourceId: firstApp?.documentId,
      })
      if (!inserted.success) return inserted
      checkId = inserted.checkId
    } else if (!/^[0-9a-f-]{36}$/i.test(treasuryAccountId)) {
      return { success: false, error: "Elegí un medio de cobro o pago." }
    }

    const { data: receiptRow, error: receiptErr } = await supabase
      .from("current_account_receipts")
      .insert({
        pop_id: popId,
        direction: input.direction,
        client_id: input.direction === "receivable" ? partyId : null,
        supplier_id: input.direction === "payable" ? partyId : null,
        amount: receiptAmount,
        paid_at: paidAt,
        payment_kind: input.paymentKind,
        treasury_account_id: treasuryAccountId,
        check_id: checkId,
        cash_register_session_id: cashRegisterSessionId,
        notes,
        created_by: user.uid,
      })
      .select("id")
      .single()
    if (receiptErr || !receiptRow?.id) {
      if (checkId) await deleteCheckoutCheck(supabase, checkId)
      return {
        success: false,
        error: receiptErr?.message || "No se pudo registrar el recibo.",
      }
    }
    const receiptId = String(receiptRow.id)

    if (applications.length > 0) {
      const { error: appErr } = await supabase
        .from("current_account_applications")
        .insert(
          applications.map((row) => ({
            pop_id: popId,
            receipt_id: receiptId,
            document_kind: kind,
            document_id: row.documentId,
            amount: row.amount,
          })),
        )
      if (appErr) {
        await supabase.from("current_account_receipts").delete().eq("id", receiptId)
        if (checkId) await deleteCheckoutCheck(supabase, checkId)
        return {
          success: false,
          error: appErr.message || "No se pudieron imputar los comprobantes.",
        }
      }
    }

    const posted = await postCurrentAccountReceiptLedger(supabase, {
      popId,
      userId: user.uid,
      receiptId,
      direction: input.direction,
      amount: receiptAmount,
      entryDate: paidAt,
      partyName,
      paymentKind: input.paymentKind,
      treasuryAccountId,
    })
    if (!posted.success) {
      await supabase.from("current_account_receipts").delete().eq("id", receiptId)
      if (checkId) await deleteCheckoutCheck(supabase, checkId)
      return posted
    }

    const { error: linkErr } = await supabase
      .from("current_account_receipts")
      .update({ accounting_entry_id: posted.entryId })
      .eq("id", receiptId)
      .eq("pop_id", popId)
    if (linkErr) {
      await cancelCurrentAccountAccountingEntry(supabase, posted.entryId)
      await supabase.from("current_account_receipts").delete().eq("id", receiptId)
      if (checkId) await deleteCheckoutCheck(supabase, checkId)
      return {
        success: false,
        error: linkErr.message || "No se pudo vincular el asiento al recibo.",
      }
    }

    if (checkId) {
      await supabase
        .from("checks")
        .update({ received_accounting_entry_id: posted.entryId })
        .eq("id", checkId)
        .eq("pop_id", popId)
    }

    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

async function loadUnappliedReceipts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  direction: CurrentAccountDirection,
  partyId: string,
): Promise<{ id: string; leftover: number }[]> {
  const query =
    direction === "receivable"
      ? supabase
          .from("current_account_receipts")
          .select("id, amount, paid_at")
          .eq("pop_id", popId)
          .eq("direction", "receivable")
          .eq("client_id", partyId)
          .order("paid_at", { ascending: true })
      : supabase
          .from("current_account_receipts")
          .select("id, amount, paid_at")
          .eq("pop_id", popId)
          .eq("direction", "payable")
          .eq("supplier_id", partyId)
          .order("paid_at", { ascending: true })
  const { data: receipts } = await query
  if (!receipts?.length) return []

  const receiptIds = receipts.map((row) => String(row.id))
  const { data: appRows } = await supabase
    .from("current_account_applications")
    .select("receipt_id, amount")
    .eq("pop_id", popId)
    .in("receipt_id", receiptIds)
  const applied = new Map<string, number>()
  for (const row of appRows ?? []) {
    const id = String(row.receipt_id ?? "")
    applied.set(id, roundMoney((applied.get(id) ?? 0) + Number(row.amount ?? 0)))
  }

  return receipts.flatMap((row) => {
    const leftover = currentAccountOpenAmount(
      Number(row.amount ?? 0) || 0,
      applied.get(String(row.id)) ?? 0,
    )
    if (leftover <= 0.009) return []
    return [{ id: String(row.id), leftover }]
  })
}

export async function applyPopCurrentAccountCredit(
  popId: string,
  input: {
    direction: CurrentAccountDirection
    partyId: string
    applications: SettleCurrentAccountApplicationInput[]
  },
): Promise<{ success: true } | { success: false; error: string; redirect?: string }> {
  try {
    const access = await requireCurrentAccountWrite(popId)
    if (!access.ok) {
      return { success: false, error: access.error, redirect: access.redirect }
    }
    if (!isCurrentAccountDirection(input.direction)) {
      return { success: false, error: "Dirección inválida." }
    }
    const partyId = input.partyId.trim()
    if (!/^[0-9a-f-]{36}$/i.test(partyId)) {
      return { success: false, error: "Cuenta inválida." }
    }

    const supabase = await createClient()
    const timeZone = await loadPopLedgerTimeZone(supabase, popId)
    const documents = await loadOpenDocuments(
      supabase,
      popId,
      input.direction,
      timeZone,
      partyId,
    )
    const remainingById = new Map(documents.map((doc) => [doc.id, doc.remaining]))
    const kind = currentAccountDocumentKindForDirection(input.direction)

    const requested: { documentId: string; amount: number }[] = []
    for (const row of input.applications ?? []) {
      const documentId = String(row.documentId ?? "").trim()
      if (!/^[0-9a-f-]{36}$/i.test(documentId)) {
        return { success: false, error: "Hay un comprobante inválido." }
      }
      const remaining = remainingById.get(documentId)
      if (remaining == null) {
        return {
          success: false,
          error: "Uno de los comprobantes ya no está abierto.",
        }
      }
      const amount = Math.min(roundMoney(Number(row.amount ?? 0) || 0), remaining)
      if (amount <= 0.009) continue
      requested.push({ documentId, amount })
    }
    const askedTotal = requested.reduce((sum, row) => roundMoney(sum + row.amount), 0)
    if (!(askedTotal > 0.009)) {
      return { success: false, error: "Elegí a qué comprobantes imputar." }
    }

    const credits = await loadUnappliedReceipts(
      supabase,
      popId,
      input.direction,
      partyId,
    )
    const creditTotal = credits.reduce((sum, row) => roundMoney(sum + row.leftover), 0)
    if (creditTotal <= 0.009) {
      return { success: false, error: "No hay saldo a cuenta para imputar." }
    }

    const inserts: {
      pop_id: string
      receipt_id: string
      document_kind: CurrentAccountDocumentKind
      document_id: string
      amount: number
    }[] = []
    let creditIndex = 0
    let creditLeft = credits[0]?.leftover ?? 0
    for (const row of requested) {
      let need = row.amount
      while (need > 0.009 && creditIndex < credits.length) {
        if (creditLeft <= 0.009) {
          creditIndex += 1
          creditLeft = credits[creditIndex]?.leftover ?? 0
          continue
        }
        const take = Math.min(need, creditLeft)
        inserts.push({
          pop_id: popId,
          receipt_id: credits[creditIndex].id,
          document_kind: kind,
          document_id: row.documentId,
          amount: roundMoney(take),
        })
        need = roundMoney(need - take)
        creditLeft = roundMoney(creditLeft - take)
      }
    }
    if (inserts.length === 0) {
      return { success: false, error: "No hay saldo a cuenta para imputar." }
    }

    const merged = new Map<string, (typeof inserts)[number]>()
    for (const row of inserts) {
      const key = `${row.receipt_id}:${row.document_id}`
      const existing = merged.get(key)
      if (existing) {
        existing.amount = roundMoney(existing.amount + row.amount)
      } else {
        merged.set(key, { ...row })
      }
    }

    for (const row of merged.values()) {
      const { data: existing } = await supabase
        .from("current_account_applications")
        .select("id, amount")
        .eq("pop_id", popId)
        .eq("receipt_id", row.receipt_id)
        .eq("document_kind", row.document_kind)
        .eq("document_id", row.document_id)
        .maybeSingle()
      if (existing?.id) {
        const { error } = await supabase
          .from("current_account_applications")
          .update({ amount: roundMoney(Number(existing.amount ?? 0) + row.amount) })
          .eq("id", existing.id)
        if (error) {
          return {
            success: false,
            error: error.message || "No se pudo imputar el saldo a cuenta.",
          }
        }
      } else {
        const { error } = await supabase
          .from("current_account_applications")
          .insert(row)
        if (error) {
          return {
            success: false,
            error: error.message || "No se pudo imputar el saldo a cuenta.",
          }
        }
      }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
