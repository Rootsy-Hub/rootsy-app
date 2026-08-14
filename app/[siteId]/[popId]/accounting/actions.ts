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
import { createClient } from "@/utils/supabase/server"

export type AccountType =
  | "activo_corriente"
  | "activo_no_corriente"
  | "pasivo_corriente"
  | "pasivo_no_corriente"
  | "patrimonio_neto"
  | "ingresos"
  | "costos"
  | "gastos"

export type AccountNature = "deudora" | "acreedora"

export type ChartAccountRow = {
  id: string
  parentId: string | null
  code: string
  name: string
  accountType: AccountType
  nature: AccountNature
  level: number
  isMovementAccount: boolean
}

export type ChartAccountSearchRow = {
  id: string
  code: string
  name: string
}

const CHART_ACCOUNT_SEARCH_LIMIT = 12

function escapeChartAccountIlikeToken(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

function buildChartAccountSearchOrClause(raw: string): string | null {
  const term = raw.trim().replace(/,/g, " ").trim()
  if (!term) return null
  const pattern = `%${escapeChartAccountIlikeToken(term)}%`
  return [`code.ilike.${pattern}`, `name.ilike.${pattern}`].join(",")
}

export async function searchAccountingChartAccounts(
  popId: string,
  query: string,
): Promise<
  | { success: true; accounts: ChartAccountSearchRow[] }
  | { success: false; error: string }
> {
  const trimmed = query.trim()
  if (!trimmed) {
    return { success: true, accounts: [] }
  }

  const orClause = buildChartAccountSearchOrClause(trimmed)
  if (!orClause) {
    return { success: true, accounts: [] }
  }

  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.ACCOUNTING_READ.resource,
        POP_PERMS.ACCOUNTING_READ.action,
      )
    ) {
      return {
        success: false,
        error: "Sin permiso para consultar el plan de cuentas.",
      }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("accounting_chart_of_accounts")
      .select("id, code, name")
      .eq("pop_id", popId)
      .or(orClause)
      .order("code", { ascending: true })
      .limit(CHART_ACCOUNT_SEARCH_LIMIT)

    if (error) {
      return {
        success: false,
        error: error.message || "No se pudieron buscar cuentas.",
      }
    }

    return {
      success: true,
      accounts: (data || []).map((row) => ({
        id: String(row.id),
        code: String(row.code ?? ""),
        name: String(row.name ?? ""),
      })),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export type CreateChartAccountInput = {
  code: string
  name: string
  accountType: AccountType
  nature: AccountNature
  level: number
  isMovementAccount: boolean
}

export async function getAccountingPageData(popId: string): Promise<
  | {
      success: true
      popName: string
      accounts: ChartAccountRow[]
      canReadAccounts: boolean
      canCreate: boolean
      canReadJournal: boolean
      journalEntryCount: number
    }
  | { success: false; error: string; redirect?: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso", redirect: "/home" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    const canReadAccounts = permissionKeysInclude(
      snap.keys,
      POP_PERMS.ACCOUNTING_READ.resource,
      POP_PERMS.ACCOUNTING_READ.action,
    )
    if (!canReadAccounts) {
      return {
        success: false,
        error: "No tenés permiso para ver contabilidad en este punto de venta.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
      }
    }
    const canCreate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.ACCOUNTING_CREATE.resource,
      POP_PERMS.ACCOUNTING_CREATE.action,
    )
    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""
    const supabase = await createClient()
    const { data: accRows, error: accErr } = await supabase
      .from("accounting_chart_of_accounts")
      .select(
        "id, parent_id, code, name, account_type, nature, level, is_movement_account",
      )
      .eq("pop_id", popId)
      .order("code", { ascending: true })
    if (accErr) {
      return { success: false, error: accErr.message || "No se pudo cargar el plan de cuentas." }
    }
    const accountTypes: AccountType[] = [
      "activo_corriente",
      "activo_no_corriente",
      "pasivo_corriente",
      "pasivo_no_corriente",
      "patrimonio_neto",
      "ingresos",
      "costos",
      "gastos",
    ]
    const natures: AccountNature[] = ["deudora", "acreedora"]
    const accounts: ChartAccountRow[] = (accRows || []).map((r) => {
      const at = String(r.account_type ?? "")
      const nt = String(r.nature ?? "")
      const pid = r.parent_id
      return {
        id: String(r.id),
        parentId:
          pid != null && String(pid).length > 0 ? String(pid) : null,
        code: String(r.code ?? ""),
        name: String(r.name ?? ""),
        accountType: accountTypes.includes(at as AccountType)
          ? (at as AccountType)
          : "gastos",
        nature: natures.includes(nt as AccountNature)
          ? (nt as AccountNature)
          : "deudora",
        level: Number(r.level ?? 1) || 1,
        isMovementAccount: Boolean(r.is_movement_account),
      }
    })
    const { count: journalCount, error: jErr } = await supabase
      .from("accounting_entries")
      .select("id", { count: "exact", head: true })
      .eq("pop_id", popId)
    if (jErr) {
      return { success: false, error: jErr.message || "No se pudo consultar el libro diario." }
    }
    return {
      success: true,
      popName,
      accounts,
      canReadAccounts,
      canCreate,
      canReadJournal: canReadAccounts,
      journalEntryCount: journalCount ?? 0,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export type JournalEntrySummaryRow = {
  id: string
  entryNumber: number
  entryDate: string
  description: string
  sourceType: string
  totalDebit: number
  totalCredit: number
}

export type JournalEntryLineRow = {
  id: string
  accountCode: string
  accountName: string
  debitAmount: number
  creditAmount: number
  lineDescription: string | null
}

export type LedgerMovementRow = {
  id: string
  entryDate: string
  entryNumber: number
  entryDescription: string
  debitAmount: number
  creditAmount: number
  runningBalance: number
}

export type TrialBalanceRow = {
  accountCode: string
  accountName: string
  accountType: AccountType
  sumDebit: number
  sumCredit: number
  balance: number
}

export type FinancialSummaryRow = {
  label: string
  total: number
  accountTypes: AccountType[]
}

export type BalanceSheetSectionRow = {
  accountCode: string
  accountName: string
  balance: number
}

export type BalanceSheetSection = {
  key: "activo" | "pasivo" | "patrimonio"
  title: string
  rows: BalanceSheetSectionRow[]
  sectionTotal: number
}

export type BalanceSheetResult = {
  asOf: string
  sections: BalanceSheetSection[]
  resultadoAcumulado: number
  totalActivo: number
  totalPasivo: number
  totalPatrimonioCuentas: number
  totalPasivoPatrimonioYResultado: number
  diferenciaCuadre: number
}

export type IncomeStatementLine = {
  accountCode: string
  accountName: string
  accountType: AccountType
  balance: number
}

export type IncomeStatementResult = {
  from: string
  to: string
  ingresos: IncomeStatementLine[]
  costos: IncomeStatementLine[]
  gastos: IncomeStatementLine[]
  totalIngresos: number
  totalCostos: number
  totalGastos: number
  resultadoNeto: number
}

export type CashFlowRow = {
  accountCode: string
  accountName: string
  entityName: string | null
  entradas: number
  salidas: number
  neto: number
}

export type VatPositionRow = {
  accountCode: string
  accountName: string
  accountType: AccountType
  sumDebit: number
  sumCredit: number
  balance: number
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

async function fetchTrialBalanceForEntryIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  _popId: string,
  entryIds: string[],
): Promise<TrialBalanceRow[] | { error: string }> {
  if (entryIds.length === 0) {
    return []
  }
  const { data: lines, error: lErr } = await supabase
    .from("accounting_entry_lines")
    .select(
      `
      account_id,
      debit_amount,
      credit_amount,
      accounting_chart_of_accounts ( code, name, account_type, nature )
    `,
    )
    .in("entry_id", entryIds)
  if (lErr) {
    return { error: lErr.message || "No se pudieron cargar líneas." }
  }
  const accountTypes: AccountType[] = [
    "activo_corriente",
    "activo_no_corriente",
    "pasivo_corriente",
    "pasivo_no_corriente",
    "patrimonio_neto",
    "ingresos",
    "costos",
    "gastos",
  ]
  const agg = new Map<
    string,
    {
      code: string
      name: string
      accountType: AccountType
      nature: AccountNature
      debit: number
      credit: number
    }
  >()
  for (const ln of lines || []) {
    const acc = ln.accounting_chart_of_accounts as unknown as {
      code?: string
      name?: string
      account_type?: string
      nature?: string
    } | null
    const aid = String(ln.account_id)
    const d = Number(ln.debit_amount ?? 0)
    const c = Number(ln.credit_amount ?? 0)
    const at = String(acc?.account_type ?? "gastos")
    const nt = String(acc?.nature ?? "deudora")
    const prev = agg.get(aid) ?? {
      code: acc?.code ? String(acc.code) : "",
      name: acc?.name ? String(acc.name) : "",
      accountType: accountTypes.includes(at as AccountType)
        ? (at as AccountType)
        : "gastos",
      nature: nt === "acreedora" ? "acreedora" : "deudora",
      debit: 0,
      credit: 0,
    }
    prev.debit += d
    prev.credit += c
    agg.set(aid, prev)
  }
  return [...agg.values()]
    .map((v) => {
      const balance =
        v.nature === "deudora"
          ? roundMoney(v.debit - v.credit)
          : roundMoney(v.credit - v.debit)
      return {
        accountCode: v.code,
        accountName: v.name,
        accountType: v.accountType,
        sumDebit: roundMoney(v.debit),
        sumCredit: roundMoney(v.credit),
        balance,
      }
    })
    .sort((a, b) =>
      a.accountCode.localeCompare(b.accountCode, undefined, { numeric: true }),
    )
}

async function trialBalanceRowsForPopDateRange(
  popId: string,
  fromDate: string | null,
  toDate: string | null,
  throughDateOnly: string | null,
): Promise<{ success: true; rows: TrialBalanceRow[] } | { success: false; error: string }> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso" }
  }
  const snap = await loadPopPermissionsSnapshot(popId)
  if (
    !permissionKeysInclude(
      snap.keys,
      POP_PERMS.ACCOUNTING_READ.resource,
      POP_PERMS.ACCOUNTING_READ.action,
    )
  ) {
    return { success: false, error: "Sin permiso." }
  }
  const supabase = await createClient()
  let entQ = supabase
    .from("accounting_entries")
    .select("id")
    .eq("pop_id", popId)
    .eq("status", "posted")
  if (throughDateOnly && throughDateOnly.trim()) {
    entQ = entQ.lte("entry_date", throughDateOnly.trim())
  } else {
    if (fromDate && fromDate.trim()) {
      entQ = entQ.gte("entry_date", fromDate.trim())
    }
    if (toDate && toDate.trim()) {
      entQ = entQ.lte("entry_date", toDate.trim())
    }
  }
  const { data: postedEntries, error: eErr } = await entQ
  if (eErr) {
    return { success: false, error: eErr.message || "No se pudieron listar asientos." }
  }
  const entryIds = (postedEntries || []).map((e) => String(e.id))
  const raw = await fetchTrialBalanceForEntryIds(supabase, popId, entryIds)
  if (Array.isArray(raw)) {
    return { success: true, rows: raw }
  }
  return { success: false, error: raw.error }
}

