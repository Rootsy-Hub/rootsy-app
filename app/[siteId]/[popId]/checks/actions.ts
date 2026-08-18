"use server"

import {
  CHECK_TABLE_PAGE_SIZES,
  DEFAULT_CHECK_TABLE_PAGE_SIZE,
  type CheckTableSortKey,
} from "@/app/[siteId]/[popId]/checks/workspaceUrl"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import {
  cancelCheckAccountingEntry,
  postCheckDepositLedger,
  postCheckReceiveLedger,
  postCheckRejectLedger,
  postCheckVoidLedger,
} from "@/lib/checkAccountingPosting"
import { reversePaymentsLinkedToCheck } from "@/lib/currentAccountPayments"
import {
  canApplyCheckLifecycleAction,
  isCheckDirection,
  isCheckStatus,
  type CheckDirection,
  type CheckLifecycleAction,
  type CheckSourceKind,
  type CheckStatus,
} from "@/lib/checkDocuments"
import { parseMoneyInput } from "@/lib/moneyInput"
import { getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { entryDateIsoInTimezone } from "@/lib/popTimezone"
import { loadPopLedgerTimeZone } from "@/lib/popTimezoneServer"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { popMenuHref } from "@/lib/popRoutes"
import { resolveWorkspaceTableListOrder } from "@/lib/workspaceTableSort"
import { createClient } from "@/utils/supabase/server"

export type CheckTableRow = {
  id: string
  direction: CheckDirection
  checkNumber: string
  bankName: string
  amount: number
  issueDate: string
  dueDate: string
  status: CheckStatus
  partyName: string
  sourceKind: CheckSourceKind
}

export type CreatePopCheckInput = {
  direction: CheckDirection
  checkNumber: string
  bankName: string
  amount: string
  issueDate: string
  dueDate: string
  partyName: string
  partyId: string
  notes: string
}

export type GetPopChecksTableInput = {
  q?: string
  page?: number
  pageSize?: number
  direction?: CheckDirection | ""
  status?: CheckStatus | ""
  sort?: string | null
  ord?: "asc" | "desc"
}

const CHECK_LIST_SORT = {
  allowed: {
    check_number: "check_number",
    direction: "direction",
    bank_name: "bank_name",
    amount: "amount",
    issue_date: "issue_date",
    due_date: "due_date",
    status: "status",
  } satisfies Record<CheckTableSortKey, string>,
  defaultColumn: "due_date" as const,
  defaultAscending: false,
}

const CHECK_SELECT = `
  id,
  direction,
  check_number,
  bank_name,
  amount,
  issue_date,
  due_date,
  status,
  client_id,
  supplier_id,
  drawer_name,
  payee_name,
  source_kind,
  clients!client_id ( name ),
  suppliers!supplier_id ( name )
`

function emptyTable() {
  return {
    checks: [] as CheckTableRow[],
    totalCount: 0,
    page: 1,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  }
}

async function checkPermissionFlags(popId: string) {
  const snap = await loadPopPermissionsSnapshot(popId)
  return {
    canRead: permissionKeysInclude(
      snap.keys,
      POP_PERMS.CHECK_READ.resource,
      POP_PERMS.CHECK_READ.action,
    ),
    canCreate: permissionKeysInclude(
      snap.keys,
      POP_PERMS.CHECK_CREATE.resource,
      POP_PERMS.CHECK_CREATE.action,
    ),
    canUpdate: permissionKeysInclude(
      snap.keys,
      POP_PERMS.CHECK_UPDATE.resource,
      POP_PERMS.CHECK_UPDATE.action,
    ),
    canDelete: permissionKeysInclude(
      snap.keys,
      POP_PERMS.CHECK_DELETE.resource,
      POP_PERMS.CHECK_DELETE.action,
    ),
  }
}

function partyNameFromRow(row: {
  direction: unknown
  drawer_name: unknown
  payee_name: unknown
  clients: unknown
  suppliers: unknown
}): string {
  const clients = row.clients as { name?: string } | { name?: string }[] | null
  const suppliers = row.suppliers as
    | { name?: string }
    | { name?: string }[]
    | null
  const clientName = Array.isArray(clients)
    ? clients[0]?.name
    : clients?.name
  const supplierName = Array.isArray(suppliers)
    ? suppliers[0]?.name
    : suppliers?.name
  if (row.direction === "issued") {
    return String(supplierName || row.payee_name || "").trim()
  }
  return String(clientName || row.drawer_name || "").trim()
}

function mapCheckTableRow(row: Record<string, unknown>): CheckTableRow {
  const direction = isCheckDirection(String(row.direction ?? ""))
    ? (row.direction as CheckDirection)
    : "received"
  const status = isCheckStatus(String(row.status ?? ""))
    ? (row.status as CheckStatus)
    : "in_portfolio"
  const sourceKind = String(row.source_kind ?? "manual")
  return {
    id: String(row.id),
    direction,
    checkNumber: String(row.check_number ?? ""),
    bankName: String(row.bank_name ?? ""),
    amount: Number(row.amount ?? 0) || 0,
    issueDate: String(row.issue_date ?? ""),
    dueDate: String(row.due_date ?? ""),
    status,
    partyName: partyNameFromRow(row),
    sourceKind:
      sourceKind === "sale" ||
      sourceKind === "purchase" ||
      sourceKind === "expense" ||
      sourceKind === "service_charge"
        ? sourceKind
        : "manual",
  }
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export async function getPopChecksTable(
  popId: string,
  input: GetPopChecksTableInput,
): Promise<
  | {
      success: true
      checks: CheckTableRow[]
      totalCount: number
      page: number
      popName: string
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
  | {
      success: false
      error: string
      redirect?: string
      checks: CheckTableRow[]
      totalCount: number
      page: number
      popName?: string
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
> {
  const empty = emptyTable()
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return {
        success: false,
        error: access.error || "Sin acceso",
        redirect: "/home",
        ...empty,
        popName: "",
      }
    }
    const perms = await checkPermissionFlags(popId)
    if (!perms.canRead) {
      return {
        success: false,
        error: "No tenés permiso para ver cheques.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
        ...empty,
        popName: "",
      }
    }

    const pageSizeRaw = Number(input.pageSize)
    const pageSize = CHECK_TABLE_PAGE_SIZES.includes(
      pageSizeRaw as (typeof CHECK_TABLE_PAGE_SIZES)[number],
    )
      ? pageSizeRaw
      : DEFAULT_CHECK_TABLE_PAGE_SIZE
    const pageRaw = Number(input.page)
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1
    const q = input.q?.trim() ?? ""
    const order = resolveWorkspaceTableListOrder(
      { sort: input.sort ?? null, ord: input.ord ?? "asc" },
      CHECK_LIST_SORT,
    )

    const supabase = await createClient()
    const { data: popRow } = await supabase
      .from("pops")
      .select("name")
      .eq("id", popId)
      .maybeSingle()

    let query = supabase
      .from("checks")
      .select(CHECK_SELECT, { count: "exact" })
      .eq("pop_id", popId)

    if (input.direction) query = query.eq("direction", input.direction)
    if (input.status) query = query.eq("status", input.status)
    if (q) {
      const pattern = `%${q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")}%`
      query = query.or(
        [
          `check_number.ilike.${pattern}`,
          `bank_name.ilike.${pattern}`,
          `drawer_name.ilike.${pattern}`,
          `payee_name.ilike.${pattern}`,
        ].join(","),
      )
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await query
      .order(order.column, { ascending: order.ascending })
      .range(from, to)

    if (error) {
      return {
        success: false,
        error: error.message || "No se pudieron cargar los cheques.",
        ...empty,
        popName: String(popRow?.name ?? ""),
        canCreate: perms.canCreate,
        canUpdate: perms.canUpdate,
        canDelete: perms.canDelete,
      }
    }

    return {
      success: true,
      checks: (data ?? []).map((row) =>
        mapCheckTableRow(row as Record<string, unknown>),
      ),
      totalCount: count ?? 0,
      page,
      popName: String(popRow?.name ?? ""),
      canCreate: perms.canCreate,
      canUpdate: perms.canUpdate,
      canDelete: perms.canDelete,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message, ...empty, popName: "" }
  }
}

export async function createPopCheck(
  popId: string,
  input: CreatePopCheckInput,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const perms = await checkPermissionFlags(popId)
    if (!perms.canCreate) {
      return { success: false, error: "Sin permiso para crear cheques." }
    }
    if (!isCheckDirection(input.direction)) {
      return { success: false, error: "Indicá si el cheque es recibido o emitido." }
    }
    const checkNumber = input.checkNumber.trim()
    if (!checkNumber) {
      return { success: false, error: "El número de cheque es obligatorio." }
    }
    const bankName = input.bankName.trim()
    if (!bankName) {
      return { success: false, error: "El banco es obligatorio." }
    }
    const amount = parseMoneyInput(input.amount)
    if (!(amount > 0)) {
      return { success: false, error: "El importe tiene que ser mayor a cero." }
    }
    if (!isIsoDate(input.issueDate) || !isIsoDate(input.dueDate)) {
      return { success: false, error: "Revisá las fechas de emisión y cobro." }
    }
    const partyName = input.partyName.trim()
    const partyId = input.partyId.trim() || null
    const user = await requireAuthenticatedUser()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("checks")
      .insert({
        pop_id: popId,
        direction: input.direction,
        check_number: checkNumber,
        bank_name: bankName,
        amount,
        issue_date: input.issueDate,
        due_date: input.dueDate,
        status: "in_portfolio",
        source_kind: "manual",
        client_id: input.direction === "received" ? partyId : null,
        supplier_id: input.direction === "issued" ? partyId : null,
        drawer_name: input.direction === "received" ? partyName || null : null,
        payee_name: input.direction === "issued" ? partyName || null : null,
        notes: input.notes.trim() || null,
        created_by: user.uid,
      })
      .select("id")
      .single()
    if (error || !data?.id) {
      return { success: false, error: error?.message || "No se pudo crear el cheque." }
    }
    const checkId = String(data.id)
    const posted = await postCheckReceiveLedger(supabase, {
      popId,
      userId: user.uid,
      checkId,
      direction: input.direction,
      amount,
      entryDate: input.issueDate,
      checkNumber,
      bankName,
    })
    if (!posted.success) {
      await supabase.from("checks").delete().eq("id", checkId).eq("pop_id", popId)
      return posted
    }
    const { error: linkErr } = await supabase
      .from("checks")
      .update({ received_accounting_entry_id: posted.entryId })
      .eq("id", checkId)
      .eq("pop_id", popId)
    if (linkErr) {
      await cancelCheckAccountingEntry(supabase, posted.entryId)
      await supabase.from("checks").delete().eq("id", checkId).eq("pop_id", popId)
      return {
        success: false,
        error: linkErr.message || "No se pudo vincular el asiento al cheque.",
      }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

async function loadCheckForUpdate(popId: string, checkId: string) {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { ok: false as const, error: access.error || "Sin acceso" }
  }
  const perms = await checkPermissionFlags(popId)
  if (!perms.canUpdate) {
    return { ok: false as const, error: "Sin permiso para actualizar cheques." }
  }
  const id = checkId.trim()
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return { ok: false as const, error: "Cheque inválido." }
  }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("checks")
    .select(
      "id, status, direction, amount, check_number, bank_name, deposit_treasury_account_id, settlement_accounting_entry_id",
    )
    .eq("id", id)
    .eq("pop_id", popId)
    .maybeSingle()
  if (error) return { ok: false as const, error: error.message }
  if (!data) return { ok: false as const, error: "No se encontró el cheque." }
  const status = isCheckStatus(String(data.status ?? ""))
    ? (data.status as CheckStatus)
    : null
  if (!status) return { ok: false as const, error: "El estado del cheque no es válido." }
  return {
    ok: true as const,
    supabase,
    checkId: String(data.id),
    status,
    direction: isCheckDirection(String(data.direction ?? ""))
      ? (data.direction as CheckDirection)
      : "received",
    amount: Number(data.amount ?? 0) || 0,
    checkNumber: String(data.check_number ?? ""),
    bankName: String(data.bank_name ?? ""),
    depositTreasuryAccountId:
      data.deposit_treasury_account_id != null
        ? String(data.deposit_treasury_account_id)
        : null,
    settlementAccountingEntryId:
      data.settlement_accounting_entry_id != null
        ? String(data.settlement_accounting_entry_id)
        : null,
  }
}

function lifecycleBlockedError(
  status: CheckStatus,
  action: CheckLifecycleAction,
): string | null {
  if (canApplyCheckLifecycleAction(status, action)) return null
  if (status === "cleared") return "Este cheque ya está acreditado."
  if (status === "rejected") return "Este cheque ya está rechazado."
  if (status === "voided") return "Este cheque está anulado."
  if (action === "deposit") return "Solo se puede depositar un cheque en cartera."
  if (action === "clear") return "Primero tenés que depositarlo."
  if (action === "void") return "Solo se puede anular un cheque en cartera."
  return "Esa acción no aplica a este cheque."
}

export async function depositPopCheck(
  popId: string,
  checkId: string,
  input: { treasuryAccountId: string; depositedAt: string },
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const loaded = await loadCheckForUpdate(popId, checkId)
    if (!loaded.ok) return { success: false, error: loaded.error }
    const blocked = lifecycleBlockedError(loaded.status, "deposit")
    if (blocked) return { success: false, error: blocked }
    const depositedAt = input.depositedAt.trim()
    if (!isIsoDate(depositedAt)) {
      return { success: false, error: "Revisá la fecha de depósito." }
    }
    const treasuryAccountId = input.treasuryAccountId.trim()
    if (!treasuryAccountId) {
      return { success: false, error: "Elegí el banco o billetera." }
    }
    const { data: taRow, error: taErr } = await loaded.supabase
      .from("treasury_accounts")
      .select("id, kind")
      .eq("id", treasuryAccountId)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .maybeSingle()
    if (taErr) return { success: false, error: taErr.message }
    const kind = String(taRow?.kind ?? "")
    if (!taRow || (kind !== "bank" && kind !== "wallet")) {
      return { success: false, error: "Elegí una cuenta banco o billetera activa." }
    }
    const user = await requireAuthenticatedUser()
    let settlementEntryId = loaded.settlementAccountingEntryId
    if (!settlementEntryId) {
      const posted = await postCheckDepositLedger(loaded.supabase, {
        popId,
        userId: user.uid,
        checkId: loaded.checkId,
        direction: loaded.direction,
        amount: loaded.amount,
        entryDate: depositedAt,
        checkNumber: loaded.checkNumber,
        bankName: loaded.bankName,
        treasuryAccountId,
      })
      if (!posted.success) return posted
      settlementEntryId = posted.entryId
    }
    const { data, error } = await loaded.supabase
      .from("checks")
      .update({
        status: "deposited",
        deposit_treasury_account_id: treasuryAccountId,
        deposited_at: depositedAt,
        settlement_accounting_entry_id: settlementEntryId,
      })
      .eq("id", loaded.checkId)
      .eq("pop_id", popId)
      .eq("status", "in_portfolio")
      .select("id")
      .maybeSingle()
    if (error) {
      if (!loaded.settlementAccountingEntryId && settlementEntryId) {
        await cancelCheckAccountingEntry(loaded.supabase, settlementEntryId)
      }
      return { success: false, error: error.message }
    }
    if (!data) {
      if (!loaded.settlementAccountingEntryId && settlementEntryId) {
        await cancelCheckAccountingEntry(loaded.supabase, settlementEntryId)
      }
      return { success: false, error: "El cheque ya no está en cartera." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function clearPopCheck(
  popId: string,
  checkId: string,
  input: { clearedAt: string },
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const loaded = await loadCheckForUpdate(popId, checkId)
    if (!loaded.ok) return { success: false, error: loaded.error }
    const blocked = lifecycleBlockedError(loaded.status, "clear")
    if (blocked) return { success: false, error: blocked }
    const clearedAt = input.clearedAt.trim()
    if (!isIsoDate(clearedAt)) {
      return { success: false, error: "Revisá la fecha de acreditación." }
    }
    const user = await requireAuthenticatedUser()
    let settlementEntryId = loaded.settlementAccountingEntryId
    if (!settlementEntryId) {
      const treasuryAccountId = loaded.depositTreasuryAccountId
      if (!treasuryAccountId) {
        return {
          success: false,
          error: "Este cheque no tiene banco de depósito para registrar el asiento.",
        }
      }
      const posted = await postCheckDepositLedger(loaded.supabase, {
        popId,
        userId: user.uid,
        checkId: loaded.checkId,
        direction: loaded.direction,
        amount: loaded.amount,
        entryDate: clearedAt,
        checkNumber: loaded.checkNumber,
        bankName: loaded.bankName,
        treasuryAccountId,
      })
      if (!posted.success) return posted
      settlementEntryId = posted.entryId
    }
    const { data, error } = await loaded.supabase
      .from("checks")
      .update({
        status: "cleared",
        cleared_at: clearedAt,
        settlement_accounting_entry_id: settlementEntryId,
      })
      .eq("id", loaded.checkId)
      .eq("pop_id", popId)
      .eq("status", "deposited")
      .select("id")
      .maybeSingle()
    if (error) {
      if (!loaded.settlementAccountingEntryId && settlementEntryId) {
        await cancelCheckAccountingEntry(loaded.supabase, settlementEntryId)
      }
      return { success: false, error: error.message }
    }
    if (!data) {
      if (!loaded.settlementAccountingEntryId && settlementEntryId) {
        await cancelCheckAccountingEntry(loaded.supabase, settlementEntryId)
      }
      return { success: false, error: "El cheque ya no está depositado." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function rejectPopCheck(
  popId: string,
  checkId: string,
  input: { rejectedAt: string; reason: string },
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const loaded = await loadCheckForUpdate(popId, checkId)
    if (!loaded.ok) return { success: false, error: loaded.error }
    const blocked = lifecycleBlockedError(loaded.status, "reject")
    if (blocked) return { success: false, error: blocked }
    const rejectedAt = input.rejectedAt.trim()
    if (!isIsoDate(rejectedAt)) {
      return { success: false, error: "Revisá la fecha de rechazo." }
    }
    const user = await requireAuthenticatedUser()
    const settledToBank = Boolean(loaded.settlementAccountingEntryId)
    const posted = await postCheckRejectLedger(loaded.supabase, {
      popId,
      userId: user.uid,
      checkId: loaded.checkId,
      direction: loaded.direction,
      amount: loaded.amount,
      entryDate: rejectedAt,
      checkNumber: loaded.checkNumber,
      bankName: loaded.bankName,
      settledToBank,
      treasuryAccountId: loaded.depositTreasuryAccountId,
    })
    if (!posted.success) return posted
    const { data, error } = await loaded.supabase
      .from("checks")
      .update({
        status: "rejected",
        rejected_at: rejectedAt,
        rejection_reason: input.reason.trim() || null,
      })
      .eq("id", loaded.checkId)
      .eq("pop_id", popId)
      .in("status", ["in_portfolio", "deposited"])
      .select("id")
      .maybeSingle()
    if (error) {
      await cancelCheckAccountingEntry(loaded.supabase, posted.entryId)
      return { success: false, error: error.message }
    }
    if (!data) {
      await cancelCheckAccountingEntry(loaded.supabase, posted.entryId)
      return { success: false, error: "El cheque ya no se puede rechazar." }
    }
    const reversed = await reversePaymentsLinkedToCheck(
      loaded.supabase,
      popId,
      loaded.checkId,
    )
    if (!reversed.success) return reversed
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function voidPopCheck(
  popId: string,
  checkId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const loaded = await loadCheckForUpdate(popId, checkId)
    if (!loaded.ok) return { success: false, error: loaded.error }
    const blocked = lifecycleBlockedError(loaded.status, "void")
    if (blocked) return { success: false, error: blocked }
    const user = await requireAuthenticatedUser()
    const timeZone = await loadPopLedgerTimeZone(loaded.supabase, popId)
    const posted = await postCheckVoidLedger(loaded.supabase, {
      popId,
      userId: user.uid,
      checkId: loaded.checkId,
      direction: loaded.direction,
      amount: loaded.amount,
      entryDate: entryDateIsoInTimezone(timeZone),
      checkNumber: loaded.checkNumber,
      bankName: loaded.bankName,
    })
    if (!posted.success) return posted
    const { data, error } = await loaded.supabase
      .from("checks")
      .update({ status: "voided" })
      .eq("id", loaded.checkId)
      .eq("pop_id", popId)
      .eq("status", "in_portfolio")
      .select("id")
      .maybeSingle()
    if (error) {
      await cancelCheckAccountingEntry(loaded.supabase, posted.entryId)
      return { success: false, error: error.message }
    }
    if (!data) {
      await cancelCheckAccountingEntry(loaded.supabase, posted.entryId)
      return { success: false, error: "Solo se puede anular un cheque en cartera." }
    }
    const reversed = await reversePaymentsLinkedToCheck(
      loaded.supabase,
      popId,
      loaded.checkId,
    )
    if (!reversed.success) return reversed
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
