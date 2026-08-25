"use client"

import type { SaleCatalogArticle } from "@/app/[siteId]/[popId]/sale/actions"
import type { GetPopArticlesTableInput } from "@/app/[siteId]/[popId]/articles/actions"
import { saleBoardArticlesQueryKey } from "@/lib/queryKeys"
import { operateBoardPersistQueryOptions } from "@/lib/queryStaleTimes"
import { uniqueById, uniqueInfinitePages } from "@/lib/operateCatalogPage"
import { articleListItemToSaleCatalogArticle } from "@/lib/saleCatalogArticleMap"
import { fetchPopArticlesTable } from "@/lib/rootsyApi/articlesClient"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const SALE_BOARD_ARTICLE_PAGE_SIZE = 50

type UseSaleBoardArticlesOptions = {
  enabled?: boolean
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

export function useSaleBoardArticles(
  popId: string | undefined,
  categoryId: string | null,
  options?: UseSaleBoardArticlesOptions,
) {
  const search = options?.search?.trim() ?? ""
  const isSearch = Boolean(search)
  const enabled =
    Boolean(popId) &&
    (options?.enabled ?? true) &&
    (isSearch || Boolean(categoryId))

  const query = useInfiniteQuery({
    queryKey: saleBoardArticlesQueryKey(
      popId ?? "",
      isSearch ? "" : (categoryId ?? ""),
      search,
    ),
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1
      const res = await fetchPopArticlesTable(
        popId!,
        saleBoardArticlesInput(categoryId ?? "", page, search),
      )
      if (!res.success) throw new Error(res.error)
      const nextPage =
        res.page * SALE_BOARD_ARTICLE_PAGE_SIZE < res.totalCount
          ? res.page + 1
          : undefined
      return { articles: res.articles, nextPage }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled,
    select: uniqueInfinitePages,
    ...(isSearch
      ? {
          staleTime: 0,
          gcTime: 0,
          refetchOnMount: "always" as const,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        }
      : operateBoardPersistQueryOptions),
  })

  const articles = useMemo((): SaleCatalogArticle[] => {
    const rows = uniqueById(
      query.data?.pages.flatMap((page) => page.articles) ?? [],
    )
    return rows.map((row) =>
      articleListItemToSaleCatalogArticle(row, options?.priceListId),
    )
  }, [options?.priceListId, query.data])

  return {
    articles,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage: query.fetchNextPage,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.error
          ? String(query.error)
          : null,
  }
}
