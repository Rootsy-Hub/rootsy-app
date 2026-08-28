import type { CashRegisterRow } from "@/app/[siteId]/[popId]/cash-registers/actions"
import type { CashRegistersFormContext } from "@/lib/rootsyApi/cashRegistersClient"
import { getBrowserQueryClient } from "@/lib/queryClient"
import {
  popCashRegistersFormContextQueryKey,
  popCashRegistersListQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import {
  fetchCashRegisters,
  fetchCashRegistersFormContext,
  fetchCashRegistersOpenTotals,
  mergeCashRegisterRow,
} from "@/lib/rootsyApi/cashRegistersClient"
import type { QueryClient } from "@tanstack/react-query"

export type CashRegistersListQueryData =
  | { ok: true; registers: CashRegisterRow[] }
  | { ok: false; error: string }

export async function loadCashRegistersListQuery(
  popId: string,
): Promise<CashRegistersListQueryData> {
  try {
    const [listRes, totalsRes] = await Promise.all([
      fetchCashRegisters(popId),
      fetchCashRegistersOpenTotals(popId),
    ])
    if (!listRes.success) {
      return { ok: false, error: listRes.error || "Error" }
    }
    const totals = totalsRes.success ? totalsRes.byRegisterId : {}
    return {
      ok: true,
      registers: listRes.registers.map((row) =>
        mergeCashRegisterRow(row, totals[row.id]),
      ),
    }
  } catch {
    return { ok: false, error: "Error inesperado" }
  }
}

export function cashRegistersListQueryOptions(popId: string) {
  return {
    queryKey: popCashRegistersListQueryKey(popId),
    queryFn: () => loadCashRegistersListQuery(popId),
    ...sessionListQueryOptions,
  }
}

export function prefetchCashRegistersListQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  return queryClient.prefetchQuery(cashRegistersListQueryOptions(popId))
}

export function invalidateCashRegistersListQuery(
  queryClient: QueryClient,
  popId: string,
) {
  return queryClient.invalidateQueries({
    queryKey: popCashRegistersListQueryKey(popId),
  })
}

export async function loadCashRegistersFormContextQuery(
  popId: string,
): Promise<
  Pick<CashRegistersFormContext, "cashTreasuryAccounts" | "salePoints">
> {
  const res = await fetchCashRegistersFormContext(popId)
  if (!res.success) {
    return { cashTreasuryAccounts: [], salePoints: [] }
  }
  return {
    cashTreasuryAccounts: res.data.cashTreasuryAccounts,
    salePoints: res.data.salePoints,
  }
}

export function cashRegistersFormContextQueryOptions(popId: string) {
  return {
    queryKey: popCashRegistersFormContextQueryKey(popId),
    queryFn: () => loadCashRegistersFormContextQuery(popId),
    ...sessionListQueryOptions,
  }
}
