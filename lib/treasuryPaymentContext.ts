"use server"

import { validatePopAccess } from "@/lib/popHelpers"
import {
  isMotherTreasuryAccount,
  isSettlementReceivableChartCode,
} from "@/lib/treasuryAccountKinds"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import { createClient } from "@/utils/supabase/server"

export type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"

export async function getTreasuryPaymentContext(
  popId: string,
): Promise<
  | { success: true; context: TreasuryPaymentContext }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("treasury_accounts")
      .select(
        `
        id,
        name,
        kind,
        is_active,
        sort_order,
        accounting_chart_of_accounts ( code )
      `,
      )
      .eq("pop_id", popId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      return { success: false, error: error.message || "No se pudieron cargar cuentas." }
    }

    let defaultCashTreasuryAccountId: string | null = null
    const cashTreasuryAccounts: TreasuryPaymentContext["cashTreasuryAccounts"] =
      []
    const bankTreasuryAccounts: TreasuryPaymentContext["bankTreasuryAccounts"] = []
    const posTreasuryAccounts: TreasuryPaymentContext["posTreasuryAccounts"] = []
    const payTreasuryAccounts: TreasuryPaymentContext["payTreasuryAccounts"] = []

    for (const row of data || []) {
      const id = String(row.id)
      const name = String(row.name ?? "")
      const kind = String(row.kind ?? "")
      const chart = row.accounting_chart_of_accounts as unknown as {
        code?: string
      } | null
      const code = String(chart?.code ?? "")

      if (kind === "card_payable") {
        payTreasuryAccounts.push({ id, name })
        continue
      }

      if (isSettlementReceivableChartCode(code)) {
        posTreasuryAccounts.push({ id, name })
        continue
      }

      if (!isMotherTreasuryAccount(code)) continue

      if (kind === "cash") {
        cashTreasuryAccounts.push({ id, name })
        if (!defaultCashTreasuryAccountId) {
          defaultCashTreasuryAccountId = id
        }
      } else if (kind === "bank" || kind === "wallet") {
        bankTreasuryAccounts.push({ id, name })
      }
    }

    return {
      success: true,
      context: {
        defaultCashTreasuryAccountId,
        cashTreasuryAccounts,
        bankTreasuryAccounts,
        posTreasuryAccounts,
        payTreasuryAccounts,
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
