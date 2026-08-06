"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import { getPopById, getPopSiteId, validatePopAccess } from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import {
  createTreasuryChartSubaccount,
  createTreasuryChartSubaccountUnderParent,
  TREASURY_CARD_PAYABLE_PARENT_CHART_CODE,
  TREASURY_POS_PARENT_CHART_CODE,
} from "@/lib/treasuryChartSubaccount"
import {
  isCardPayableChartCode,
  isMotherTreasuryAccount,
  isSettlementReceivableChartCode,
  type TreasuryAccountKind,
} from "@/lib/treasuryAccountKinds"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { createClient } from "@/utils/supabase/server"

export type TreasuryAccountTableRow = {
  id: string
  name: string
  kind: TreasuryAccountKind
  brandKey: string | null
  isSystemDefault: boolean
  isActive: boolean
  sortOrder: number
  accountingAccountId: string
  accountingAccountLabel: string
  chartAccountCode: string
  toLiquidateBalance: number
  toPayBalance: number
  outstandingBalance: number
  settledTotal: number
  ledgerBalance: number | null
  isCardPayable: boolean
  hasPosIntegration: boolean
  hasCardIntegration: boolean
}

export type UpdateTreasuryAccountInput = {
  name: string
}

export type UpsertTreasuryAccountInput = {
  name: string
  kind: TreasuryAccountKind
  sortOrder: number
  brandKey?: string | null
}

export type TreasuryChildAccountKind = "pos" | "card_payable"

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

function parseTreasuryKind(v: unknown): TreasuryAccountKind {
  const k = String(v ?? "other")
  if (k === "cash" || k === "bank" || k === "wallet" || k === "card_payable") {
    return k
  }
  return "other"
}

function compareChartAccountCodes(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true })
}

async function computeLifetimePaidOutByTreasuryAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  popId: string,
): Promise<Map<string, number>> {
  const totals = new Map<string, number>()
  const bump = (taId: string, amount: number) => {
    if (!taId || amount <= 0) return
    totals.set(taId, roundMoney((totals.get(taId) ?? 0) + amount))
  }
  for (const table of ["purchase_payments", "expense_payments"] as const) {
    const { data } = await supabase
      .from(table)
      .select("treasury_account_id, amount")
      .eq("pop_id", popId)
    for (const row of data || []) {
      if (row.treasury_account_id == null) continue
      bump(String(row.treasury_account_id), parseAmount(row.amount))
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
    .select("card_treasury_account_id, amount")
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
): Promise<
  | {
      success: true
      rows: TreasuryAccountTableRow[]
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
      fundingAccounts: TreasuryFundingOption[]
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
      canSettle: boolean
      popName?: string
    }
> {
  const empty = {
    rows: [] as TreasuryAccountTableRow[],
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
        brand_key,
        parent_treasury_account_id,
        accounting_chart_account_id,
        accounting_chart_of_accounts (
          code,
          name
        )
      `,
      )
      .eq("pop_id", popId)
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

    const accountIds = (data || []).map((r) =>
      String(r.accounting_chart_account_id),
    )

    const lifetimePaid = await computeLifetimePaidOutByTreasuryAccount(supabase, popId)
    const settlementsByTa = await computeSettlementsByTreasuryAccount(supabase, popId)

    const ledgerBalances = await computeLedgerBalancesByAccount(
      supabase,
      popId,
      accountIds,
    )

    const allRows: (TreasuryAccountTableRow & {
      parentTreasuryAccountId: string | null
    })[] = (data || []).map((r) => {
      const id = String(r.id)
      const kind = parseTreasuryKind(r.kind)
      const chart = r.accounting_chart_of_accounts as unknown as {
        code?: string
        name?: string
      } | null
      const chartId = String(r.accounting_chart_account_id)
      const chartAccountCode = String(chart?.code ?? "")
      const charged = lifetimePaid.get(id) ?? 0
      const settled = settlementsByTa.get(id) ?? 0
      const isCardPayable = kind === "card_payable"
      return {
        id,
        name: String(r.name ?? ""),
        kind,
        brandKey: r.brand_key != null ? String(r.brand_key) : null,
        isSystemDefault: Boolean(r.is_system_default),
        isActive: Boolean(r.is_active),
        sortOrder: Number(r.sort_order ?? 0),
        accountingAccountId: chartId,
        accountingAccountLabel: chart
          ? `${chart.code ?? ""} ${chart.name ?? ""}`.trim()
          : "",
        chartAccountCode,
        toLiquidateBalance: 0,
        toPayBalance: 0,
        outstandingBalance: isCardPayable
          ? roundMoney(charged - settled)
          : 0,
        settledTotal: settled,
        ledgerBalance: ledgerBalances.get(chartId) ?? null,
        isCardPayable,
        hasPosIntegration: false,
        hasCardIntegration: false,
        parentTreasuryAccountId:
          r.parent_treasury_account_id != null
            ? String(r.parent_treasury_account_id)
            : null,
      }
    })

    const toLiquidateByMother = new Map<string, number>()
    const toPayByMother = new Map<string, number>()
    const hasPosByMother = new Map<string, boolean>()
    const hasCardByMother = new Map<string, boolean>()
    for (const r of allRows) {
      if (!isMotherTreasuryAccount(r.chartAccountCode)) continue
      toLiquidateByMother.set(r.id, 0)
      toPayByMother.set(r.id, 0)
    }

    for (const row of allRows) {
      const parentId = row.parentTreasuryAccountId
      if (!parentId) continue
      if (
        !toLiquidateByMother.has(parentId) &&
        !toPayByMother.has(parentId)
      ) {
        continue
      }
      const balance = row.ledgerBalance ?? 0

      if (isSettlementReceivableChartCode(row.chartAccountCode)) {
        hasPosByMother.set(parentId, true)
        if (balance !== 0) {
          toLiquidateByMother.set(
            parentId,
            roundMoney((toLiquidateByMother.get(parentId) ?? 0) + balance),
          )
        }
      } else if (
        isCardPayableChartCode(row.chartAccountCode) ||
        row.isCardPayable
      ) {
        hasCardByMother.set(parentId, true)
        if (balance !== 0) {
          toPayByMother.set(
            parentId,
            roundMoney((toPayByMother.get(parentId) ?? 0) + balance),
          )
        }
      }
    }

    const rows = allRows
      .filter((r) => isMotherTreasuryAccount(r.chartAccountCode))
      .map(({ parentTreasuryAccountId: _parent, ...r }) => ({
        ...r,
        toLiquidateBalance: toLiquidateByMother.get(r.id) ?? 0,
        toPayBalance: toPayByMother.get(r.id) ?? 0,
        hasPosIntegration: hasPosByMother.get(r.id) ?? false,
        hasCardIntegration: hasCardByMother.get(r.id) ?? false,
      }))
      .sort((a, b) =>
        compareChartAccountCodes(a.chartAccountCode, b.chartAccountCode),
      )

    const fundingAccounts: TreasuryFundingOption[] = allRows
      .filter((r) => r.isActive && !r.isCardPayable && isMotherTreasuryAccount(r.chartAccountCode))
      .sort((a, b) =>
        compareChartAccountCodes(a.chartAccountCode, b.chartAccountCode),
      )
      .map((r) => ({ id: r.id, name: r.name, kind: r.kind }))

    return {
      success: true,
      rows,
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
    if (kind !== "cash" && kind !== "bank" && kind !== "wallet") {
      return { success: false, error: "Tipo de cuenta inválido." }
    }
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
      brand_key: input.brandKey?.trim() || null,
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

export async function createTreasuryChildAccount(
  popId: string,
  parentTreasuryAccountId: string,
  childKind: TreasuryChildAccountKind,
  name: string,
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
      return { success: false, error: "Sin permiso para agregar cuentas." }
    }

    const trimmed = name.trim()
    if (!trimmed) {
      return { success: false, error: "El nombre es obligatorio." }
    }

    const supabase = await createClient()
    const { data: parent, error: parentErr } = await supabase
      .from("treasury_accounts")
      .select(
        `
        id,
        kind,
        sort_order,
        accounting_chart_of_accounts ( code )
      `,
      )
      .eq("id", parentTreasuryAccountId)
      .eq("pop_id", popId)
      .maybeSingle()

    if (parentErr || !parent?.id) {
      return { success: false, error: "Cuenta madre no encontrada." }
    }

    const parentKind = parseTreasuryKind(parent.kind)
    const parentChart = parent.accounting_chart_of_accounts as unknown as {
      code?: string
    } | null
    const parentChartCode = String(parentChart?.code ?? "")

    if (!isMotherTreasuryAccount(parentChartCode)) {
      return {
        success: false,
        error: "Solo se pueden agregar terminales o tarjetas a cuentas madre.",
      }
    }

    if (childKind === "pos") {
      if (parentKind !== "bank" && parentKind !== "wallet") {
        return {
          success: false,
          error: "Los terminales POS se agregan a cuentas banco o billetera.",
        }
      }
    } else if (parentKind !== "bank" && parentKind !== "wallet") {
      return {
        success: false,
        error: "Las tarjetas corporativas se agregan a cuentas banco o billetera.",
      }
    }

    const { data: siblingRows } = await supabase
      .from("treasury_accounts")
      .select(
        `
        kind,
        accounting_chart_of_accounts ( code )
      `,
      )
      .eq("pop_id", popId)
      .eq("parent_treasury_account_id", parentTreasuryAccountId)

    for (const sibling of siblingRows || []) {
      const siblingChart = sibling.accounting_chart_of_accounts as unknown as {
        code?: string
      } | null
      const siblingCode = String(siblingChart?.code ?? "")
      const siblingKind = parseTreasuryKind(sibling.kind)

      if (
        childKind === "pos" &&
        isSettlementReceivableChartCode(siblingCode)
      ) {
        return {
          success: false,
          error: "Esta cuenta ya tiene un terminal POS.",
        }
      }
      if (
        childKind === "card_payable" &&
        (siblingKind === "card_payable" ||
          isCardPayableChartCode(siblingCode))
      ) {
        return {
          success: false,
          error: "Esta cuenta ya tiene una tarjeta corporativa.",
        }
      }
    }

    const chartConfig =
      childKind === "pos"
        ? {
            parentCode: TREASURY_POS_PARENT_CHART_CODE,
            treasuryKind: "other" as TreasuryAccountKind,
            accountType: "activo_corriente",
            nature: "deudora",
            kind: "other" as TreasuryAccountKind,
          }
        : {
            parentCode: TREASURY_CARD_PAYABLE_PARENT_CHART_CODE,
            treasuryKind: "card_payable" as TreasuryAccountKind,
            accountType: "pasivo_corriente",
            nature: "acreedora",
            kind: "card_payable" as TreasuryAccountKind,
          }

    const chart = await createTreasuryChartSubaccountUnderParent(
      supabase,
      popId,
      chartConfig.parentCode,
      trimmed,
      {
        treasuryKind: chartConfig.treasuryKind,
        accountType: chartConfig.accountType,
        nature: chartConfig.nature,
      },
    )
    if ("error" in chart) {
      return { success: false, error: chart.error }
    }

    const parentSort = Number(parent.sort_order ?? 0)
    const { error } = await supabase.from("treasury_accounts").insert({
      pop_id: popId,
      name: trimmed,
      kind: chartConfig.kind,
      accounting_chart_account_id: chart.id,
      parent_treasury_account_id: parentTreasuryAccountId,
      is_system_default: false,
      is_active: true,
      sort_order: Math.trunc(parentSort + (childKind === "pos" ? 1 : 2)),
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
  input: UpdateTreasuryAccountInput,
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
      .select("id")
      .eq("id", rowId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (!row) return { success: false, error: "Cuenta no encontrada." }

    const { count: childCount, error: childErr } = await supabase
      .from("treasury_accounts")
      .select("id", { count: "exact", head: true })
      .eq("pop_id", popId)
      .eq("parent_treasury_account_id", rowId)
    if (childErr) {
      return {
        success: false,
        error: childErr.message || "No se pudo verificar cuentas vinculadas.",
      }
    }
    if ((childCount ?? 0) > 0) {
      return {
        success: false,
        error:
          "Hay terminales POS o tarjetas vinculados a esta cuenta. Eliminalos o reasignalos antes.",
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

export type TreasuryChildAccountRow = {
  id: string
  name: string
  kind: TreasuryAccountKind
  chartAccountCode: string
  ledgerBalance: number | null
  childRole: "pos" | "card_payable"
  outstandingBalance: number
  settledTotal: number
}

export async function getTreasuryAccountPageData(
  popId: string,
  treasuryAccountId: string,
): Promise<
  | {
      success: true
      account: TreasuryAccountTableRow
      children: TreasuryChildAccountRow[]
      isMother: boolean
      parentAccount: { id: string; name: string } | null
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
    }
> {
  const hub = await getTreasuryAccountsHub(popId)
  if (!hub.success) {
    return {
      success: false,
      error: hub.error || "Error",
      redirect: hub.redirect,
    }
  }

  const taId = treasuryAccountId.trim()
  const motherRow = hub.rows.find((r) => r.id === taId)
  if (motherRow) {
    const children = await loadTreasuryChildAccounts(popId, taId)
    return {
      success: true,
      account: motherRow,
      children,
      isMother: true,
      parentAccount: null,
      fundingAccounts: hub.fundingAccounts,
      popName: hub.popName,
      canCreate: hub.canCreate,
      canUpdate: hub.canUpdate,
      canDelete: hub.canDelete,
      canSettle: hub.canSettle,
    }
  }

  const supabase = await createClient()
  const { data: raw, error } = await supabase
    .from("treasury_accounts")
    .select(
      `
      id,
      name,
      kind,
      is_system_default,
      is_active,
      sort_order,
      brand_key,
      parent_treasury_account_id,
      accounting_chart_account_id,
      accounting_chart_of_accounts (
        code,
        name
      )
    `,
    )
    .eq("id", taId)
    .eq("pop_id", popId)
    .maybeSingle()

  if (error || !raw?.id) {
    return { success: false, error: "Cuenta no encontrada." }
  }

  const chart = raw.accounting_chart_of_accounts as unknown as {
    code?: string
    name?: string
  } | null
  const chartId = String(raw.accounting_chart_account_id)
  const chartAccountCode = String(chart?.code ?? "")
  const kind = parseTreasuryKind(raw.kind)
  const isCardPayable = kind === "card_payable"

  const ledgerBalances = await computeLedgerBalancesByAccount(supabase, popId, [
    chartId,
  ])
  const lifetimePaid = isCardPayable
    ? await computeLifetimePaidOutByTreasuryAccount(supabase, popId).then(
        (m) => m.get(taId) ?? 0,
      )
    : 0
  const settledMap = isCardPayable
    ? await computeSettlementsByTreasuryAccount(supabase, popId)
    : new Map<string, number>()
  const settled = settledMap.get(taId) ?? 0

  let parentAccount: { id: string; name: string } | null = null
  if (raw.parent_treasury_account_id != null) {
    const parentId = String(raw.parent_treasury_account_id)
    const { data: parentRow } = await supabase
      .from("treasury_accounts")
      .select("id, name")
      .eq("id", parentId)
      .eq("pop_id", popId)
      .maybeSingle()
    if (parentRow?.id) {
      parentAccount = {
        id: String(parentRow.id),
        name: String(parentRow.name ?? ""),
      }
    }
  }

  const ledgerBalance = ledgerBalances.get(chartId) ?? null
  const isPos = isSettlementReceivableChartCode(chartAccountCode)

  const account: TreasuryAccountTableRow = {
    id: taId,
    name: String(raw.name ?? ""),
    kind,
    brandKey: raw.brand_key != null ? String(raw.brand_key) : null,
    isSystemDefault: Boolean(raw.is_system_default),
    isActive: Boolean(raw.is_active),
    sortOrder: Number(raw.sort_order ?? 0),
    accountingAccountId: chartId,
    accountingAccountLabel: chart
      ? `${chart.code ?? ""} ${chart.name ?? ""}`.trim()
      : "",
    chartAccountCode,
    toLiquidateBalance: isPos ? (ledgerBalance ?? 0) : 0,
    toPayBalance: isCardPayable ? (ledgerBalance ?? 0) : 0,
    outstandingBalance: isCardPayable ? roundMoney(lifetimePaid - settled) : 0,
    settledTotal: settled,
    ledgerBalance,
    isCardPayable,
    hasPosIntegration: false,
    hasCardIntegration: false,
  }

  return {
    success: true,
    account,
    children: [],
    isMother: false,
    parentAccount,
    fundingAccounts: hub.fundingAccounts,
    popName: hub.popName,
    canCreate: hub.canCreate,
    canUpdate: hub.canUpdate,
    canDelete: hub.canDelete,
    canSettle: hub.canSettle,
  }
}

async function loadTreasuryChildAccounts(
  popId: string,
  parentTreasuryAccountId: string,
): Promise<TreasuryChildAccountRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("treasury_accounts")
    .select(
      `
      id,
      name,
      kind,
      accounting_chart_account_id,
      accounting_chart_of_accounts ( code )
    `,
    )
    .eq("pop_id", popId)
    .eq("parent_treasury_account_id", parentTreasuryAccountId)
    .order("name", { ascending: true })

  if (error || !data?.length) return []

  const chartIds = data.map((r) => String(r.accounting_chart_account_id))
  const ledgerBalances = await computeLedgerBalancesByAccount(
    supabase,
    popId,
    chartIds,
  )
  const lifetimePaid = await computeLifetimePaidOutByTreasuryAccount(
    supabase,
    popId,
  )
  const settlementsByTa = await computeSettlementsByTreasuryAccount(
    supabase,
    popId,
  )

  return data.map((r) => {
    const id = String(r.id)
    const kind = parseTreasuryKind(r.kind)
    const chart = r.accounting_chart_of_accounts as unknown as {
      code?: string
    } | null
    const chartAccountCode = String(chart?.code ?? "")
    const chartId = String(r.accounting_chart_account_id)
    const isCard = kind === "card_payable" || isCardPayableChartCode(chartAccountCode)
    const charged = lifetimePaid.get(id) ?? 0
    const settled = settlementsByTa.get(id) ?? 0
    return {
      id,
      name: String(r.name ?? ""),
      kind,
      chartAccountCode,
      ledgerBalance: ledgerBalances.get(chartId) ?? null,
      childRole: isCard ? ("card_payable" as const) : ("pos" as const),
      outstandingBalance: isCard ? roundMoney(charged - settled) : 0,
      settledTotal: settled,
    }
  })
}
