import {
  CHART_ARQUEO_SOBRANTE_INGRESO_CODES,
  CHART_DIFERENCIA_ARQUEO_GASTO_CODES,
} from "@/lib/argV3DefaultChartAccounts"
import {
  formatTreasuryCloseLineLabel,
  parseCloseTreasuryLineKey,
  parseTreasuryCloseLineKey,
  roundMoney,
  treasuryCloseAccountKey,
  treasuryCloseLineKey,
} from "@/lib/cashRegisterCloseSettlement"
import { operationPaymentKindLabel } from "@/lib/operationPaymentKinds"
import { resolveLedgerAccountForTreasuryPayment } from "@/lib/treasuryPaymentLedger"
import { resolveTreasuryAccountLedgerAccountId } from "@/lib/treasuryAccountResolve"
import type { SupabaseClient } from "@supabase/supabase-js"

export type CloseAccountingLine = {
  account_id: string
  debit_amount: number
  credit_amount: number
  description: string | null
  line_order: number
}

export type SessionPaymentKindCobro = {
  total: number
  primaryTreasuryAccountId: string | null
}

function parseAmount(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return roundMoney(n)
}

async function resolveAccountIdByCodes(
  supabase: SupabaseClient,
  popId: string,
  codes: readonly string[],
): Promise<string | null> {
  for (const code of codes) {
    const { data: row } = await supabase
      .from("accounting_chart_of_accounts")
      .select("id")
      .eq("pop_id", popId)
      .eq("code", code)
      .maybeSingle()
    if (row?.id) return String(row.id)
  }
  return null
}

export type SessionCloseCobro = {
  key: string
  treasuryAccountId: string | null
  paymentKind: string
  accountName: string | null
  label: string
  total: number
}

export async function loadSessionCobrosForClose(
  supabase: SupabaseClient,
  popId: string,
  sessionId: string,
): Promise<SessionCloseCobro[]> {
  const { data: saleRows } = await supabase
    .from("sales")
    .select("id")
    .eq("pop_id", popId)
    .eq("cash_register_session_id", sessionId)
    .eq("status", "completed")

  const saleIds = (saleRows || []).map((row) => String(row.id))
  if (saleIds.length === 0) return []

  const { data: payRows } = await supabase
    .from("sale_payments")
    .select(
      "payment_kind, amount, treasury_account_id, treasury_accounts ( name, parent_treasury_account_id )",
    )
    .eq("pop_id", popId)
    .in("sale_id", saleIds)

  const byAccount = new Map<
    string,
    {
      treasuryAccountId: string
      accountName: string | null
      total: number
      kinds: Set<string>
    }
  >()
  const unassigned = new Map<
    string,
    { paymentKind: string; total: number }
  >()

  for (const row of payRows || []) {
    const kind = String(row.payment_kind ?? "other")
    if (kind === "cash") continue
    const amount = parseAmount(row.amount)
    if (amount <= 0) continue

    const treasuryAccountId =
      row.treasury_account_id != null
        ? String(row.treasury_account_id)
        : null

    if (!treasuryAccountId) {
      const key = treasuryCloseLineKey(null, kind)
      const existing = unassigned.get(key)
      if (existing) existing.total += amount
      else unassigned.set(key, { paymentKind: kind, total: amount })
      continue
    }

    const taRaw = row.treasury_accounts as
      | { name?: string; parent_treasury_account_id?: string | null }
      | Array<{ name?: string; parent_treasury_account_id?: string | null }>
      | null
    const ta = Array.isArray(taRaw) ? taRaw[0] : taRaw
    const accountName = ta?.name?.trim() ?? null

    const bucketKey = treasuryAccountId
    let bucket = byAccount.get(bucketKey)
    if (!bucket) {
      bucket = {
        treasuryAccountId,
        accountName,
        total: 0,
        kinds: new Set(),
      }
      byAccount.set(bucketKey, bucket)
    }
    bucket.total += amount
    bucket.kinds.add(kind)
    if (!bucket.accountName && accountName) bucket.accountName = accountName
  }

  const result: SessionCloseCobro[] = []

  for (const bucket of byAccount.values()) {
    const primaryKind = [...bucket.kinds].sort()[0] ?? "other"
    result.push({
      key: treasuryCloseAccountKey(bucket.treasuryAccountId),
      treasuryAccountId: bucket.treasuryAccountId,
      paymentKind: primaryKind,
      accountName: bucket.accountName,
      label: bucket.accountName ?? "Cuenta",
      total: roundMoney(bucket.total),
    })
  }

  for (const [key, bucket] of unassigned) {
    result.push({
      key,
      treasuryAccountId: null,
      paymentKind: bucket.paymentKind,
      accountName: null,
      label: operationPaymentKindLabel(bucket.paymentKind),
      total: roundMoney(bucket.total),
    })
  }

  return result.sort((a, b) => a.label.localeCompare(b.label, "es"))
}