const JOURNAL_ENTRIES_DEFAULT_LIMIT = 200
const JOURNAL_ENTRIES_PAGE_SIZE_DEFAULT = 40
const JOURNAL_ENTRIES_PAGE_SIZE_MAX = 100
const JOURNAL_ENTRY_ID_CHUNK = 400

function applyPostedEntryDateFilters<
  T extends {
    gte: (column: string, value: string) => T
    lte: (column: string, value: string) => T
  },
>(query: T, fromDate: string | null, toDate: string | null): T {
  let next = query
  if (fromDate && fromDate.trim()) {
    next = next.gte("entry_date", fromDate.trim())
  }
  if (toDate && toDate.trim()) {
    next = next.lte("entry_date", toDate.trim())
  }
  return next
}

async function sumJournalPeriodTotals(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  fromDate: string | null,
  toDate: string | null,
): Promise<
  { totalDebit: number; totalCredit: number } | { error: string }
> {
  let entQ = supabase
    .from("accounting_entries")
    .select("id")
    .eq("pop_id", popId)
    .eq("status", "posted")
  entQ = applyPostedEntryDateFilters(entQ, fromDate, toDate)
  const { data: entries, error: eErr } = await entQ
  if (eErr) {
    return {
      error: eErr.message || "No se pudieron calcular los totales del período.",
    }
  }
  const ids = (entries || []).map((entry) => String(entry.id))
  if (ids.length === 0) {
    return { totalDebit: 0, totalCredit: 0 }
  }

  let totalDebit = 0
  let totalCredit = 0
  for (let i = 0; i < ids.length; i += JOURNAL_ENTRY_ID_CHUNK) {
    const chunk = ids.slice(i, i + JOURNAL_ENTRY_ID_CHUNK)
    const { data: lines, error: lErr } = await supabase
      .from("accounting_entry_lines")
      .select("debit_amount, credit_amount")
      .in("entry_id", chunk)
    if (lErr) {
      return {
        error: lErr.message || "No se pudieron calcular los totales del período.",
      }
    }
    for (const line of lines || []) {
      totalDebit += Number(line.debit_amount ?? 0)
      totalCredit += Number(line.credit_amount ?? 0)
    }
  }

  return {
    totalDebit: roundMoney(totalDebit),
    totalCredit: roundMoney(totalCredit),
  }
}

