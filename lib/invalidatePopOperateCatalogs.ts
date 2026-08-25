import {
  menuCatalogQueryKey,
  purchaseCatalogQueryKey,
  saleBoardArticlesQueryRoot,
  saleBoardCategoriesQueryKey,
  saleCatalogQueryKey,
} from "@/lib/queryKeys"
import type { QueryClient } from "@tanstack/react-query"

export function invalidatePopOperateCatalogs(
  queryClient: QueryClient,
  popId: string,
) {
  const opts = { refetchType: "all" as const }
  void queryClient.invalidateQueries({
    queryKey: saleCatalogQueryKey(popId),
    ...opts,
  })
  void queryClient.invalidateQueries({
    queryKey: saleBoardCategoriesQueryKey(popId),
    ...opts,
  })
  void queryClient.invalidateQueries({
    queryKey: saleBoardArticlesQueryRoot(popId),
    ...opts,
  })
  void queryClient.invalidateQueries({
    queryKey: purchaseCatalogQueryKey(popId),
    ...opts,
  })
  void queryClient.invalidateQueries({
    queryKey: menuCatalogQueryKey(popId),
    ...opts,
  })
}
