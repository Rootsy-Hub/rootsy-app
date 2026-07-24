"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { validatePopAccess } from "@/lib/popHelpers"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { postTreasurySettlementLedger } from "@/lib/treasurySettlementPosting"
import { resolveTreasuryAccountLedgerAccountId } from "@/lib/treasuryAccountResolve"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { parseBankStatementCsv } from "@/lib/parseBankStatementCsv"
import { type TreasuryAccountKind } from "@/lib/treasuryAccountKinds"
import { createClient } from "@/utils/supabase/server"

export type TreasurySettlementRow = {
  id: string
  amount: number
  settledAt: string
  notes: string
  fundingMethodName: string | null
}

export type PaymentMethodMovementRow = {
  id: string
  movementRefId: string
  kind: "sale" | "purchase" | "expense" | "card_settlement" | "funding_out"
  date: string
  amount: number
  label: string
  direction: "in" | "out"
  reconciled: boolean
  linkedStatementLineId: string | null
  sourceAccountName?: string | null
}

export type TreasuryAccountDetailOptions = {
  dateFrom?: string
  dateTo?: string
  /** Incluye movimientos de cuentas hijas (POS, tarjetas) además de la principal. */
  includeRelatedAccounts?: boolean
  relatedTreasuryAccountIds?: string[]
}

export type BankStatementLineRow = {
  id: string
  lineDate: string
  description: string
  amount: number
  direction: "in" | "out"
  source: "manual" | "csv"
  reconciled: boolean
}

export type TreasuryAccountDetailResult = {
  settlements: TreasurySettlementRow[]
  movements: PaymentMethodMovementRow[]
  movementTotals: { in: number; out: number; net: number }
  statementLines: BankStatementLineRow[]
  supportsBankReconciliation: boolean
  reconciliationSummary: {
    movementsReconciled: number
    movementsPending: number
    statementReconciled: number
    statementPending: number
    statementTotalIn: number
    statementTotalOut: number
  }
}

export type RecordTreasurySettlementForAccountInput = {
  cardTreasuryAccountId: string
  fundingTreasuryAccountId: string
  amount: number
  settledAt: string
  notes?: string
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function parseAmount(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return roundMoney(n)
}

function parseTreasuryKind(v: unknown): TreasuryAccountKind {
  const k = String(v ?? "other")
  if (k === "cash" || k === "bank" || k === "wallet" || k === "card_payable") {
    return k
  }
  return "other"
}

function movementRefId(
  kind: PaymentMethodMovementRow["kind"],
  id: string,
): string {
  if (kind === "funding_out" && id.startsWith("fund-")) {
    return id.slice(5)
  }
  return id
}

function enrichMovement(
  row: Omit<
    PaymentMethodMovementRow,
    "movementRefId" | "reconciled" | "linkedStatementLineId"
  >,
  markByKey: Map<string, { statementLineId: string | null }>,
): PaymentMethodMovementRow {
  const refId = movementRefId(row.kind, row.id)
  const mark = markByKey.get(`${row.kind}:${refId}`)
  return {
    ...row,
    movementRefId: refId,
    reconciled: Boolean(mark),
    linkedStatementLineId: mark?.statementLineId ?? null,
  }
}

async function requireTreasuryUpdate(
  popId: string,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { ok: false, error: access.error || "Sin acceso" }
  }
  const snap = await loadPopPermissionsSnapshot(popId)
  if (
    !permissionKeysInclude(
      snap.keys,
      POP_PERMS.PAYMENT_METHOD_UPDATE.resource,
      POP_PERMS.PAYMENT_METHOD_UPDATE.action,
    )
  ) {
    return { ok: false, error: "Sin permiso para conciliar movimientos." }
  }
  const user = await requireAuthenticatedUser()
  return { ok: true, userId: user.uid }
}

async function computeLifetimePaidOutForAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  treasuryAccountId: string,
): Promise<number> {
  let total = 0
  for (const table of ["purchase_payments", "expense_payments"] as const) {
    const { data } = await supabase
      .from(table)
      .select("amount")
      .eq("pop_id", popId)
      .eq("treasury_account_id", treasuryAccountId)
    for (const row of data || []) {
      total = roundMoney(total + parseAmount(row.amount))
    }
  }
  return total
}