export type SessionTreasuryLineCobro = {
  key: string
  treasuryAccountId: string | null
  paymentKind: string
  accountName: string | null
  total: number
}

export async function loadSessionCobrosByTreasuryLine(
  supabase: SupabaseClient,
  popId: string,
  sessionId: string,
): Promise<SessionTreasuryLineCobro[]> {
  const { data: saleRows } = await supabase
    .from("sales")
    .select("id")
    .eq("pop_id", popId)
    .eq("cash_register_session_id", sessionId)
    .eq("status", "completed")

  const saleIds = (saleRows || []).map((row) => String(row.id))
  if (saleIds.length === 0) return []

  const { data: payRows } = await supabase
    .from("sale_payments")
    .select(
      "payment_kind, amount, treasury_account_id, treasury_accounts ( name )",
    )
    .eq("pop_id", popId)
    .in("sale_id", saleIds)

  const buckets = new Map<
    string,
    {
      treasuryAccountId: string | null
      paymentKind: string
      accountName: string | null
      total: number
    }
  >()

  for (const row of payRows || []) {
    const kind = String(row.payment_kind ?? "other")
    if (kind === "cash") continue
    const amount = parseAmount(row.amount)
    if (amount <= 0) continue

    const treasuryAccountId =
      row.treasury_account_id != null
        ? String(row.treasury_account_id)
        : null
    const taRaw = row.treasury_accounts as
      | { name?: string }
      | Array<{ name?: string }>
      | null
    const accountName = Array.isArray(taRaw)
      ? taRaw[0]?.name?.trim() ?? null
      : taRaw?.name?.trim() ?? null

    const key = treasuryCloseLineKey(treasuryAccountId, kind)
    const existing = buckets.get(key)
    if (existing) {
      existing.total += amount
    } else {
      buckets.set(key, {
        treasuryAccountId,
        paymentKind: kind,
        accountName,
        total: amount,
      })
    }
  }

  return [...buckets.entries()]
    .map(([key, bucket]) => ({
      key,
      treasuryAccountId: bucket.treasuryAccountId,
      paymentKind: bucket.paymentKind,
      accountName: bucket.accountName,
      total: roundMoney(bucket.total),
    }))
    .sort((a, b) =>
      formatTreasuryCloseLineLabel(a.accountName, a.paymentKind).localeCompare(
        formatTreasuryCloseLineLabel(b.accountName, b.paymentKind),
        "es",
      ),
    )
}

export async function buildTreasuryLineCloseAdjustmentLines(
  supabase: SupabaseClient,
  popId: string,
  declaredByLine: Record<string, number>,
  cobrosByLine: Array<SessionCloseCobro | SessionTreasuryLineCobro>,
  lineOrderStart: number,
): Promise<
  | { success: true; lines: CloseAccountingLine[]; nextLineOrder: number }
  | { success: false; error: string }
