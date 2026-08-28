import { openCashSessionQueryOptions } from "@/hooks/useOpenCashSession"
import { ensurePopLocalDbStatus } from "@/hooks/usePopLocalDb"
import { getBrowserQueryClient } from "@/lib/queryClient"
import {
  menuCatalogQueryKey,
  popLocalArticlesHydrateQueryKey,
  popLocalCategoriesHydrateQueryKey,
  popLocalMostradorBoardHydrateQueryKey,
  popLocalPromotionsHydrateQueryKey,
  popLocalRecipeCategoriesHydrateQueryKey,
  popLocalRecipesHydrateQueryKey,
  popMostradorOrdersQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import {
  hydratePopArticlesFromNetwork,
  hydratePopCategoriesFromNetwork,
  hydratePopPromotionsFromNetwork,
  hydratePopRecipeCategoriesFromNetwork,
  hydratePopRecipesFromNetwork,
} from "@/lib/popLocalDb"
import {
  hydratePopMostradorBoardFromNetwork,
  readMostradorOrdersLocalOrFetch,
} from "@/lib/popLocalDb/hydrateMostradorBoard"
import { fetchMenuCatalog } from "@/lib/rootsyApi/menuCatalogClient"
import {
  saleComprobantesQueryOptions,
  salePaymentContextQueryOptions,
} from "@/lib/saleWorkspaceQuery"
import type { QueryClient } from "@tanstack/react-query"

const localHydrateQueryOptions = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
} as const

export function mostradorOrdersQueryOptions(popId: string) {
  return {
    queryKey: popMostradorOrdersQueryKey(popId),
    queryFn: () => readMostradorOrdersLocalOrFetch(popId),
    ...sessionListQueryOptions,
  }
}

export function menuCatalogQueryOptions(popId: string) {
  return {
    queryKey: menuCatalogQueryKey(popId),
    queryFn: async () => {
      const res = await fetchMenuCatalog(popId)
      if (!res.success) throw new Error(res.error)
      return res
    },
    ...sessionListQueryOptions,
  }
}

async function prefetchMostradorBoard(
  popId: string,
  queryClient: QueryClient,
) {
  const status = await ensurePopLocalDbStatus(popId)
  if (status === "ready") {
    await queryClient.prefetchQuery({
      queryKey: popLocalMostradorBoardHydrateQueryKey(popId),
      queryFn: async () => {
        const result = await hydratePopMostradorBoardFromNetwork(popId)
        if (result.fetched) {
          await queryClient.invalidateQueries({
            queryKey: popMostradorOrdersQueryKey(popId),
            refetchType: "all",
          })
        }
        return true
      },
      ...localHydrateQueryOptions,
    })
  }
  await queryClient.prefetchQuery(mostradorOrdersQueryOptions(popId))
}

export function prefetchOperateCatalogLocal(
  popId: string,
  queryClient: QueryClient,
) {
  return Promise.all([
    queryClient.prefetchQuery({
      queryKey: popLocalCategoriesHydrateQueryKey(popId),
      queryFn: async () => {
        await hydratePopCategoriesFromNetwork(popId)
        return true
      },
      ...localHydrateQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: popLocalArticlesHydrateQueryKey(popId),
      queryFn: async () => {
        await hydratePopArticlesFromNetwork(popId)
        return true
      },
      ...localHydrateQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: popLocalPromotionsHydrateQueryKey(popId),
      queryFn: async () => {
        await hydratePopPromotionsFromNetwork(popId)
        return true
      },
      ...localHydrateQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: popLocalRecipeCategoriesHydrateQueryKey(popId),
      queryFn: async () => {
        await hydratePopRecipeCategoriesFromNetwork(popId)
        return true
      },
      ...localHydrateQueryOptions,
    }),
  ]).then(() =>
    queryClient.prefetchQuery({
      queryKey: popLocalRecipesHydrateQueryKey(popId),
      queryFn: async () => {
        await hydratePopRecipesFromNetwork(popId)
        return true
      },
      ...localHydrateQueryOptions,
    }),
  )
}

export function prefetchMostradorWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  return Promise.all([
    prefetchMostradorBoard(popId, queryClient),
    queryClient.prefetchQuery(openCashSessionQueryOptions(popId)),
    queryClient.prefetchQuery(menuCatalogQueryOptions(popId)),
    queryClient.prefetchQuery(salePaymentContextQueryOptions(popId)),
    queryClient.prefetchQuery(saleComprobantesQueryOptions(popId)),
  ]).then(() => {
    void prefetchOperateCatalogLocal(popId, queryClient).catch(() => undefined)
  })
}
