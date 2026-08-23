"use client"

import type { SaleCatalogArticle } from "@/app/[siteId]/[popId]/sale/actions"
import { getMenuCatalogItemsPage } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { getPurchaseCatalogItemsPage } from "@/app/[siteId]/[popId]/purchases/actions"
import { fetchSaleCatalogItemsPage } from "@/lib/rootsyApi/saleClient"
import {
  operateCatalogFilterKey,
  uniqueById,
  uniqueInfinitePages,
  type OperateCatalogItemsFilter,
} from "@/lib/operateCatalogPage"
import {
  menuCatalogItemsQueryKey,
  purchaseCatalogItemsQueryKey,
  saleCatalogCategoryItemsQueryKey,
  saleCatalogKnownArticlesQueryKey,
} from "@/lib/queryKeys"
import {
  operateCatalogQueryOptions,
  sessionListQueryOptions,
} from "@/lib/queryStaleTimes"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type SaleCategoryItemsCache = {
  pages?: { items?: SaleCatalogArticle[] }[]
}

function normalizeSaleSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
}

function articleMatchesSearch(article: SaleCatalogArticle, query: string): boolean {
  const q = normalizeSaleSearch(query)
  if (!q) return false
  return (
    normalizeSaleSearch(article.name).includes(q) ||
    normalizeSaleSearch(article.description).includes(q) ||
    (article.barcode != null && normalizeSaleSearch(article.barcode).includes(q))
  )
}

function cachedPriceListMatches(
  cachedPriceListId: unknown,
  priceListId?: string,
): boolean {
  const cached = typeof cachedPriceListId === "string" ? cachedPriceListId : ""
  const current = priceListId ?? ""
  const isPrincipal = (value: string) => !value || value === "principal"
  if (isPrincipal(current)) return isPrincipal(cached)
  return cached === current
}

function restrictToCatalogCategories(
  articles: SaleCatalogArticle[],
  catalogCategoryIds?: string[],
): SaleCatalogArticle[] {
  if (!catalogCategoryIds || catalogCategoryIds.length === 0) return []
  const allowed = new Set(catalogCategoryIds)
  return articles.filter((article) => allowed.has(article.categoryId))
}

function collectCachedSaleArticles(
  queryClient: ReturnType<typeof useQueryClient>,
  popId: string,
  priceListId?: string,
  catalogCategoryIds?: string[],
): SaleCatalogArticle[] {
  const fromCategories = queryClient.getQueriesData<SaleCategoryItemsCache>({
    queryKey: ["sale-catalog", popId, "category-items"],
  })
  const articles: SaleCatalogArticle[] = []
  for (const [key, data] of fromCategories) {
    if (!cachedPriceListMatches(key[5], priceListId)) continue
    for (const page of data?.pages ?? []) {
      if (page.items) articles.push(...page.items)
    }
  }
  const known = queryClient.getQueryData<SaleCatalogArticle[]>(
    saleCatalogKnownArticlesQueryKey(popId, priceListId),
  )
  if (known) articles.push(...known)
  return restrictToCatalogCategories(uniqueById(articles), catalogCategoryIds)
}