> {
  const lines: CloseAccountingLine[] = []
  let lineOrder = lineOrderStart
  const cobroMap = new Map(cobrosByLine.map((row) => [row.key, row]))
  const processed = new Set<string>()

  const appendDiff = async (
    lineKey: string,
    declaredRaw: number,
    cobrado: number,
    cobro: SessionCloseCobro | SessionTreasuryLineCobro | null,
  ): Promise<{ success: true } | { success: false; error: string }> => {
    const diff = roundMoney(declaredRaw - cobrado)
    if (Math.abs(diff) < 0.01) return { success: true }

    const parsed = parseCloseTreasuryLineKey(lineKey)
    const paymentKind =
      cobro?.paymentKind ?? parsed.paymentKind ?? "other"
    const treasuryAccountId =
      cobro?.treasuryAccountId ?? parsed.treasuryAccountId

    const assetAccountId = treasuryAccountId
      ? (await resolveTreasuryAccountLedgerAccountId(
          supabase,
          popId,
          treasuryAccountId,
        )) ??
        (await resolveLedgerAccountForTreasuryPayment(
          supabase,
          popId,
          paymentKind,
          treasuryAccountId,
        ))
      : await resolveLedgerAccountForTreasuryPayment(
          supabase,
          popId,
          paymentKind,
          null,
        )
    if (!assetAccountId) {
      const label =
        cobro && "label" in cobro && cobro.label
          ? cobro.label
          : formatTreasuryCloseLineLabel(
              cobro?.accountName ?? null,
              paymentKind,
            )
      return {
        success: false,
        error: `No hay cuenta contable para ajustar ${label} al cierre de caja.`,
      }
    }

    const absDiff = Math.abs(diff)
    const label =
      cobro && "label" in cobro && cobro.label
        ? cobro.label
        : formatTreasuryCloseLineLabel(cobro?.accountName ?? null, paymentKind)
    const desc =
      diff < 0
        ? `Faltante liquidación ${label} (${absDiff.toFixed(2)})`
        : `Sobrante liquidación ${label} (${absDiff.toFixed(2)})`

    if (diff < 0) {
      const gastoId = await resolveAccountIdByCodes(
        supabase,
        popId,
        CHART_DIFERENCIA_ARQUEO_GASTO_CODES,
      )
      if (!gastoId) {
        return {
          success: false,
          error:
            "No hay cuenta de gasto para diferencias de liquidación (p. ej. 6.1.1.05) en el plan de cuentas.",
        }
      }
      lines.push(
        {
          account_id: gastoId,
          debit_amount: absDiff,
          credit_amount: 0,
          description: desc,
          line_order: lineOrder,
        },
        {
          account_id: assetAccountId,
          debit_amount: 0,
          credit_amount: absDiff,
          description: desc,
          line_order: lineOrder + 1,
        },
      )
    } else {
      const ingresoId = await resolveAccountIdByCodes(
        supabase,
        popId,
        CHART_ARQUEO_SOBRANTE_INGRESO_CODES,
      )
      if (!ingresoId) {
        return {
          success: false,
          error:
            "No hay cuenta de otros ingresos para sobrantes de liquidación (p. ej. 4.2.1.01) en el plan de cuentas.",
        }
      }
      lines.push(
        {
          account_id: assetAccountId,
          debit_amount: absDiff,
          credit_amount: 0,
          description: desc,
          line_order: lineOrder,
        },
        {
          account_id: ingresoId,
          debit_amount: 0,
          credit_amount: absDiff,
          description: desc,
          line_order: lineOrder + 1,
        },
      )
    }

    lineOrder += 2
    return { success: true }
  }

  for (const [lineKey, declaredRaw] of Object.entries(declaredByLine)) {
    processed.add(lineKey)
    const cobro = cobroMap.get(lineKey) ?? null
    const cobrado = cobro?.total ?? 0
    const res = await appendDiff(lineKey, declaredRaw, cobrado, cobro)
    if (!res.success) return res
  }

  for (const cobro of cobrosByLine) {
    if (processed.has(cobro.key)) continue
    const res = await appendDiff(cobro.key, 0, cobro.total, cobro)
    if (!res.success) return res
  }

  return { success: true, lines, nextLineOrder: lineOrder }
}

