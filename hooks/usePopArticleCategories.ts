"use client"

import type { ArticleCategoryOption } from "@/app/[siteId]/[popId]/articles/actions"
import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import {
  popArticleCategoriesQueryKey,
  popLocalCategoriesHydrateQueryKey,
} from "@/lib/queryKeys"
import {
  hydratePopCategoriesFromNetwork,
  listAllCategories,
  openPopLocalDb,
} from "@/lib/popLocalDb"
import { categorySnapshotToOption } from "@/lib/popLocalDb/mapCategory"
import { fetchPopArticleCategories } from "@/lib/rootsyApi/categoriesClient"
import { useQuery } from "@tanstack/react-query"

type UsePopArticleCategoriesOptions = {
  enabled?: boolean
}

export function usePopArticleCategories(
  popId: string | undefined,
  options?: UsePopArticleCategoriesOptions,
) {
  const localStatus = usePopLocalDb(popId)
  const sqliteReady = localStatus === "ready"
  const fallback = localStatus === "fallback"
  const enabled = Boolean(popId) && (options?.enabled ?? true)

  const hydrate = useQuery({
    queryKey: popLocalCategoriesHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopCategoriesFromNetwork(popId!)
      return true
    },
    enabled: sqliteReady && enabled,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  })

  const localQuery = useQuery({
    queryKey: popArticleCategoriesQueryKey(popId ?? "", "local"),
    queryFn: async (): Promise<ArticleCategoryOption[]> => {
      const handle = await openPopLocalDb(popId!)
      return listAllCategories(handle.database).map(categorySnapshotToOption)
    },
    enabled: sqliteReady && enabled && (hydrate.isSuccess || hydrate.isError),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const networkQuery = useQuery({
    queryKey: popArticleCategoriesQueryKey(popId ?? "", "http"),
    queryFn: () => fetchPopArticleCategories(popId!),
    enabled: fallback && enabled,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const data = sqliteReady ? localQuery.data : networkQuery.data
  const waitingHydrate =
    sqliteReady &&
    hydrate.isLoading &&
    !hydrate.isError
  const activeQuery = sqliteReady ? localQuery : networkQuery

  return {
    data,
    isPending:
      localStatus === "loading" || waitingHydrate || activeQuery.isPending,
    isLoading:
      localStatus === "loading" || waitingHydrate || activeQuery.isLoading,
    error: activeQuery.error,
  }
}
