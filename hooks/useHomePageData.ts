"use client"

import {
  getUserPopsAccessBatch,
  getUserProfileCache,
} from "@/app/home/homeUserDataActions"
import {
  buildHomePopListFromAccess,
  buildUserProfileFullName,
} from "@/app/home/homeUserDataResolve"
import type {
  HomePopListItem,
  UserPopsAccessBatchCache,
  UserProfileCache,
} from "@/app/home/homeUserDataTypes"
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
  const queriesEnabled = Boolean(userId) && persistReady

  const cachedProfile = userId
    ? queryClient.getQueryData<UserProfileCache>(userProfileQueryKey(userId))
    : undefined
  const cachedBatch = userId
    ? queryClient.getQueryData<UserPopsAccessBatchCache>(
        userPopsAccessBatchQueryKey(userId),
      )
    : undefined

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

  const profile = profileQuery.data ?? cachedProfile ?? null
  const batch = batchQuery.data ?? cachedBatch

  useEffect(() => {
    if (!batch) return
    queryClient.setQueryData(userPopIdsQueryKey(userId), batch.popIds)
    for (const popId of batch.popIds) {
      const access = batch.accessByPopId[popId]
      if (access) {
        queryClient.setQueryData(popAccessQueryKey(popId), access)
      }
    }
  }, [batch, queryClient, userId])

  const pops = useMemo((): HomePopListItem[] => {
    const accessRows = Object.values(batch?.accessByPopId ?? {})
    return buildHomePopListFromAccess(accessRows)
  }, [batch])

  const hasCachedBatch = batch !== undefined
  const isLoading =
    !hasCachedBatch && (!queriesEnabled || batchQuery.isPending)

  const loadError = batchQuery.isError && !hasCachedBatch

  const refetchAll = async () => {
    await Promise.all([profileQuery.refetch(), batchQuery.refetch()])
  }

  return {
    profile,
    profileFullName: profile ? buildUserProfileFullName(profile) : "",
    pops,
    isLoading,
    loadError,
    refetchAll,
  }
}