export async function loadSessionNonCashCobrosByKind(
  supabase: SupabaseClient,
  popId: string,
  sessionId: string,
): Promise<Map<string, SessionPaymentKindCobro>> {
  const { data: saleRows } = await supabase
    .from("sales")
    .select("id")
    .eq("pop_id", popId)
    .eq("cash_register_session_id", sessionId)
    .eq("status", "completed")

  const saleIds = (saleRows || []).map((row) => String(row.id))
  const result = new Map<string, SessionPaymentKindCobro>()
  if (saleIds.length === 0) return result

  const { data: payRows } = await supabase
    .from("sale_payments")
    .select("payment_kind, amount, treasury_account_id")
    .eq("pop_id", popId)
    .in("sale_id", saleIds)

  const buckets = new Map<
    string,
    { total: number; byTreasury: Map<string, number> }
  >()

  for (const row of payRows || []) {
    const kind = String(row.payment_kind ?? "other")
    if (kind === "cash") continue
    const amount = parseAmount(row.amount)
    if (amount <= 0) continue
    const treasuryAccountId =
      row.treasury_account_id != null
        ? String(row.treasury_account_id)
        : null

    let bucket = buckets.get(kind)
    if (!bucket) {
      bucket = { total: 0, byTreasury: new Map() }
      buckets.set(kind, bucket)
    }
    bucket.total += amount
    if (treasuryAccountId) {
      bucket.byTreasury.set(
        treasuryAccountId,
        (bucket.byTreasury.get(treasuryAccountId) ?? 0) + amount,
      )
    }
  }

  for (const [kind, bucket] of buckets) {
    let primaryTreasuryAccountId: string | null = null
    let maxAmount = 0
    for (const [taId, amount] of bucket.byTreasury) {
      if (amount > maxAmount) {
        maxAmount = amount
        primaryTreasuryAccountId = taId
      }
    }
    result.set(kind, {
      total: roundMoney(bucket.total),
      primaryTreasuryAccountId,
    })
  }

  return result
}

export async function buildCashCloseAdjustmentLines(
  supabase: SupabaseClient,
  popId: string,
  cashDifference: number,
  lineOrderStart: number,
): Promise<
  | { success: true; lines: CloseAccountingLine[]; nextLineOrder: number }
  | { success: false; error: string }
> {
  const absDiff = Math.abs(cashDifference)
  if (absDiff < 0.01) {
    return { success: true, lines: [], nextLineOrder: lineOrderStart }
  }

  const cajaId = await resolveAccountIdByCodes(
    supabase,
    popId,
    ["1.1.1.01"],
  )
  if (!cajaId) {
    return {
      success: false,
      error:
        "No hay cuenta Caja (p. ej. 1.1.1.01) en el plan de cuentas para el arqueo.",
    }
  }

  const descBase =
    cashDifference < 0
      ? `Faltante de arqueo de caja (${absDiff.toFixed(2)})`
      : `Sobrante de arqueo de caja (${absDiff.toFixed(2)})`

  let line1: CloseAccountingLine
  let line2: CloseAccountingLine

  if (cashDifference < 0) {
    const gastoId = await resolveAccountIdByCodes(
      supabase,
      popId,
      CHART_DIFERENCIA_ARQUEO_GASTO_CODES,
    )
    if (!gastoId) {
      return {
        success: false,
        error:
          "No hay cuenta de gasto para diferencias de arqueo (p. ej. 6.1.1.05) en el plan de cuentas.",
      }
    }
    line1 = {
      account_id: gastoId,
      debit_amount: absDiff,
      credit_amount: 0,
      description: descBase,
      line_order: lineOrderStart,
    }
    line2 = {
      account_id: cajaId,
      debit_amount: 0,
      credit_amount: absDiff,
      description: descBase,
      line_order: lineOrderStart + 1,
    }
  } else {
    const ingresoId = await resolveAccountIdByCodes(
      supabase,
      popId,
      CHART_ARQUEO_SOBRANTE_INGRESO_CODES,
    )
    if (!ingresoId) {
      return {
        success: false,
        error:
          "No hay cuenta de otros ingresos (p. ej. 4.2.1.01) en el plan de cuentas.",
      }
    }
    line1 = {
      account_id: cajaId,
      debit_amount: absDiff,
      credit_amount: 0,
      description: descBase,
      line_order: lineOrderStart,
    }
    line2 = {
      account_id: ingresoId,
      debit_amount: 0,
      credit_amount: absDiff,
      description: descBase,
      line_order: lineOrderStart + 1,
    }
  }

  return {
    success: true,
    lines: [line1, line2],
    nextLineOrder: lineOrderStart + 2,
  }
}