export async function getAccountingJournalEntries(
  popId: string,
  fromDate: string | null,
  toDate: string | null,
  options?: { limit?: number; offset?: number },
): Promise<
  | {
      success: true
      entries: JournalEntrySummaryRow[]
      hasMore: boolean
      totalCount?: number
      periodTotalDebit?: number
      periodTotalCredit?: number
    }
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
        POP_PERMS.ACCOUNTING_READ.resource,
        POP_PERMS.ACCOUNTING_READ.action,
      )
    ) {
      return { success: false, error: "Sin permiso para ver el libro diario." }
    }
    const supabase = await createClient()
    const paginated = options != null
    const offset = paginated ? Math.max(options.offset ?? 0, 0) : 0
    const pageSize = paginated
      ? Math.min(
          Math.max(options.limit ?? JOURNAL_ENTRIES_PAGE_SIZE_DEFAULT, 1),
          JOURNAL_ENTRIES_PAGE_SIZE_MAX,
        )
      : JOURNAL_ENTRIES_DEFAULT_LIMIT

    const applyDateFilters = applyPostedEntryDateFilters

    let totalCount: number | undefined
    let periodTotalDebit: number | undefined
    let periodTotalCredit: number | undefined
    if (paginated && offset === 0) {
      let countQuery = supabase
        .from("accounting_entries")
        .select("id", { count: "exact", head: true })
        .eq("pop_id", popId)
        .eq("status", "posted")
      countQuery = applyDateFilters(countQuery)
      const [countResult, totalsResult] = await Promise.all([
        countQuery,
        sumJournalPeriodTotals(supabase, popId, fromDate, toDate),
      ])
      const { count, error: countErr } = countResult
      if (countErr) {
        return {
          success: false,
          error: countErr.message || "No se pudieron cargar los asientos.",
        }
      }
      if ("error" in totalsResult) {
        return { success: false, error: totalsResult.error }
      }
      totalCount = count ?? 0
      periodTotalDebit = totalsResult.totalDebit
      periodTotalCredit = totalsResult.totalCredit
    }

    let q = supabase
      .from("accounting_entries")
      .select("id, entry_number, entry_date, description, source_type, status")
      .eq("pop_id", popId)
      .eq("status", "posted")
      .order("entry_date", { ascending: false })
      .order("entry_number", { ascending: false })

    q = applyDateFilters(q)

    if (paginated) {
      q = q.range(offset, offset + pageSize)
    } else {
      q = q.limit(pageSize)
    }

    const { data: entries, error: eErr } = await q
    if (eErr) {
      return { success: false, error: eErr.message || "No se pudieron cargar los asientos." }
    }
    const rawList = entries || []
    const hasMore = paginated ? rawList.length > pageSize : false
    const list = paginated ? rawList.slice(0, pageSize) : rawList
    if (list.length === 0) {
      return {
        success: true,
        entries: [],
        hasMore: false,
        totalCount: paginated ? (totalCount ?? 0) : 0,
        ...(paginated && offset === 0
          ? {
              periodTotalDebit: periodTotalDebit ?? 0,
              periodTotalCredit: periodTotalCredit ?? 0,
            }
          : {}),
      }
    }
    const ids = list.map((e) => String(e.id))
    const { data: lines, error: lErr } = await supabase
      .from("accounting_entry_lines")
      .select("entry_id, debit_amount, credit_amount")
      .in("entry_id", ids)
    if (lErr) {
      return { success: false, error: lErr.message || "No se pudieron cargar las líneas." }
    }
    const debitByEntry = new Map<string, number>()
    const creditByEntry = new Map<string, number>()
    for (const ln of lines || []) {
      const eid = String(ln.entry_id)
      const d = Number(ln.debit_amount ?? 0)
      const c = Number(ln.credit_amount ?? 0)
      debitByEntry.set(eid, (debitByEntry.get(eid) ?? 0) + d)
      creditByEntry.set(eid, (creditByEntry.get(eid) ?? 0) + c)
    }
    const rows: JournalEntrySummaryRow[] = list.map((e) => {
      const id = String(e.id)
      return {
        id,
        entryNumber: Number(e.entry_number ?? 0),
        entryDate: String(e.entry_date ?? ""),
        description: String(e.description ?? ""),
        sourceType: String(e.source_type ?? ""),
        totalDebit: roundMoney(debitByEntry.get(id) ?? 0),
        totalCredit: roundMoney(creditByEntry.get(id) ?? 0),
      }
    })
    return {
      success: true,
      entries: rows,
      hasMore,
      ...(paginated && offset === 0
        ? {
            totalCount: totalCount ?? rows.length,
            periodTotalDebit: periodTotalDebit ?? 0,
            periodTotalCredit: periodTotalCredit ?? 0,
          }
        : {}),
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getAccountingEntryLines(
  popId: string,
  entryId: string,
): Promise<
  | { success: true; lines: JournalEntryLineRow[] }
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
        POP_PERMS.ACCOUNTING_READ.resource,
        POP_PERMS.ACCOUNTING_READ.action,
      )
    ) {
      return { success: false, error: "Sin permiso." }
    }
    const supabase = await createClient()
    const { data: entry, error: entErr } = await supabase
      .from("accounting_entries")
      .select("id")
      .eq("id", entryId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (entErr || !entry) {
      return { success: false, error: "Asiento no encontrado." }
    }
    const { data: lines, error: lErr } = await supabase
      .from("accounting_entry_lines")
      .select(
        `
        id,
        debit_amount,
        credit_amount,
        description,
        line_order,
        accounting_chart_of_accounts ( code, name )
      `,
      )
      .eq("entry_id", entryId)
      .order("line_order", { ascending: true })
    if (lErr) {
      return { success: false, error: lErr.message || "No se pudieron cargar las líneas." }
    }
    const rows: JournalEntryLineRow[] = (lines || []).map((r) => {
      const acc = r.accounting_chart_of_accounts as unknown as {
        code?: string
        name?: string
      } | null
      return {
        id: String(r.id),
        accountCode: acc?.code ? String(acc.code) : "—",
        accountName: acc?.name ? String(acc.name) : "—",
        debitAmount: roundMoney(Number(r.debit_amount ?? 0)),
        creditAmount: roundMoney(Number(r.credit_amount ?? 0)),
        lineDescription: r.description != null ? String(r.description) : null,
      }
    })
    return { success: true, lines: rows }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getAccountingLedgerForAccount(
  popId: string,
  accountCode: string,
  fromDate: string | null,
  toDate: string | null,
): Promise<
  | {
      success: true
      accountName: string
      nature: AccountNature
      rows: LedgerMovementRow[]
    }
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
        POP_PERMS.ACCOUNTING_READ.resource,
        POP_PERMS.ACCOUNTING_READ.action,
      )
    ) {
      return { success: false, error: "Sin permiso." }
    }
    const code = accountCode.trim()
    if (!code) {
      return { success: false, error: "Indicá un código de cuenta." }
    }
    const supabase = await createClient()
    const { data: acc, error: aErr } = await supabase
      .from("accounting_chart_of_accounts")
      .select("id, name, nature")
      .eq("pop_id", popId)
      .eq("code", code)
      .maybeSingle()
    if (aErr || !acc) {
      return { success: false, error: "No hay cuenta con ese código en este punto." }
    }
    const accountId = String(acc.id)
    const natureStr = String(acc.nature ?? "deudora")
    const nature: AccountNature =
      natureStr === "acreedora" ? "acreedora" : "deudora"
    const { data: lines, error: lErr } = await supabase
      .from("accounting_entry_lines")
      .select("id, entry_id, debit_amount, credit_amount, description")
      .eq("account_id", accountId)
    if (lErr) {
      return { success: false, error: lErr.message || "No se pudieron cargar movimientos." }
    }
    const entryIds = [...new Set((lines || []).map((l) => String(l.entry_id)))]
    if (entryIds.length === 0) {
      return {
        success: true,
        accountName: String(acc.name ?? ""),
        nature,
        rows: [],
      }
    }
    let entQ = supabase
      .from("accounting_entries")
      .select("id, entry_date, entry_number, description, status")
      .eq("pop_id", popId)
      .eq("status", "posted")
      .in("id", entryIds)
    if (fromDate && fromDate.trim()) {
      entQ = entQ.gte("entry_date", fromDate.trim())
    }
    if (toDate && toDate.trim()) {
      entQ = entQ.lte("entry_date", toDate.trim())
    }
    const { data: entries, error: eErr } = await entQ
    if (eErr) {
      return { success: false, error: eErr.message || "No se pudieron cargar asientos." }
    }
    const entryById = new Map(
      (entries || []).map((e) => [
        String(e.id),
        {
          entryDate: String(e.entry_date ?? ""),
          entryNumber: Number(e.entry_number ?? 0),
          description: String(e.description ?? ""),
        },
      ]),
    )
    const allowed = new Set(entryById.keys())
    const filtered = (lines || []).filter((l) => allowed.has(String(l.entry_id)))
    filtered.sort((a, b) => {
      const ea = entryById.get(String(a.entry_id))
      const eb = entryById.get(String(b.entry_id))
      if (!ea || !eb) return 0
      const da = ea.entryDate.localeCompare(eb.entryDate)
      if (da !== 0) return da
      return ea.entryNumber - eb.entryNumber
    })
    let running = 0
    const rows: LedgerMovementRow[] = filtered.map((l) => {
      const d = Number(l.debit_amount ?? 0)
      const c = Number(l.credit_amount ?? 0)
      const meta = entryById.get(String(l.entry_id))
      if (nature === "deudora") {
        running += d - c
      } else {
        running += c - d
      }
      return {
        id: String(l.id),
        entryDate: meta?.entryDate ?? "",
        entryNumber: meta?.entryNumber ?? 0,
        entryDescription: meta?.description ?? "",
        debitAmount: roundMoney(d),
        creditAmount: roundMoney(c),
        runningBalance: roundMoney(running),
      }
    })
    return {
      success: true,
      accountName: String(acc.name ?? ""),
      nature,
      rows,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getAccountingTrialBalance(
  popId: string,
  fromDate: string | null,
  toDate: string | null,
): Promise<
  | { success: true; rows: TrialBalanceRow[] }
  | { success: false; error: string }
> {
  try {
    return await trialBalanceRowsForPopDateRange(popId, fromDate, toDate, null)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getAccountingBalanceSheet(
  popId: string,
  asOfDate: string | null,
): Promise<
  | { success: true; data: BalanceSheetResult }
  | { success: false; error: string }
> {
  try {
    const d = asOfDate?.trim()
    if (!d) {
      return { success: false, error: "Indicá la fecha de corte del balance." }
    }
    const tb = await trialBalanceRowsForPopDateRange(popId, null, null, d)
    if (!tb.success) {
      return { success: false, error: tb.error }
    }
    const rows = tb.rows
    const isActivo = (t: AccountType) =>
      t === "activo_corriente" || t === "activo_no_corriente"
    const isPasivo = (t: AccountType) =>
      t === "pasivo_corriente" || t === "pasivo_no_corriente"
    const sumBal = (pred: (t: AccountType) => boolean) =>
      roundMoney(rows.filter((r) => pred(r.accountType)).reduce((a, r) => a + r.balance, 0))
    const linesFor = (pred: (t: AccountType) => boolean): BalanceSheetSectionRow[] =>
      rows
        .filter((r) => pred(r.accountType))
        .map((r) => ({
          accountCode: r.accountCode,
          accountName: r.accountName,
          balance: r.balance,
        }))
    const totalIngresos = sumBal((t) => t === "ingresos")
    const totalCostos = sumBal((t) => t === "costos")
    const totalGastos = sumBal((t) => t === "gastos")
    const resultadoAcumulado = roundMoney(
      totalIngresos - totalCostos - totalGastos,
    )
    const totalActivo = sumBal(isActivo)
    const totalPasivo = sumBal(isPasivo)
    const totalPatrimonioCuentas = sumBal((t) => t === "patrimonio_neto")
    const totalPasivoPatrimonioYResultado = roundMoney(
      totalPasivo + totalPatrimonioCuentas + resultadoAcumulado,
    )
    const diferenciaCuadre = roundMoney(
      totalActivo - totalPasivoPatrimonioYResultado,
    )
    const sections: BalanceSheetSection[] = [
      {
        key: "activo",
        title: "Activo",
        rows: linesFor(isActivo),
        sectionTotal: totalActivo,
      },
      {
        key: "pasivo",
        title: "Pasivo",
        rows: linesFor(isPasivo),
        sectionTotal: totalPasivo,
      },
      {
        key: "patrimonio",
        title: "Patrimonio neto",
        rows: [
          ...linesFor((t) => t === "patrimonio_neto"),
          {
            accountCode: "—",
            accountName: "Resultado acumulado (cuentas de resultado)",
            balance: resultadoAcumulado,
          },
        ],
        sectionTotal: roundMoney(totalPatrimonioCuentas + resultadoAcumulado),
      },
    ]
    return {
      success: true,
      data: {
        asOf: d,
        sections,
        resultadoAcumulado,
        totalActivo,
        totalPasivo,
        totalPatrimonioCuentas,
        totalPasivoPatrimonioYResultado,
        diferenciaCuadre,
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getAccountingIncomeStatement(
  popId: string,
  fromDate: string | null,
  toDate: string | null,
): Promise<
  | { success: true; data: IncomeStatementResult }
  | { success: false; error: string }
> {
  try {
    const tb = await trialBalanceRowsForPopDateRange(popId, fromDate, toDate, null)
    if (!tb.success) {
      return { success: false, error: tb.error }
    }
    const rows = tb.rows
    const pick = (t: AccountType): IncomeStatementLine[] =>
      rows
        .filter((r) => r.accountType === t)
        .map((r) => ({
          accountCode: r.accountCode,
          accountName: r.accountName,
          accountType: r.accountType,
          balance: r.balance,
        }))
    const ingresos = pick("ingresos")
    const costos = pick("costos")
    const gastos = pick("gastos")
    const totalIngresos = roundMoney(
      ingresos.reduce((a, r) => a + r.balance, 0),
    )
    const totalCostos = roundMoney(costos.reduce((a, r) => a + r.balance, 0))
    const totalGastos = roundMoney(gastos.reduce((a, r) => a + r.balance, 0))
    const resultadoNeto = roundMoney(
      totalIngresos - totalCostos - totalGastos,
    )
    return {
      success: true,
      data: {
        from: fromDate?.trim() ?? "",
        to: toDate?.trim() ?? "",
        ingresos,
        costos,
        gastos,
        totalIngresos,
        totalCostos,
        totalGastos,
        resultadoNeto,
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

function isCashEquivalentAccountCode(code: string): boolean {
  const c = code.trim()
  return c.startsWith("1.1.1.")
}

async function treasuryEntityNameByChartCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("treasury_accounts")
    .select(
      `
      parent_treasury_account_id,
      accounting_chart_of_accounts ( code )
    `,
    )
    .eq("pop_id", popId)
    .not("parent_treasury_account_id", "is", null)

  if (error || !data?.length) {
    return new Map()
  }

  const parentIds = [
    ...new Set(
      data
        .map((row) =>
          row.parent_treasury_account_id != null
            ? String(row.parent_treasury_account_id)
            : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ]

  const parentNames = new Map<string, string>()
  if (parentIds.length > 0) {
    const { data: parents } = await supabase
      .from("treasury_accounts")
      .select("id, name")
      .eq("pop_id", popId)
      .in("id", parentIds)
    for (const parent of parents || []) {
      if (parent.id) {
        parentNames.set(String(parent.id), String(parent.name ?? "").trim())
      }
    }
  }

  const out = new Map<string, string>()
  for (const row of data) {
    const chart = row.accounting_chart_of_accounts as unknown as {
      code?: string
    } | null
    const code = chart?.code?.trim()
    const parentId =
      row.parent_treasury_account_id != null
        ? String(row.parent_treasury_account_id)
        : null
    if (!code || !parentId) continue
    const entityName = parentNames.get(parentId)
    if (entityName) out.set(code, entityName)
  }
  return out
}

function isVatRelatedAccountCode(code: string): boolean {
  const c = code.trim()
  return c.startsWith("1.1.2.") || c.startsWith("2.1.2.")
}

export async function getAccountingCashFlow(
  popId: string,
  fromDate: string | null,
  toDate: string | null,
): Promise<
  | { success: true; rows: CashFlowRow[] }
  | { success: false; error: string }
> {
  try {
    const tb = await trialBalanceRowsForPopDateRange(popId, fromDate, toDate, null)
    if (!tb.success) {
      return { success: false, error: tb.error }
    }
    const supabase = await createClient()
    const entityByChartCode = await treasuryEntityNameByChartCode(supabase, popId)
    const rows: CashFlowRow[] = tb.rows
      .filter((r) => isCashEquivalentAccountCode(r.accountCode))
      .map((r) => ({
        accountCode: r.accountCode,
        accountName: r.accountName,
        entityName: entityByChartCode.get(r.accountCode.trim()) ?? null,
        entradas: r.sumDebit,
        salidas: r.sumCredit,
        neto: r.balance,
      }))
    return { success: true, rows }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getAccountingVatPosition(
  popId: string,
  fromDate: string | null,
  toDate: string | null,
): Promise<
  | { success: true; rows: VatPositionRow[] }
  | { success: false; error: string }
> {
  try {
    const tb = await trialBalanceRowsForPopDateRange(popId, fromDate, toDate, null)
    if (!tb.success) {
      return { success: false, error: tb.error }
    }
    const rows: VatPositionRow[] = tb.rows
      .filter((r) => isVatRelatedAccountCode(r.accountCode))
      .map((r) => ({
        accountCode: r.accountCode,
        accountName: r.accountName,
        accountType: r.accountType,
        sumDebit: r.sumDebit,
        sumCredit: r.sumCredit,
        balance: r.balance,
      }))
    return { success: true, rows }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getAccountingFinancialSummaries(
  popId: string,
  fromDate: string | null,
  toDate: string | null,
): Promise<
  | { success: true; summaries: FinancialSummaryRow[] }
  | { success: false; error: string }
> {
  const tb = await getAccountingTrialBalance(popId, fromDate, toDate)
  if (!tb.success) {
    return { success: false, error: tb.error }
  }
  const sum = (types: AccountType[]) =>
    roundMoney(
      tb.rows
        .filter((r) => types.includes(r.accountType))
        .reduce((a, r) => a + r.balance, 0),
    )
  const summaries: FinancialSummaryRow[] = [
    {
      label: "Activo (total)",
      total: sum(["activo_corriente", "activo_no_corriente"]),
      accountTypes: ["activo_corriente", "activo_no_corriente"],
    },
    {
      label: "Pasivo (total)",
      total: sum(["pasivo_corriente", "pasivo_no_corriente"]),
      accountTypes: ["pasivo_corriente", "pasivo_no_corriente"],
    },
    {
      label: "Patrimonio neto (total)",
      total: sum(["patrimonio_neto"]),
      accountTypes: ["patrimonio_neto"],
    },
    {
      label: "Ingresos (total)",
      total: sum(["ingresos"]),
      accountTypes: ["ingresos"],
    },
    {
      label: "Costos (total)",
      total: sum(["costos"]),
      accountTypes: ["costos"],
    },
    {
      label: "Gastos (total)",
      total: sum(["gastos"]),
      accountTypes: ["gastos"],
    },
  ]
  return { success: true, summaries }
}

export async function createChartAccount(
  popId: string,
  input: CreateChartAccountInput,
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
        POP_PERMS.ACCOUNTING_CREATE.resource,
        POP_PERMS.ACCOUNTING_CREATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para crear cuentas." }
    }
    const code = input.code.trim()
    const name = input.name.trim()
    if (!code || !name) {
      return { success: false, error: "Código y nombre son obligatorios." }
    }
    const level = Math.trunc(Number(input.level))
    if (!Number.isFinite(level) || level < 1) {
      return { success: false, error: "Nivel inválido." }
    }
    const supabase = await createClient()
    const { error } = await supabase.from("accounting_chart_of_accounts").insert({
      pop_id: popId,
      code,
      name,
      account_type: input.accountType,
      nature: input.nature,
      level,
      is_movement_account: input.isMovementAccount,
      parent_id: null,
      metadata: { user_created: true },
    })
    if (error) {
      return { success: false, error: error.message || "No se pudo crear la cuenta." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
