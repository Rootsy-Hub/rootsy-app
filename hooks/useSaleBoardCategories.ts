"use client"

import type { ArticleCategoryOption } from "@/app/[siteId]/[popId]/articles/actions"
import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import {
  popLocalCategoriesHydrateQueryKey,
  saleBoardCategoriesQueryKey,
} from "@/lib/queryKeys"
import {
  hydratePopCategoriesFromNetwork,
  listSaleBoardCategories,
  openPopLocalDb,
} from "@/lib/popLocalDb"
import { categorySnapshotToOption } from "@/lib/popLocalDb/mapCategory"
import { fetchPopArticleCategories } from "@/lib/rootsyApi/categoriesClient"
import { useQuery } from "@tanstack/react-query"

type UseSaleBoardCategoriesOptions = {
  enabled?: boolean
}

export function useSaleBoardCategories(
  popId: string | undefined,
  options?: UseSaleBoardCategoriesOptions,
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
    queryKey: saleBoardCategoriesQueryKey(popId ?? "", "local"),
    queryFn: async (): Promise<ArticleCategoryOption[]> => {
      const handle = await openPopLocalDb(popId!)
      return listSaleBoardCategories(handle.database).map(
        categorySnapshotToOption,
      )
    },
    enabled: sqliteReady && enabled && (hydrate.isSuccess || hydrate.isError),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const networkQuery = useQuery({
    queryKey: saleBoardCategoriesQueryKey(popId ?? "", "http"),
    queryFn: () =>
      fetchPopArticleCategories(popId!, {
        itemKind: "merchandise",
        showInSale: true,
      }),
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
  const hydrateError =
    sqliteReady && (data?.length ?? 0) === 0 && hydrate.error
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
    data,
    isLoading: localStatus === "loading" || waitingHydrate || activeQuery.isLoading,
    isPending:
      localStatus === "loading" || waitingHydrate || activeQuery.isPending,
    error: hydrateError ?? queryError,
  }
}