export async function buildPaymentKindCloseAdjustmentLines(
  supabase: SupabaseClient,
  popId: string,
  declaredByKind: Record<string, number>,
  cobrosByKind: Map<string, SessionPaymentKindCobro>,
  lineOrderStart: number,
): Promise<
  | { success: true; lines: CloseAccountingLine[]; nextLineOrder: number }
  | { success: false; error: string }
> {
  const lines: CloseAccountingLine[] = []
  let lineOrder = lineOrderStart
  const processed = new Set<string>()

  const appendDiff = async (
    paymentKind: string,
    declaredRaw: number,
    cobrado: number,
    primaryTreasuryAccountId: string | null,
  ): Promise<{ success: true } | { success: false; error: string }> => {
    const diff = roundMoney(declaredRaw - cobrado)
    if (Math.abs(diff) < 0.01) return { success: true }

    const assetAccountId = primaryTreasuryAccountId
      ? (await resolveTreasuryAccountLedgerAccountId(
          supabase,
          popId,
          primaryTreasuryAccountId,
        )) ??
        (await resolveLedgerAccountForTreasuryPayment(
          supabase,
          popId,
          paymentKind,
          primaryTreasuryAccountId,
        ))
      : await resolveLedgerAccountForTreasuryPayment(
          supabase,
          popId,
          paymentKind,
          null,
        )
    if (!assetAccountId) {
      return {
        success: false,
        error: `No hay cuenta contable para ajustar ${operationPaymentKindLabel(paymentKind)} al cierre de caja.`,
      }
    }

    const absDiff = Math.abs(diff)
    const label = operationPaymentKindLabel(paymentKind)
    const desc =
      diff < 0
        ? `Faltante liquidación ${label} (${absDiff.toFixed(2)})`
        : `Sobrante liquidación ${label} (${absDiff.toFixed(2)})`

    if (diff < 0) {
      const gastoId = await resolveAccountIdByCodes(
        supabase,
        popId,
        CHART_DIFERENCIA_ARQUEO_GASTO_CODES,
      )
      if (!gastoId) {
        return {
          success: false,
          error:
            "No hay cuenta de gasto para diferencias de liquidación (p. ej. 6.1.1.05) en el plan de cuentas.",
        }
      }
      lines.push(
        {
          account_id: gastoId,
          debit_amount: absDiff,
          credit_amount: 0,
          description: desc,
          line_order: lineOrder,
        },
        {
          account_id: assetAccountId,
          debit_amount: 0,
          credit_amount: absDiff,
          description: desc,
          line_order: lineOrder + 1,
        },
      )
    } else {
      const ingresoId = await resolveAccountIdByCodes(
        supabase,
        popId,
        CHART_ARQUEO_SOBRANTE_INGRESO_CODES,
      )
      if (!ingresoId) {
        return {
          success: false,
          error:
            "No hay cuenta de otros ingresos para sobrantes de liquidación (p. ej. 4.2.1.01) en el plan de cuentas.",
        }
      }
      lines.push(
        {
          account_id: assetAccountId,
          debit_amount: absDiff,
          credit_amount: 0,
          description: desc,
          line_order: lineOrder,
        },
        {
          account_id: ingresoId,
          debit_amount: 0,
          credit_amount: absDiff,
          description: desc,
          line_order: lineOrder + 1,
        },
      )
    }

    lineOrder += 2
    return { success: true }
  }

  for (const [paymentKind, declaredRaw] of Object.entries(declaredByKind)) {
    if (paymentKind === "cash") continue
    processed.add(paymentKind)
    const cobro = cobrosByKind.get(paymentKind)
    const cobrado = cobro?.total ?? 0
    const res = await appendDiff(
      paymentKind,
      declaredRaw,
      cobrado,
      cobro?.primaryTreasuryAccountId ?? null,
    )
    if (!res.success) return res
  }

  for (const [paymentKind, cobro] of cobrosByKind) {
    if (processed.has(paymentKind)) continue
    const res = await appendDiff(
      paymentKind,
      0,
      cobro.total,
      cobro.primaryTreasuryAccountId,
    )
    if (!res.success) return res
  }

  return { success: true, lines, nextLineOrder: lineOrder }
}
