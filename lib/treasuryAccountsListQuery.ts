import type { TreasuryAccountTableRow } from "@/app/[siteId]/[popId]/accounts/actions"
import { getBrowserQueryClient } from "@/lib/queryClient"
import { popAccountsListQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import {
  fetchTreasuryAccountBalances,
  fetchTreasuryAccounts,
  mergeTreasuryAccountRow,
} from "@/lib/rootsyApi/treasuryClient"
import type { QueryClient } from "@tanstack/react-query"

export type TreasuryAccountsListQueryData =
  | { ok: true; accounts: TreasuryAccountTableRow[] }
  | { ok: false; error: string }

export async function loadTreasuryAccountsListQuery(
  popId: string,
): Promise<TreasuryAccountsListQueryData> {
  try {
    const [listRes, balancesRes] = await Promise.all([
      fetchTreasuryAccounts(popId),
      fetchTreasuryAccountBalances(popId),
    ])
    if (!listRes.success) {
      return { ok: false, error: listRes.error || "Error" }
    }
    const balances = balancesRes.success ? balancesRes.balances : {}
    return {
      ok: true,
      accounts: listRes.rows.map((row) =>
        mergeTreasuryAccountRow(row, balances[row.id]),
      ),
    }
  } catch {
    return { ok: false, error: "Error inesperado" }
  }
}

export function treasuryAccountsListQueryOptions(popId: string) {
  return {
    queryKey: popAccountsListQueryKey(popId),
    queryFn: () => loadTreasuryAccountsListQuery(popId),
    ...sessionListQueryOptions,
  }
}

export function prefetchTreasuryAccountsListQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  return queryClient.prefetchQuery(treasuryAccountsListQueryOptions(popId))
}

export function invalidateTreasuryAccountsListQuery(
  queryClient: QueryClient,
  popId: string,
) {
  return queryClient.invalidateQueries({
    queryKey: popAccountsListQueryKey(popId),
  })
}
