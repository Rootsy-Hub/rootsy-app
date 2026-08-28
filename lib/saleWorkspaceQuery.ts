import { openCashSessionQueryOptions } from "@/hooks/useOpenCashSession"
import { ensurePopLocalDbStatus } from "@/hooks/usePopLocalDb"
import { SALE_BOARD_ARTICLE_PAGE_SIZE } from "@/hooks/useSaleBoardArticles"
import { getBrowserQueryClient } from "@/lib/queryClient"
import {
  popLocalArticlesHydrateQueryKey,
  popLocalCategoriesHydrateQueryKey,
  popLocalPromotionsHydrateQueryKey,
  saleBoardArticlesQueryKey,
  saleBoardCategoriesQueryKey,
  saleCatalogQueryKey,
  saleComprobantesQueryKey,
  salePaymentContextQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import {
  hydratePopArticlesFromNetwork,
  hydratePopCategoriesFromNetwork,
  hydratePopPromotionsFromNetwork,
  listSaleBoardArticles,
  listSaleBoardCategories,
  openPopLocalDb,
} from "@/lib/popLocalDb"
import { categorySnapshotToOption } from "@/lib/popLocalDb/mapCategory"
import {
  fetchSaleCatalog,
  fetchSaleComprobantes,
  fetchSalePaymentContext,
} from "@/lib/rootsyApi/saleClient"
import {
  readSavedSaleCatalogView,
  saleCatalogCategoryIdFromView,
} from "@/lib/saleCatalogPreference"
import type { QueryClient } from "@tanstack/react-query"

const localHydrateQueryOptions = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
} as const

export function saleCatalogQueryOptions(popId: string) {
  return {
    queryKey: saleCatalogQueryKey(popId),
    queryFn: async () => {
      const res = await fetchSaleCatalog(popId)
      if (!res.success) throw new Error(res.error)
      return res
    },
    ...sessionListQueryOptions,
  }
}

export function salePaymentContextQueryOptions(popId: string) {
  return {
    queryKey: salePaymentContextQueryKey(popId),
    queryFn: async () => {
      const res = await fetchSalePaymentContext(popId)
      if (!res.success) throw new Error(res.error)
      return res.context
    },
    ...sessionListQueryOptions,
  }
}

export function saleComprobantesQueryOptions(popId: string) {
  return {
    queryKey: saleComprobantesQueryKey(popId),
    queryFn: async () => {
      const res = await fetchSaleComprobantes(popId)
      if (!res.success) throw new Error(res.error)
      return res
    },
    ...sessionListQueryOptions,
  }
}

function nextArticlePage(page: number, totalCount: number) {
  return page * SALE_BOARD_ARTICLE_PAGE_SIZE < totalCount
    ? page + 1
    : undefined
}

async function prefetchSaleBoardLocal(
  popId: string,
  queryClient: QueryClient,
) {
  const status = await ensurePopLocalDbStatus(popId)
  if (status !== "ready") return

  await Promise.all([
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
  ])

  const categories = await queryClient.fetchQuery({
    queryKey: saleBoardCategoriesQueryKey(popId, "local"),
    queryFn: async () => {
      const handle = await openPopLocalDb(popId)
      return listSaleBoardCategories(handle.database).map(
        categorySnapshotToOption,
      )
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })

  const categoryId =
    saleCatalogCategoryIdFromView(readSavedSaleCatalogView(popId)) ??
    categories[0]?.id ??
    null
  if (!categoryId) return

  await queryClient.prefetchInfiniteQuery({
    queryKey: saleBoardArticlesQueryKey(popId, categoryId, "", "local"),
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1
      const handle = await openPopLocalDb(popId)
      const res = listSaleBoardArticles(handle.database, {
        categoryId,
        search: "",
        page,
        pageSize: SALE_BOARD_ARTICLE_PAGE_SIZE,
      })
      return {
        articles: res.articles,
        nextPage: nextArticlePage(res.page, res.totalCount),
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: { nextPage?: number }) => lastPage.nextPage,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })
}

export function prefetchSaleWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  return Promise.all([
    queryClient.prefetchQuery(saleCatalogQueryOptions(popId)),
    queryClient.prefetchQuery(salePaymentContextQueryOptions(popId)),
    queryClient.prefetchQuery(saleComprobantesQueryOptions(popId)),
    queryClient.prefetchQuery(openCashSessionQueryOptions(popId)),
    prefetchSaleBoardLocal(popId, queryClient).catch(() => undefined),
  ]).then(() => undefined)
}
