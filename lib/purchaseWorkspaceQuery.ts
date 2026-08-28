import {
  getPurchaseCatalog,
  getPurchaseCatalogItemsPage,
} from "@/app/[siteId]/[popId]/purchases/actions"
import {
  operateCatalogFilterKey,
  purchaseCatalogViewToItemsFilter,
} from "@/lib/operateCatalogPage"
import { getBrowserQueryClient } from "@/lib/queryClient"
import {
  purchaseCatalogItemsQueryKey,
  purchaseCatalogQueryKey,
} from "@/lib/queryKeys"
import { operateCatalogQueryOptions } from "@/lib/queryStaleTimes"
import type { QueryClient } from "@tanstack/react-query"

export function purchaseCatalogQueryOptions(popId: string) {
  return {
    queryKey: purchaseCatalogQueryKey(popId),
    queryFn: async () => {
      const res = await getPurchaseCatalog(popId, { items: "none" })
      if (!res.success) throw new Error(res.error)
      return res
    },
    ...operateCatalogQueryOptions,
  }
}

function firstPurchaseCatalogCategoria(
  sections: readonly { id: string; categories: readonly { id: string }[] }[],
): string {
  for (const section of sections) {
    const first = section.categories[0]
    if (first) return `${section.id}:${first.id}`
  }
  return ""
}

async function prefetchPurchaseFirstItemsPage(
  popId: string,
  queryClient: QueryClient,
) {
  const catalog = await queryClient.ensureQueryData(
    purchaseCatalogQueryOptions(popId),
  )
  const categoria = firstPurchaseCatalogCategoria(catalog.categorySections)
  if (!categoria) return
  const filter = purchaseCatalogViewToItemsFilter(categoria, "")
  await queryClient.prefetchInfiniteQuery({
    queryKey: purchaseCatalogItemsQueryKey(
      popId,
      operateCatalogFilterKey(filter),
    ),
    queryFn: async ({ pageParam }) => {
      const res = await getPurchaseCatalogItemsPage(
        popId,
        filter,
        typeof pageParam === "number" ? pageParam : 0,
      )
      if (!res.success) throw new Error(res.error)
      return res.page
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: { nextOffset?: number | null }) =>
      lastPage.nextOffset ?? undefined,
    ...operateCatalogQueryOptions,
  })
}

export function prefetchPurchaseWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  return prefetchPurchaseFirstItemsPage(popId, queryClient).catch(() => undefined)
}
