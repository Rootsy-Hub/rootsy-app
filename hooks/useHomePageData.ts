"use client"

import {
  getUserPopsAccessBatch,
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
  userPopsAccessBatchQueryKey,
  userProfileQueryKey,
} from "@/lib/queryKeys"
import { oneDayQueryOptions } from "@/lib/queryStaleTimes"
import { useQueryPersistReady } from "@/components/providers/QueryProvider"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"

export function useHomePageData(userId: string) {
  const persistReady = useQueryPersistReady()
  const queryClient = useQueryClient()
  const queriesEnabled = Boolean(userId)

  const profileQuery = useQuery({
    queryKey: userProfileQueryKey(userId),
    queryFn: getUserProfileCache,
    enabled: queriesEnabled,
    ...oneDayQueryOptions,
  })

  const batchQuery = useQuery({
    queryKey: userPopsAccessBatchQueryKey(userId),
    queryFn: getUserPopsAccessBatch,
    enabled: queriesEnabled,
    ...oneDayQueryOptions,
  })

  useEffect(() => {
    const batch = batchQuery.data
    if (!batch) return
    queryClient.setQueryData(userPopIdsQueryKey(userId), batch.popIds)
    for (const popId of batch.popIds) {
      const access = batch.accessByPopId[popId]
      if (access) {
        queryClient.setQueryData(popAccessQueryKey(popId), access)
      }
    }
  }, [batchQuery.data, queryClient, userId])

  const pops = useMemo((): HomePopListItem[] => {
    const accessRows = Object.values(batchQuery.data?.accessByPopId ?? {})
    return buildHomePopListFromAccess(accessRows)
  }, [batchQuery.data])

  const hasCachedSidecar =
    profileQuery.data !== undefined && batchQuery.data !== undefined
  const isLoading =
    !hasCachedSidecar &&
    (!queriesEnabled ||
      !persistReady ||
      profileQuery.isPending ||
      batchQuery.isPending)

  const loadError = profileQuery.isError || batchQuery.isError

  const refetchAll = async () => {
    await Promise.all([profileQuery.refetch(), batchQuery.refetch()])
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
