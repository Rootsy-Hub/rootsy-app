"use client"

import { getPopAccessCache } from "@/app/home/homeUserDataActions"
import type {
  PopAccessCache,
  UserProfileCache,
} from "@/app/home/homeUserDataTypes"
import { buildUserProfileFullName } from "@/app/home/homeUserDataResolve"
import { buildPopRoleLabel } from "@/lib/popWorkspaceFromAccess"
import {
  normalizePopAccessCache,
  popAccessCacheNeedsRefresh,
} from "@/lib/popAccessNormalize"
import { useQueryPersistReady } from "@/components/providers/QueryProvider"
import { useAuth } from "@/context/AuthContextSupabase"
import { popAccessQueryKey, userProfileQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchMeProfile } from "@/lib/rootsyApi/meClient"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"

export function usePopAccessData(
  popId: string,
  options?: { enabled?: boolean },
) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id
  const persistReady = useQueryPersistReady()
  const queryClient = useQueryClient()
  const cachedProfile = userId
    ? queryClient.getQueryData<UserProfileCache>(userProfileQueryKey(userId))
    : undefined
  const cachedPopAccess = popId
    ? queryClient.getQueryData<PopAccessCache | null>(popAccessQueryKey(popId))
    : undefined
  const queriesEnabled =
    persistReady &&
    (options?.enabled ?? true) &&
    !authLoading &&
    Boolean(userId) &&
    Boolean(popId)

  const profileQuery = useQuery({
    queryKey: userProfileQueryKey(userId ?? ""),
    queryFn: fetchMeProfile,
    enabled: queriesEnabled,
    ...sessionListQueryOptions,
  })

  const popAccessQuery = useQuery({
    queryKey: popAccessQueryKey(popId),
    queryFn: () => getPopAccessCache(popId),
    enabled: queriesEnabled,
    ...sessionListQueryOptions,
  })

  const profileData = profileQuery.data ?? cachedProfile
  const popAccessData = popAccessQuery.data ?? cachedPopAccess

  const popAccess = useMemo(
    () => normalizePopAccessCache(popAccessData),
    [popAccessData],
  )
  const profile = profileData ?? null

  useEffect(() => {
    if (!queriesEnabled || !popAccessQuery.data) return
    if (!popAccessCacheNeedsRefresh(popAccessQuery.data)) return
    void popAccessQuery.refetch()
  }, [queriesEnabled, popAccessQuery.data, popAccessQuery.refetch])

  const roleLabel = useMemo(
    () => (popAccess ? buildPopRoleLabel(popAccess) : ""),
    [popAccess],
  )

  const hasCachedSidecar =
    profileData !== undefined && popAccessData !== undefined
  const isLoading =
    !hasCachedSidecar &&
    (!queriesEnabled ||
      !persistReady ||
      profileQuery.isPending ||
      popAccessQuery.isPending)

  const loadError = profileQuery.isError || popAccessQuery.isError

  const refetch = async () => {
    await Promise.all([profileQuery.refetch(), popAccessQuery.refetch()])
  }

  return {
    isLoading,
    loadError,
    popAccess,
    profile,
    profileFullName: profile ? buildUserProfileFullName(profile) : "",
    roleLabel,
    enabledModules: popAccess?.enabledModules ?? [],
    refetch,
  }
}
