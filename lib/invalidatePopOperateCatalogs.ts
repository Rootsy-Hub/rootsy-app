import {
  menuCatalogQueryKey,
  popCatalogRevQueryKey,
  purchaseCatalogQueryKey,
  saleCatalogQueryKey,
} from "@/lib/queryKeys"
import type { QueryClient } from "@tanstack/react-query"

export function invalidatePopOperateCatalogs(
  queryClient: QueryClient,
  popId: string,
) {
  void queryClient.invalidateQueries({ queryKey: saleCatalogQueryKey(popId) })
  void queryClient.invalidateQueries({
    queryKey: purchaseCatalogQueryKey(popId),
  })
  void queryClient.invalidateQueries({ queryKey: menuCatalogQueryKey(popId) })
  void queryClient.invalidateQueries({ queryKey: popCatalogRevQueryKey(popId) })
}
