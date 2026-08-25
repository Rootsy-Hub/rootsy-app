"use client"

import type { SaleCatalogArticle } from "@/app/[siteId]/[popId]/sale/actions"
import type { GetPopArticlesTableInput } from "@/app/[siteId]/[popId]/articles/actions"
import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import {
  popLocalArticlesHydrateQueryKey,
  saleBoardArticlesQueryKey,
  saleBoardArticlesQueryRoot,
} from "@/lib/queryKeys"
import { operateCatalogQueryOptions } from "@/lib/queryStaleTimes"
import { uniqueById, uniqueInfinitePages } from "@/lib/operateCatalogPage"
import {
  hydratePopArticlesFromNetwork,
  listSaleBoardArticles,
  openPopLocalDb,
} from "@/lib/popLocalDb"
import type { ArticleSnapshot } from "@/lib/popLocalDb/types"
import type { ArticleListItem } from "@/lib/rootsyApi/articlesClient"
import { fetchPopArticlesTable } from "@/lib/rootsyApi/articlesClient"
import { prefetchCatalogProductImages } from "@/lib/catalogProductImageCache"
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

function saleBoardArticlesInput(
  categoryId: string,
  page: number,
  search: string,
): GetPopArticlesTableInput {
  const q = search.trim()
  return {
    page,
    pageSize: SALE_BOARD_ARTICLE_PAGE_SIZE,
    search: q,
    soloActivos: true,
    soloInactivos: false,
    conDescuento: false,
    sinDescuento: false,
    conStock: true,
    sinStock: false,
    stockNegativo: false,
    ventaSinStock: false,
    categoryId: q ? "" : categoryId,
    itemKinds: ["merchandise"],
    sort: "name",
    ord: "asc",
  }
}

function nextPageFromCount(page: number, totalCount: number, pageSize: number) {
  return page * pageSize < totalCount ? page + 1 : undefined
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
  const enabled =
    Boolean(popId) &&
    (options?.enabled ?? true) &&
    (isSearch || Boolean(categoryId))

  const hydrate = useQuery({
    queryKey: popLocalArticlesHydrateQueryKey(popId ?? "", categoryId ?? ""),
    queryFn: async () => {
      await hydratePopArticlesFromNetwork(popId!, {
        categoryId: categoryId!,
        onProgress: () => {
          void queryClient.invalidateQueries({
            queryKey: saleBoardArticlesQueryRoot(popId!),
          })
        },
      })
      return true
    },
    enabled:
      sqliteReady &&
      Boolean(popId) &&
      Boolean(categoryId) &&
      (options?.hydrate ?? options?.enabled ?? true),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
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
    enabled: sqliteReady && enabled,
    select: uniqueInfinitePages,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const networkQuery = useInfiniteQuery({
    queryKey: saleBoardArticlesQueryKey(
      popId ?? "",
      isSearch ? "" : (categoryId ?? ""),
      search,
      "http",
    ),
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1
      const res = await fetchPopArticlesTable(
        popId!,
        saleBoardArticlesInput(categoryId ?? "", page, search),
      )
      if (!res.success) throw new Error(res.error)
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
    enabled: fallback && enabled,
    select: uniqueInfinitePages,
    ...(isSearch
      ? {
          staleTime: 0,
          gcTime: 0,
          refetchOnMount: "always" as const,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        }
      : operateCatalogQueryOptions),
  })

  const localArticles = useMemo((): SaleCatalogArticle[] => {
    const rows = uniqueById(
      (localQuery.data?.pages.flatMap((page) => page.articles) ??
        []) as ArticleSnapshot[],
    )
    return rows.map((row) =>
      articleSnapshotToSaleCatalogArticle(row, options?.priceListId),
    )
  }, [localQuery.data, options?.priceListId])

  const networkArticles = useMemo((): SaleCatalogArticle[] => {
    const rows = uniqueById(
      (networkQuery.data?.pages.flatMap((page) => page.articles) ??
        []) as ArticleListItem[],
    )
    return rows.map((row) =>
      articleListItemToSaleCatalogArticle(row, options?.priceListId),
    )
  }, [networkQuery.data, options?.priceListId])

  const articles = sqliteReady ? localArticles : networkArticles

  useEffect(() => {
    prefetchCatalogProductImages(articles.map((row) => row.imageUrl))
  }, [articles])
  const waitingLocalHydrate =
    sqliteReady &&
    Boolean(categoryId) &&
    localArticles.length === 0 &&
    hydrate.isLoading &&
    !hydrate.isError
  const isLoading =
    localStatus === "loading" ||
    waitingLocalHydrate ||
    (sqliteReady && enabled && localQuery.isLoading) ||
    (fallback && networkQuery.isLoading)

  const activeQuery = sqliteReady ? localQuery : networkQuery
  const hydrateError =
    sqliteReady && localArticles.length === 0 && hydrate.error
      ? hydrate.error instanceof Error
        ? hydrate.error.message
        : String(hydrate.error)
      : null
  const queryError =
    activeQuery.error instanceof Error
      ? activeQuery.error.message
      : activeQuery.error
        ? String(activeQuery.error)
        : null

  return {
    articles,
    isLoading,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
    hasNextPage: Boolean(activeQuery.hasNextPage),
    fetchNextPage: activeQuery.fetchNextPage,
    error: hydrateError ?? queryError,
  }
}
