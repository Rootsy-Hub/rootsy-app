"use client"

import { getMenuCatalogItemsPage } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { getPurchaseCatalogItemsPage } from "@/app/[siteId]/[popId]/purchases/actions"
import { getSaleCatalogItemsPage } from "@/app/[siteId]/[popId]/sale/actions"
import {
  operateCatalogFilterKey,
  type OperateCatalogItemsFilter,
} from "@/lib/operateCatalogPage"
import {
  menuCatalogItemsQueryKey,
  purchaseCatalogItemsQueryKey,
  saleCatalogItemsQueryKey,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export function useSaleCatalogItems(
  popId: string | undefined,
  catalogRev: number | undefined,
  filter: OperateCatalogItemsFilter,
  enabled: boolean,
) {
  const filterKey = operateCatalogFilterKey(filter)
  const query = useInfiniteQuery({
    queryKey: saleCatalogItemsQueryKey(popId ?? "", catalogRev, filterKey),
    queryFn: async ({ pageParam }) => {
      const res = await getSaleCatalogItemsPage(popId!, filter, pageParam)
      if (!res.success) throw new Error(res.error)
      return res.page
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    enabled: enabled && Boolean(popId) && catalogRev != null,
    ...sessionListQueryOptions,
  })

  const articles = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
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

export function useMenuCatalogItems(
  popId: string | undefined,
  catalogRev: number | undefined,
  filter: OperateCatalogItemsFilter,
  enabled: boolean,
) {
  const filterKey = operateCatalogFilterKey(filter)
  const query = useInfiniteQuery({
    queryKey: menuCatalogItemsQueryKey(popId ?? "", catalogRev, filterKey),
    queryFn: async ({ pageParam }) => {
      const res = await getMenuCatalogItemsPage(popId!, filter, pageParam)
      if (!res.success) throw new Error(res.error)
      return res.page
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    enabled: enabled && Boolean(popId) && catalogRev != null,
    ...sessionListQueryOptions,
  })

  const articles = useMemo(
    () => query.data?.pages.flatMap((page) => page.articles) ?? [],
    [query.data],
  )
  const recipes = useMemo(
    () => query.data?.pages.flatMap((page) => page.recipes) ?? [],
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
  catalogRev: number | undefined,
  filter: OperateCatalogItemsFilter,
  enabled: boolean,
) {
  const filterKey = operateCatalogFilterKey(filter)
  const query = useInfiniteQuery({
    queryKey: purchaseCatalogItemsQueryKey(popId ?? "", catalogRev, filterKey),
    queryFn: async ({ pageParam }) => {
      const res = await getPurchaseCatalogItemsPage(popId!, filter, pageParam)
      if (!res.success) throw new Error(res.error)
      return res.page
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    enabled: enabled && Boolean(popId) && catalogRev != null,
    ...sessionListQueryOptions,
  })

  const articles = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
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
