"use client"

import { getPopCurrentAccountLedger } from "@/app/[siteId]/[popId]/current-accounts/actions"
import type { CurrentAccountDirection } from "@/lib/currentAccounts"
import { popCurrentAccountLedgerQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery } from "@tanstack/react-query"

type UsePopCurrentAccountLedgerOptions = {
  enabled?: boolean
}

export function usePopCurrentAccountLedger(
  popId: string | undefined,
  direction: CurrentAccountDirection,
  partyId: string,
  options?: UsePopCurrentAccountLedgerOptions,
) {
  const enabled =
    (options?.enabled ?? true) && Boolean(popId) && Boolean(partyId)

  return useQuery({
    queryKey: popCurrentAccountLedgerQueryKey(popId ?? "", direction, partyId),
    queryFn: () =>
      getPopCurrentAccountLedger(popId!, {
        direction,
        partyId,
      }),
    enabled,
    ...sessionListQueryOptions,
  })
}