async function computeSettledForAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
  treasuryAccountId: string,
): Promise<number> {
  const { data } = await supabase
    .from("treasury_settlements")
    .select("amount")
    .eq("pop_id", popId)
    .eq("card_treasury_account_id", treasuryAccountId)
  let total = 0
  for (const row of data || []) {
    total = roundMoney(total + parseAmount(row.amount))
  }
  return total
}

export async function getTreasuryAccountDetail(
  popId: string,
  treasuryAccountId: string,
  options?: TreasuryAccountDetailOptions,
): Promise<
  | { success: true; data: TreasuryAccountDetailResult }
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
        POP_PERMS.PAYMENT_METHOD_READ.resource,
        POP_PERMS.PAYMENT_METHOD_READ.action,
      )
    ) {
      return { success: false, error: "Sin permiso para ver esta cuenta." }
    }

    const taId = treasuryAccountId.trim()
    const supabase = await createClient()
    const { data: taRow, error: taErr } = await supabase
      .from("treasury_accounts")
      .select("id, kind, name")
      .eq("id", taId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (taErr || !taRow?.id) {
      return { success: false, error: "Cuenta no encontrada." }
    }

    const isCardPayable = parseTreasuryKind(taRow.kind) === "card_payable"
    const primaryName = String(taRow.name ?? "")

    const relatedIds = options?.includeRelatedAccounts
      ? (options.relatedTreasuryAccountIds ?? []).filter((id) => id && id !== taId)
      : []
    const movementAccountIds = [taId, ...relatedIds]

    const accountNames = new Map<string, string>()
    accountNames.set(taId, primaryName)
    if (relatedIds.length > 0) {
      const { data: nameRows } = await supabase
        .from("treasury_accounts")
        .select("id, name")
        .eq("pop_id", popId)
        .in("id", relatedIds)
      for (const r of nameRows || []) {
        accountNames.set(String(r.id), String(r.name ?? ""))
      }
    }

    const dateFrom = options?.dateFrom?.trim() ?? ""
    const dateTo = options?.dateTo?.trim() ?? ""
    const inDateRange = (iso: string) => {
      const d = iso.slice(0, 10)
      if (dateFrom && d < dateFrom) return false
      if (dateTo && d > dateTo) return false
      return true
    }

    const settlements: TreasurySettlementRow[] = []
    if (isCardPayable) {
      const { data: settleRows, error: settleErr } = await supabase
        .from("treasury_settlements")
        .select("id, amount, settled_at, notes, funding_treasury_account_id")
        .eq("pop_id", popId)
        .eq("card_treasury_account_id", taId)
        .order("settled_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50)

      if (settleErr) {
        return {
          success: false,
          error: settleErr.message || "No se pudieron cargar liquidaciones.",
        }
      }

      const fundingIds = [
        ...new Set(
          (settleRows || [])
            .map((r) =>
              r.funding_treasury_account_id
                ? String(r.funding_treasury_account_id)
                : "",
            )
            .filter(Boolean),
        ),
      ]
      const fundingNames = new Map<string, string>()
      if (fundingIds.length > 0) {
        const { data: fundRows } = await supabase
          .from("treasury_accounts")
          .select("id, name")
          .eq("pop_id", popId)
          .in("id", fundingIds)
        for (const f of fundRows || []) {
          fundingNames.set(String(f.id), String(f.name ?? ""))
        }
      }

      for (const r of settleRows || []) {
        const fid =
          r.funding_treasury_account_id != null
            ? String(r.funding_treasury_account_id)
            : ""
        settlements.push({
          id: String(r.id),
          amount: parseAmount(r.amount),
          settledAt: String(r.settled_at ?? "").slice(0, 10),
          notes: String(r.notes ?? ""),
          fundingMethodName: fid ? (fundingNames.get(fid) ?? null) : null,
        })
      }
    }

    const movements: Omit<
      PaymentMethodMovementRow,
      "movementRefId" | "reconciled" | "linkedStatementLineId"
    >[] = []

    const { data: spRows, error: spErr } = await supabase
      .from("sale_payments")
      .select(
        `
          id,
          amount,
          sale_id,
          treasury_account_id,
          sales!inner (
            sold_at,
            status,
            customer_name
          )
        `,
      )
      .eq("pop_id", popId)
      .in("treasury_account_id", movementAccountIds)
      .eq("sales.status", "completed")
      .limit(relatedIds.length > 0 ? 200 : 80)

    if (spErr) {
      return {
        success: false,
        error: spErr.message || "No se pudieron cargar cobros.",
      }
    }

    for (const r of spRows || []) {
      const sale = r.sales as unknown as {
        sold_at?: string
        customer_name?: string | null
      } | null
      const sourceTaId =
        r.treasury_account_id != null ? String(r.treasury_account_id) : taId
      const date = String(sale?.sold_at ?? "").slice(0, 10)
      if (!inDateRange(date)) continue
      movements.push({
        id: String(r.id),
        kind: "sale",
        date,
        amount: parseAmount(r.amount),
        label: sale?.customer_name?.trim() || "Venta",
        direction: "in",
        sourceAccountName:
          sourceTaId !== taId
            ? (accountNames.get(sourceTaId) ?? null)
            : null,
      })
    }

    const { data: ppRows, error: ppErr } = await supabase
      .from("purchase_payments")
      .select(
        `
          id,
          amount,
          paid_at,
          treasury_account_id,
          purchases (
            supplier_name,
            document_number
          )
        `,
      )
      .eq("pop_id", popId)
      .in("treasury_account_id", movementAccountIds)
      .order("paid_at", { ascending: false })
      .limit(relatedIds.length > 0 ? 120 : 40)

    if (ppErr) {
      return {
        success: false,
        error: ppErr.message || "No se pudieron cargar pagos de compras.",
      }
    }

    for (const r of ppRows || []) {
      const pur = r.purchases as unknown as {
        supplier_name?: string | null
        document_number?: string | null
      } | null
      const sourceTaId =
        r.treasury_account_id != null ? String(r.treasury_account_id) : taId
      const date = String(r.paid_at ?? "").slice(0, 10)
      if (!inDateRange(date)) continue
      movements.push({
        id: String(r.id),
        kind: "purchase",
        date,
        amount: parseAmount(r.amount),
        label:
          pur?.supplier_name?.trim() ||
          pur?.document_number?.trim() ||
          "Compra",
        direction: "out",
        sourceAccountName:
          sourceTaId !== taId
            ? (accountNames.get(sourceTaId) ?? null)
            : null,
      })
    }

    const { data: epRows, error: epErr } = await supabase
      .from("expense_payments")
      .select(
        `
          id,
          amount,
          paid_at,
          treasury_account_id,
          expenses (
            description
          )
        `,
      )
      .eq("pop_id", popId)
      .in("treasury_account_id", movementAccountIds)
      .order("paid_at", { ascending: false })
      .limit(relatedIds.length > 0 ? 120 : 40)

    if (epErr) {
      return {
        success: false,
        error: epErr.message || "No se pudieron cargar pagos de gastos.",
      }
    }

    for (const r of epRows || []) {
      const exp = r.expenses as unknown as { description?: string | null } | null
      const sourceTaId =
        r.treasury_account_id != null ? String(r.treasury_account_id) : taId
      const date = String(r.paid_at ?? "").slice(0, 10)
      if (!inDateRange(date)) continue
      movements.push({
        id: String(r.id),
        kind: "expense",
        date,
        amount: parseAmount(r.amount),
        label: exp?.description?.trim() || "Gasto",
        direction: "out",
        sourceAccountName:
          sourceTaId !== taId
            ? (accountNames.get(sourceTaId) ?? null)
            : null,
      })
    }

    if (!isCardPayable) {
      const { data: fundSettleRows } = await supabase
        .from("treasury_settlements")
        .select("id, amount, settled_at, notes, card_treasury_account_id")
        .eq("pop_id", popId)
        .eq("funding_treasury_account_id", taId)
        .order("settled_at", { ascending: false })
        .limit(30)

      const cardIds = [
        ...new Set(
          (fundSettleRows || [])
            .map((r) =>
              r.card_treasury_account_id
                ? String(r.card_treasury_account_id)
                : "",
            )
            .filter(Boolean),
        ),
      ]
      const cardNames = new Map<string, string>()
      if (cardIds.length > 0) {
        const { data: cardRows } = await supabase
          .from("treasury_accounts")
          .select("id, name")
          .eq("pop_id", popId)
          .in("id", cardIds)
        for (const c of cardRows || []) {
          cardNames.set(String(c.id), String(c.name ?? ""))
        }
      }

      for (const r of fundSettleRows || []) {
        const cid =
          r.card_treasury_account_id != null
            ? String(r.card_treasury_account_id)
            : ""
        const date = String(r.settled_at ?? "").slice(0, 10)
        if (!inDateRange(date)) continue
        movements.push({
          id: `fund-${String(r.id)}`,
          kind: "funding_out",
          date,
          amount: parseAmount(r.amount),
          label: `Resumen tarjeta — ${cardNames.get(cid) ?? "Tarjeta"}`,
          direction: "out",
        })
      }
    }

    movements.sort((a, b) => {
      const dc = b.date.localeCompare(a.date)
      if (dc !== 0) return dc
      return b.id.localeCompare(a.id)
    })

    const supportsBankReconciliation = !isCardPayable
    const markByKey = new Map<string, { statementLineId: string | null }>()
    const linkedStatementIds = new Set<string>()
    let statementLines: BankStatementLineRow[] = []

    if (supportsBankReconciliation) {
      const { data: markRows } = await supabase
        .from("treasury_reconciliation_marks")
        .select("movement_kind, movement_ref_id, statement_line_id")
        .eq("pop_id", popId)
        .eq("treasury_account_id", taId)

      for (const m of markRows || []) {
        const kind = String(m.movement_kind)
        const ref = String(m.movement_ref_id)
        const sid =
          m.statement_line_id != null ? String(m.statement_line_id) : null
        markByKey.set(`${kind}:${ref}`, { statementLineId: sid })
        if (sid) linkedStatementIds.add(sid)
      }

      const { data: stmtRows, error: stmtErr } = await supabase
        .from("bank_statement_lines")
        .select("id, line_date, description, amount, direction, source")
        .eq("pop_id", popId)
        .eq("treasury_account_id", taId)
        .order("line_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100)

      if (stmtErr) {
        return {
          success: false,
          error: stmtErr.message || "No se pudo cargar el extracto bancario.",
        }
      }

      statementLines = (stmtRows || []).map((r) => {
        const id = String(r.id)
        return {
          id,
          lineDate: String(r.line_date ?? "").slice(0, 10),
          description: String(r.description ?? ""),
          amount: parseAmount(r.amount),
          direction: String(r.direction) === "in" ? "in" : "out",
          source: String(r.source) === "csv" ? "csv" : "manual",
          reconciled: linkedStatementIds.has(id),
        }
      })
    }

    const enrichedMovements = movements
      .map((m) => enrichMovement(m, markByKey))
      .slice(0, relatedIds.length > 0 ? 100 : 60)

    let totalIn = 0
    let totalOut = 0
    for (const m of enrichedMovements) {
      if (m.direction === "in") totalIn = roundMoney(totalIn + m.amount)
      else totalOut = roundMoney(totalOut + m.amount)
    }

    let stmtIn = 0
    let stmtOut = 0
    let statementReconciled = 0
    for (const s of statementLines) {
      if (s.direction === "in") stmtIn = roundMoney(stmtIn + s.amount)
      else stmtOut = roundMoney(stmtOut + s.amount)
      if (s.reconciled) statementReconciled += 1
    }

    const movementsReconciled = enrichedMovements.filter((m) => m.reconciled).length

    return {
      success: true,
      data: {
        settlements,
        movements: enrichedMovements,
        movementTotals: {
          in: totalIn,
          out: totalOut,
          net: roundMoney(totalIn - totalOut),
        },
        statementLines,
        supportsBankReconciliation,
        reconciliationSummary: {
          movementsReconciled,
          movementsPending: enrichedMovements.length - movementsReconciled,
          statementReconciled,
          statementPending: statementLines.length - statementReconciled,
          statementTotalIn: stmtIn,
          statementTotalOut: stmtOut,
        },
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function importBankStatementCsv(
  popId: string,
  treasuryAccountId: string,
  csvText: string,
): Promise<
  | { success: true; imported: number; warnings: string[] }
  | { success: false; error: string }
> {
  try {
    const auth = await requireTreasuryUpdate(popId)
    if (!auth.ok) return { success: false, error: auth.error }

    const taId = treasuryAccountId.trim()
    const parsed = parseBankStatementCsv(csvText)
    if (parsed.lines.length === 0) {
      return {
        success: false,
        error:
          parsed.errors[0] ||
          "No se importó ninguna línea. Revisá el formato del CSV.",
      }
    }

    const supabase = await createClient()
    const { data: taRow, error: taErr } = await supabase
      .from("treasury_accounts")
      .select("id")
      .eq("id", taId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (taErr || !taRow?.id) {
      return { success: false, error: "Cuenta de tesorería inválida." }
    }

    const rows = parsed.lines.map((l) => ({
      pop_id: popId,
      treasury_account_id: taId,
      line_date: l.lineDate,
      description: l.description,
      amount: l.amount,
      direction: l.direction,
      source: "csv" as const,
      created_by: auth.userId,
    }))

    const { error } = await supabase.from("bank_statement_lines").insert(rows)
    if (error) {
      return { success: false, error: error.message || "No se pudo importar." }
    }

    return {
      success: true,
      imported: rows.length,
      warnings: parsed.errors,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function addManualBankStatementLine(
  popId: string,
  treasuryAccountId: string,
  input: {
    lineDate: string
    description: string
    amount: number
    direction: "in" | "out"
  },
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const auth = await requireTreasuryUpdate(popId)
    if (!auth.ok) return { success: false, error: auth.error }

    const lineDate = input.lineDate.trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lineDate)) {
      return { success: false, error: "Fecha inválida." }
    }
    const amt = roundMoney(Number(input.amount))
    if (!(amt > 0)) {
      return { success: false, error: "El importe debe ser mayor a cero." }
    }

    const supabase = await createClient()
    const taId = treasuryAccountId.trim()
    const { data: taRow, error: taErr } = await supabase
      .from("treasury_accounts")
      .select("id")
      .eq("id", taId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (taErr || !taRow?.id) {
      return { success: false, error: "Cuenta de tesorería inválida." }
    }

    const { data, error } = await supabase
      .from("bank_statement_lines")
      .insert({
        pop_id: popId,
        treasury_account_id: taId,
        line_date: lineDate,
        description: input.description.trim() || "Movimiento extracto",
        amount: amt,
        direction: input.direction,
        source: "manual",
        created_by: auth.userId,
      })
      .select("id")
      .single()

    if (error || !data?.id) {
      return { success: false, error: error?.message || "No se pudo guardar." }
    }
    return { success: true, id: String(data.id) }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function deleteBankStatementLine(
  popId: string,
  lineId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const auth = await requireTreasuryUpdate(popId)
    if (!auth.ok) return { success: false, error: auth.error }

    const supabase = await createClient()
    const { error } = await supabase
      .from("bank_statement_lines")
      .delete()
      .eq("id", lineId.trim())
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

export async function setMovementReconciliation(
  popId: string,
  treasuryAccountId: string,
  movementKind: PaymentMethodMovementRow["kind"],
  movementRefId: string,
  statementLineId?: string | null,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const auth = await requireTreasuryUpdate(popId)
    if (!auth.ok) return { success: false, error: auth.error }

    const kind = movementKind
    if (!["sale", "purchase", "expense", "funding_out"].includes(kind)) {
      return { success: false, error: "Tipo de movimiento inválido." }
    }
    const refId = movementRefId.trim()
    if (!refId) {
      return { success: false, error: "Referencia de movimiento inválida." }
    }

    const supabase = await createClient()
    const taId = treasuryAccountId.trim()
    let stmtId: string | null = statementLineId?.trim() || null

    if (stmtId) {
      const { data: stmtRow, error: stmtErr } = await supabase
        .from("bank_statement_lines")
        .select("id")
        .eq("id", stmtId)
        .eq("pop_id", popId)
        .eq("treasury_account_id", taId)
        .maybeSingle()
      if (stmtErr || !stmtRow) {
        return { success: false, error: "Línea de extracto inválida." }
      }
    }

    const { error } = await supabase.from("treasury_reconciliation_marks").upsert(
      {
        pop_id: popId,
        treasury_account_id: taId,
        movement_kind: kind,
        movement_ref_id: refId,
        statement_line_id: stmtId,
        reconciled_at: new Date().toISOString(),
        reconciled_by: auth.userId,
      },
      { onConflict: "pop_id,movement_kind,movement_ref_id" },
    )

    if (error) {
      return {
        success: false,
        error: error.message || "No se pudo marcar como conciliado.",
      }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function clearMovementReconciliation(
  popId: string,
  movementKind: PaymentMethodMovementRow["kind"],
  movementRefId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const auth = await requireTreasuryUpdate(popId)
    if (!auth.ok) return { success: false, error: auth.error }

    const supabase = await createClient()
    const { error } = await supabase
      .from("treasury_reconciliation_marks")
      .delete()
      .eq("pop_id", popId)
      .eq("movement_kind", movementKind)
      .eq("movement_ref_id", movementRefId.trim())
    if (error) {
      return { success: false, error: error.message || "No se pudo desmarcar." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function recordTreasurySettlementForAccount(
  popId: string,
  input: RecordTreasurySettlementForAccountInput,
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
        POP_PERMS.PAYMENT_METHOD_UPDATE.resource,
        POP_PERMS.PAYMENT_METHOD_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para registrar liquidaciones." }
    }

    const cardTaId = input.cardTreasuryAccountId?.trim()
    const fundTaId = input.fundingTreasuryAccountId?.trim()
    const settledAt = input.settledAt?.trim()
    const amt = roundMoney(Number(input.amount))

    if (!cardTaId) {
      return { success: false, error: "Elegí la tarjeta a liquidar." }
    }
    if (!fundTaId) {
      return { success: false, error: "Elegí desde qué cuenta vas a pagar." }
    }
    if (cardTaId === fundTaId) {
      return {
        success: false,
        error: "La cuenta de pago debe ser distinta de la tarjeta.",
      }
    }
    if (!(amt > 0)) {
      return { success: false, error: "El importe debe ser mayor a cero." }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(settledAt)) {
      return { success: false, error: "Fecha de pago inválida." }
    }

    const user = await requireAuthenticatedUser()
    const supabase = await createClient()

    const { data: cardTa, error: cardTaErr } = await supabase
      .from("treasury_accounts")
      .select("id, kind")
      .eq("id", cardTaId)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .maybeSingle()
    if (cardTaErr || !cardTa?.id) {
      return { success: false, error: "Tarjeta corporativa inválida." }
    }
    if (parseTreasuryKind(cardTa.kind) !== "card_payable") {
      return {
        success: false,
        error: "La cuenta seleccionada no es una tarjeta corporativa.",
      }
    }

    const { data: fundTa, error: fundTaErr } = await supabase
      .from("treasury_accounts")
      .select("id, kind")
      .eq("id", fundTaId)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .maybeSingle()
    if (fundTaErr || !fundTa?.id) {
      return { success: false, error: "Cuenta de fondeo inválida." }
    }
    if (parseTreasuryKind(fundTa.kind) === "card_payable") {
      return {
        success: false,
        error: "Pagá el resumen desde banco, efectivo o billetera.",
      }
    }

    const charged = await computeLifetimePaidOutForAccount(supabase, popId, cardTaId)
    const settled = await computeSettledForAccount(supabase, popId, cardTaId)
    const outstanding = roundMoney(charged - settled)
    if (amt > outstanding + 0.0001) {
      return {
        success: false,
        error: `El importe supera la deuda pendiente (${outstanding.toFixed(2)}).`,
      }
    }

    const { data: ins, error: insErr } = await supabase
      .from("treasury_settlements")
      .insert({
        pop_id: popId,
        card_treasury_account_id: cardTaId,
        funding_treasury_account_id: fundTaId,
        amount: amt,
        settled_at: settledAt,
        notes: input.notes?.trim() || "",
        created_by: user.uid,
      })
      .select("id")
      .single()

    if (insErr || !ins?.id) {
      return {
        success: false,
        error: insErr?.message || "No se pudo registrar la liquidación.",
      }
    }
    const settlementId = String(ins.id)

    const ledger = await postTreasurySettlementLedger(supabase, {
      popId,
      userId: user.uid,
      settlementId,
    })
    if (!ledger.success) {
      await supabase
        .from("treasury_settlements")
        .delete()
        .eq("id", settlementId)
        .eq("pop_id", popId)
      return { success: false, error: ledger.error }
    }

    return { success: true, id: settlementId }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export type RecordPosAcreditationInput = {
  posTreasuryAccountId: string
  motherTreasuryAccountId: string
  amount: number
  creditedAt: string
  notes?: string
}

async function nextAccountingEntryNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<number> {
  const { data: maxRow } = await supabase
    .from("accounting_entries")
    .select("entry_number")
    .eq("pop_id", popId)
    .order("entry_number", { ascending: false })
    .limit(1)
    .maybeSingle()
  return maxRow?.entry_number != null && Number.isFinite(Number(maxRow.entry_number))
    ? Number(maxRow.entry_number) + 1
    : 1
}

export async function recordPosAcreditationForAccount(
  popId: string,
  input: RecordPosAcreditationInput,
): Promise<{ success: true; entryId: string } | { success: false; error: string }> {
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
      return { success: false, error: "Sin permiso para registrar acreditaciones." }
    }

    const posTaId = input.posTreasuryAccountId?.trim()
    const motherTaId = input.motherTreasuryAccountId?.trim()
    const creditedAt = input.creditedAt?.trim()
    const amt = roundMoney(Number(input.amount))

    if (!posTaId || !motherTaId) {
      return { success: false, error: "Cuenta POS o madre inválida." }
    }
    if (!(amt > 0)) {
      return { success: false, error: "El importe debe ser mayor a cero." }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(creditedAt)) {
      return { success: false, error: "Fecha de acreditación inválida." }
    }

    const user = await requireAuthenticatedUser()
    const supabase = await createClient()

    const { data: posTa, error: posErr } = await supabase
      .from("treasury_accounts")
      .select("id, name, parent_treasury_account_id, kind")
      .eq("id", posTaId)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .maybeSingle()
    if (posErr || !posTa?.id) {
      return { success: false, error: "Terminal POS no encontrado." }
    }
    if (String(posTa.parent_treasury_account_id ?? "") !== motherTaId) {
      return {
        success: false,
        error: "El terminal no pertenece a esta cuenta madre.",
      }
    }

    const posLedgerId = await resolveTreasuryAccountLedgerAccountId(
      supabase,
      popId,
      posTaId,
    )
    const bankLedgerId = await resolveTreasuryAccountLedgerAccountId(
      supabase,
      popId,
      motherTaId,
    )
    if (!posLedgerId || !bankLedgerId) {
      return {
        success: false,
        error: "No se encontraron las cuentas contables vinculadas.",
      }
    }

    const posName = String(posTa.name ?? "POS").trim()
    const notes = input.notes?.trim() || ""
    const entryDescription = notes
      ? `Acreditación POS — ${posName} (${notes})`
      : `Acreditación POS — ${posName}`

    const nextNum = await nextAccountingEntryNumber(supabase, popId)
    const { data: entIns, error: entErr } = await supabase
      .from("accounting_entries")
      .insert({
        pop_id: popId,
        entry_number: nextNum,
        entry_date: creditedAt,
        source_type: "treasury_pos_acreditation",
        source_id: posTaId,
        description: entryDescription,
        status: "draft",
        created_by: user.uid,
      })
      .select("id")
      .single()

    if (entErr || !entIns?.id) {
      return { success: false, error: entErr?.message || "No se pudo crear el asiento." }
    }
    const entryId = String(entIns.id)

    const { error: linesErr } = await supabase.from("accounting_entry_lines").insert([
      {
        entry_id: entryId,
        account_id: bankLedgerId,
        debit_amount: amt,
        credit_amount: 0,
        description: entryDescription,
        line_order: 1,
      },
      {
        entry_id: entryId,
        account_id: posLedgerId,
        debit_amount: 0,
        credit_amount: amt,
        description: entryDescription,
        line_order: 2,
      },
    ])
    if (linesErr) {
      await supabase
        .from("accounting_entries")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", entryId)
      return { success: false, error: linesErr.message || "No se pudieron crear las líneas." }
    }

    const { error: postErr } = await supabase
      .from("accounting_entries")
      .update({
        status: "posted",
        posted_at: new Date().toISOString(),
        posted_by: user.uid,
      })
      .eq("id", entryId)
    if (postErr) {
      await supabase
        .from("accounting_entries")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", entryId)
      return { success: false, error: postErr.message || "No se pudo registrar el asiento." }
    }

    return { success: true, entryId }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
