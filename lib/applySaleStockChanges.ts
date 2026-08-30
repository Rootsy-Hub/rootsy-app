import { invalidateDataWorkspaceTableInfinite } from "@/lib/dataWorkspaceTableInfinite"
import { openPopLocalDb, patchArticleStockOnHand } from "@/lib/popLocalDb"
import {
  catalogAvailabilityQueryKey,
  menuBoardItemsQueryRoot,
  popArticlesQueryRoot,
  saleBoardArticlesQueryRoot,
} from "@/lib/queryKeys"
import type { QueryClient } from "@tanstack/react-query"

export type SaleStockChange = {
  articleId: string
  onHand: number
}

const REFETCH_ALL = { refetchType: "all" as const }

export async function applySaleStockChanges(
  queryClient: QueryClient,
  popId: string,
  changes: SaleStockChange[] | undefined,
) {
  if (!popId || !changes?.length) return
  try {
    const handle = await openPopLocalDb(popId)
    patchArticleStockOnHand(handle.database, changes)
    handle.markDirty()
    await handle.flush()
  } catch {
    /* el cobro ya se registró; el realtime o un hydrate posterior corrige */
  }
  void queryClient.invalidateQueries({
    queryKey: saleBoardArticlesQueryRoot(popId),
    ...REFETCH_ALL,
  })
  void queryClient.invalidateQueries({
    queryKey: menuBoardItemsQueryRoot(popId),
    ...REFETCH_ALL,
  })
  void queryClient.invalidateQueries({
    queryKey: catalogAvailabilityQueryKey(popId),
    ...REFETCH_ALL,
  })
  void invalidateDataWorkspaceTableInfinite(
    queryClient,
    popArticlesQueryRoot(popId),
  )
}
