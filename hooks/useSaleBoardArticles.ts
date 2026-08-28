import type { SaleCatalogArticle } from "@/app/[siteId]/[popId]/sale/actions"
import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import { prefetchCatalogProductImages } from "@/lib/catalogProductImageCache"
import { uniqueById, uniqueInfinitePages } from "@/lib/operateCatalogPage"
import {
  fetchSaleBoardMerchandisePages,
  hydratePopArticlesFromNetwork,
  listSaleBoardArticles,
  openPopLocalDb,
} from "@/lib/popLocalDb"
import type { ArticleSnapshot } from "@/lib/popLocalDb/types"
import {
  popLocalArticlesHydrateQueryKey,
  saleBoardArticlesQueryKey,
  saleBoardArticlesQueryRoot,
} from "@/lib/queryKeys"
import type { ArticleListItem } from "@/lib/rootsyApi/articlesClient"
import {
  articleListItemToSaleCatalogArticle,
  articleSnapshotToSaleCatalogArticle,
} from "@/lib/saleCatalogArticleMap"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"

export const SALE_BOARD_ARTICLE_PAGE_SIZE = 50

type UseSaleBoardArticlesOptions = {
  enabled?: boolean
  hydrate?: boolean
  search?: string
  priceListId?: string
}

function nextPageFromCount(page: number, totalCount: number, pageSize: number) {
  return page * pageSize < totalCount ? page + 1 : undefined
}

function isSaleBoardHttpArticle(
  row: ArticleListItem,
  categoryId: string | null,
  search: string,
): boolean {
  if (!row.isActive || !row.isSellable) return false
  const q = search.trim().toLowerCase()
  if (q) {
    return (
      row.name.toLowerCase().includes(q) ||
      (row.barcode ?? "").toLowerCase().includes(q) ||
      (row.sku ?? "").toLowerCase().includes(q)
    )
  }
  if (categoryId) return row.categoryId === categoryId
  return false
}

export function useSaleBoardArticles(
  popId: string | undefined,
  categoryId: string | null,
  options?: UseSaleBoardArticlesOptions,
) {
  const queryClient = useQueryClient()
  const localStatus = usePopLocalDb(popId)
  const sqliteReady = localStatus === "ready"
  const fallback = localStatus === "fallback"
  const search = options?.search?.trim() ?? ""
  const isSearch = Boolean(search)
  const listingEnabled =
    Boolean(popId) &&
    (options?.enabled ?? true) &&
    (isSearch || Boolean(categoryId))
  const hydrateEnabled =
    Boolean(popId) && (options?.hydrate ?? true)

  const hydrate = useQuery({
    queryKey: popLocalArticlesHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopArticlesFromNetwork(popId!, {
        onProgress: () => {
          void queryClient.invalidateQueries({
            queryKey: saleBoardArticlesQueryRoot(popId!),
          })
        },
      })
      return true
    },
    enabled: sqliteReady && hydrateEnabled,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  })

  const localQuery = useInfiniteQuery({
    queryKey: saleBoardArticlesQueryKey(
      popId ?? "",
      isSearch ? "" : (categoryId ?? ""),
      search,
      "local",
    ),
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1
      const handle = await openPopLocalDb(popId!)
      const res = listSaleBoardArticles(handle.database, {
        categoryId: isSearch ? null : categoryId,
        search,
        page,
        pageSize: SALE_BOARD_ARTICLE_PAGE_SIZE,
      })
      return {
        articles: res.articles,
        nextPage: nextPageFromCount(
          res.page,
          res.totalCount,
          SALE_BOARD_ARTICLE_PAGE_SIZE,
        ),
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: sqliteReady && listingEnabled,
    select: uniqueInfinitePages,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const networkDump = useQuery({
    queryKey: [...popLocalArticlesHydrateQueryKey(popId ?? ""), "http"] as const,
    queryFn: () => fetchSaleBoardMerchandisePages(popId!),
    enabled: fallback && hydrateEnabled,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  })

  const networkArticles = useMemo((): SaleCatalogArticle[] => {
    const rows = (networkDump.data ?? []).filter((row) =>
      isSaleBoardHttpArticle(row, isSearch ? null : categoryId, search),
    )
    return uniqueById(rows).map((row) =>
      articleListItemToSaleCatalogArticle(row, options?.priceListId),
    )
  }, [categoryId, isSearch, networkDump.data, options?.priceListId, search])

  const localArticles = useMemo((): SaleCatalogArticle[] => {
    const rows = uniqueById(
      (localQuery.data?.pages.flatMap((page) => page.articles) ??
        []) as ArticleSnapshot[],
    )
    return rows.map((row) =>
      articleSnapshotToSaleCatalogArticle(row, options?.priceListId),
    )
  }, [localQuery.data, options?.priceListId])

  const articles = sqliteReady ? localArticles : networkArticles

  useEffect(() => {
    prefetchCatalogProductImages(articles.map((row) => row.imageUrl))
  }, [articles])

  const waitingLocalHydrate =
    sqliteReady &&
    listingEnabled &&
    localArticles.length === 0 &&
    hydrate.isLoading &&
    !hydrate.isError
  const waitingNetworkDump =
    fallback &&
    listingEnabled &&
    networkArticles.length === 0 &&
    networkDump.isLoading &&
    !networkDump.isError
  const isLoading =
    localStatus === "loading" ||
    waitingLocalHydrate ||
    waitingNetworkDump ||
    (sqliteReady && listingEnabled && localQuery.isLoading)

  const hydrateError =
    sqliteReady && localArticles.length === 0 && hydrate.error
      ? hydrate.error instanceof Error
        ? hydrate.error.message
        : String(hydrate.error)
      : null
  const networkError =
    fallback && networkDump.error
      ? networkDump.error instanceof Error
        ? networkDump.error.message
        : String(networkDump.error)
      : null
  const queryError =
    localQuery.error instanceof Error
      ? localQuery.error.message
      : localQuery.error
        ? String(localQuery.error)
        : null

  return {
    articles,
    isLoading,
    isFetchingNextPage: sqliteReady ? localQuery.isFetchingNextPage : false,
    hasNextPage: sqliteReady ? Boolean(localQuery.hasNextPage) : false,
    fetchNextPage: sqliteReady ? localQuery.fetchNextPage : async () => {},
    error: hydrateError ?? networkError ?? queryError,
  }
}
