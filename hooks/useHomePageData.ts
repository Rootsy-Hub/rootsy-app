"use client"

import {
  getPopAccessCache,
  getUserPopIdsCache,
  getUserProfileCache,
} from "@/app/home/homeUserDataActions"
import {
  buildHomePopListFromAccess,
  buildUserProfileFullName,
} from "@/app/home/homeUserDataResolve"
import type { HomePopListItem } from "@/app/home/homeUserDataTypes"
import {
  popAccessQueryKey,
  userPopIdsQueryKey,
  userProfileQueryKey,
} from "@/lib/queryKeys"
import { oneDayQueryOptions } from "@/lib/queryStaleTimes"
import { useQueryPersistReady } from "@/components/providers/QueryProvider"
import { useQueries, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export function useHomePageData(userId: string) {
  const persistReady = useQueryPersistReady()
  const queriesEnabled = persistReady

  const profileQuery = useQuery({
    queryKey: userProfileQueryKey(userId),
    queryFn: getUserProfileCache,
    enabled: queriesEnabled,
    ...oneDayQueryOptions,
  })

  const popIdsQuery = useQuery({
    queryKey: userPopIdsQueryKey(userId),
    queryFn: getUserPopIdsCache,
    enabled: queriesEnabled,
    ...oneDayQueryOptions,
  })

  const popIds = popIdsQuery.data ?? []

  const popAccessQueries = useQueries({
    queries: popIds.map((popId) => ({
      queryKey: popAccessQueryKey(popId),
      queryFn: () => getPopAccessCache(popId),
      enabled: queriesEnabled && popIdsQuery.isSuccess,
      ...oneDayQueryOptions,
    })),
  })

  const pops = useMemo((): HomePopListItem[] => {
    const accessRows = popAccessQueries
      .map((query) => query.data)
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
    return buildHomePopListFromAccess(accessRows)
  }, [popAccessQueries])

  const popAccessPending =
    popIds.length > 0 && popAccessQueries.some((query) => query.isPending)

  const isLoading =
    !persistReady ||
    profileQuery.isPending ||
    popIdsQuery.isPending ||
    popAccessPending

  const loadError =
    profileQuery.isError || popIdsQuery.isError || popAccessQueries.some(
      (query) => query.isError,
    )

  const refetchAll = async () => {
    await Promise.all([
      profileQuery.refetch(),
      popIdsQuery.refetch(),
      ...popAccessQueries.map((query) => query.refetch()),
    ])
  }

  const profile = profileQuery.data ?? null

  return {
    profile,
    profileFullName: profile ? buildUserProfileFullName(profile) : "",
    pops,
    isLoading,
    loadError,
    refetchAll,
  }
}
