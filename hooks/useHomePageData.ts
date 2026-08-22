"use client"

import { buildUserProfileFullName } from "@/app/home/homeUserDataResolve"
import type { HomePopListItem, UserProfileCache } from "@/app/home/homeUserDataTypes"
import { fetchMePops, fetchMeProfile } from "@/lib/rootsyApi/meClient"
import { userPopsQueryKey, userProfileQueryKey } from "@/lib/queryKeys"
import { oneDayQueryOptions } from "@/lib/queryStaleTimes"
import { useQueryPersistReady } from "@/components/providers/QueryProvider"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export function useHomePageData(userId: string) {
  const persistReady = useQueryPersistReady()
  const queryClient = useQueryClient()
  const queriesEnabled = Boolean(userId) && persistReady

  const cachedProfile = userId
    ? queryClient.getQueryData<UserProfileCache>(userProfileQueryKey(userId))
    : undefined
  const cachedPops = userId
    ? queryClient.getQueryData<HomePopListItem[]>(userPopsQueryKey(userId))
    : undefined

  const profileQuery = useQuery({
    queryKey: userProfileQueryKey(userId),
    queryFn: fetchMeProfile,
    enabled: queriesEnabled,
    ...oneDayQueryOptions,
  })

  const popsQuery = useQuery({
    queryKey: userPopsQueryKey(userId),
    queryFn: fetchMePops,
    enabled: queriesEnabled,
    ...oneDayQueryOptions,
  })

  const profile = profileQuery.data ?? cachedProfile ?? null
  const pops = popsQuery.data ?? cachedPops ?? []

  const hasCachedPops = cachedPops !== undefined || popsQuery.data !== undefined
  const isLoading = !hasCachedPops && (!queriesEnabled || popsQuery.isPending)
  const loadError = popsQuery.isError && !hasCachedPops

  const refetchAll = async () => {
    await Promise.all([profileQuery.refetch(), popsQuery.refetch()])
  }

  const canCreatePop = profile?.canCreatePop === true
  const createPopPending =
    profileQuery.isPending && profileQuery.data === undefined && !cachedProfile

  return {
    profile,
    profileFullName: profile ? buildUserProfileFullName(profile) : "",
    pops,
    canCreatePop,
    createPopPending,
    profilePending: createPopPending,
    isLoading,
    loadError,
    refetchAll,
  }
}