export function useSaleCatalogItems(
  popId: string | undefined,
  filter: OperateCatalogItemsFilter,
  enabled: boolean,
) {
  const isSearch = Boolean(filter.search.trim())
  const query = useInfiniteQuery({
    queryKey: saleCatalogCategoryItemsQueryKey(
      popId ?? "",
      filter.section,
      filter.categoryId,
      filter.priceListId,
    ),
    queryFn: async ({ pageParam }) => {
      const res = await fetchSaleCatalogItemsPage(
        popId!,
        { ...filter, search: "" },
        pageParam,
      )
      if (!res.success) throw new Error(res.error)
      return res.page
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    enabled: enabled && Boolean(popId) && !isSearch,
    select: uniqueInfinitePages,
    ...sessionListQueryOptions,
  })

  const articles = useMemo(
    () => uniqueById(query.data?.pages.flatMap((page) => page.items) ?? []),
    [query.data],
  )

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

/** Búsqueda del catálogo: cache al toque y fetch para completar lo que falte. */
export function useSaleCatalogSearch(
  popId: string | undefined,
  filter: OperateCatalogItemsFilter,
  enabled: boolean,
) {
  const queryClient = useQueryClient()
  const [articles, setArticles] = useState<SaleCatalogArticle[]>([])
  const [nextOffset, setNextOffset] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reqRef = useRef(0)
  const filterRef = useRef(filter)
  filterRef.current = filter
  const searchKey = `${filter.search}:${filter.priceListId ?? ""}:${(filter.catalogCategoryIds ?? []).join(",")}`
  const active = enabled && Boolean(popId) && Boolean(filter.search.trim())

  useEffect(() => {
    if (!active || !popId) {
      setArticles([])
      setNextOffset(null)
      setError(null)
      setIsLoading(false)
      return
    }
    const cachedHits = collectCachedSaleArticles(
      queryClient,
      popId,
      filterRef.current.priceListId,
      filterRef.current.catalogCategoryIds,
    ).filter((article) => articleMatchesSearch(article, filterRef.current.search))
    const req = ++reqRef.current
    setArticles(cachedHits)
    setNextOffset(null)
    setError(null)
    setIsLoading(cachedHits.length === 0)
    void fetchSaleCatalogItemsPage(popId, filterRef.current, 0).then((res) => {
      if (req !== reqRef.current) return
      if (!res.success) {
        if (cachedHits.length === 0) {
          setError(res.error)
          setArticles([])
        }
        setNextOffset(null)
      } else {
        setArticles(
          uniqueById([
            ...cachedHits,
            ...restrictToCatalogCategories(
              res.page.items,
              filterRef.current.catalogCategoryIds,
            ),
          ]),
        )
        setNextOffset(res.page.nextOffset)
      }
      setIsLoading(false)
    })
  }, [active, popId, queryClient, searchKey])

  const fetchNextPage = useCallback(async () => {
    if (!popId || nextOffset == null || isFetchingNextPage) return
    const req = reqRef.current
    setIsFetchingNextPage(true)
    const res = await fetchSaleCatalogItemsPage(
      popId,
      filterRef.current,
      nextOffset,
    )
    if (req !== reqRef.current) {
      setIsFetchingNextPage(false)
      return
    }
    if (res.success) {
      setArticles((prev) =>
        uniqueById([
          ...prev,
          ...restrictToCatalogCategories(
            res.page.items,
            filterRef.current.catalogCategoryIds,
          ),
        ]),
      )
      setNextOffset(res.page.nextOffset)
    }
    setIsFetchingNextPage(false)
  }, [isFetchingNextPage, nextOffset, popId])

  return {
    articles,
    isLoading,
    isFetchingNextPage,
    hasNextPage: nextOffset != null,
    fetchNextPage,
    error,
  }
}

export function useMenuCatalogItems(
  popId: string | undefined,
  filter: OperateCatalogItemsFilter,
  enabled: boolean,
) {
  const filterKey = operateCatalogFilterKey(filter)
  const query = useInfiniteQuery({
    queryKey: menuCatalogItemsQueryKey(popId ?? "", filterKey),
    queryFn: async ({ pageParam }) => {
      const res = await getMenuCatalogItemsPage(popId!, filter, pageParam)
      if (!res.success) throw new Error(res.error)
      return res.page
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    enabled: enabled && Boolean(popId),
    select: uniqueInfinitePages,
    ...operateCatalogQueryOptions,
  })

  const articles = useMemo(
    () => uniqueById(query.data?.pages.flatMap((page) => page.articles) ?? []),
    [query.data],
  )
  const recipes = useMemo(
    () => uniqueById(query.data?.pages.flatMap((page) => page.recipes) ?? []),
    [query.data],
  )

  return {
    articles,
    recipes,
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

export function usePurchaseCatalogItems(
  popId: string | undefined,
  filter: OperateCatalogItemsFilter,
  enabled: boolean,
) {
  const filterKey = operateCatalogFilterKey(filter)
  const query = useInfiniteQuery({
    queryKey: purchaseCatalogItemsQueryKey(popId ?? "", filterKey),
    queryFn: async ({ pageParam }) => {
      const res = await getPurchaseCatalogItemsPage(popId!, filter, pageParam)
      if (!res.success) throw new Error(res.error)
      return res.page
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    enabled: enabled && Boolean(popId),
    select: uniqueInfinitePages,
    ...operateCatalogQueryOptions,
  })

  const articles = useMemo(
    () => uniqueById(query.data?.pages.flatMap((page) => page.items) ?? []),
    [query.data],
  )

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
