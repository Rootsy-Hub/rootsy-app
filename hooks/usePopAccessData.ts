"use client"

import {
  getPopAccessCache,
  getUserProfileCache,
} from "@/app/home/homeUserDataActions"
import { buildUserProfileFullName } from "@/app/home/homeUserDataResolve"
import { buildPopRoleLabel } from "@/lib/popWorkspaceFromAccess"
import {
  normalizePopAccessCache,
  popAccessCacheNeedsRefresh,
} from "@/lib/popAccessNormalize"
import { useQueryPersistReady } from "@/components/providers/QueryProvider"
import { useAuth } from "@/context/AuthContextSupabase"
import {
  popAccessQueryKey,
  userProfileQueryKey,
} from "@/lib/queryKeys"
import { oneDayQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"

export function usePopAccessData(
  popId: string,
  options?: { enabled?: boolean },
) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id
  const persistReady = useQueryPersistReady()
  const queriesEnabled =
    (options?.enabled ?? true) &&
    persistReady &&
    !authLoading &&
    Boolean(userId) &&
    Boolean(popId)

  const profileQuery = useQuery({
    queryKey: userProfileQueryKey(userId ?? ""),
    queryFn: getUserProfileCache,
    enabled: queriesEnabled,
    ...oneDayQueryOptions,
  })

  const popAccessQuery = useQuery({
    queryKey: popAccessQueryKey(popId),
    queryFn: () => getPopAccessCache(popId),
    enabled: queriesEnabled,
    ...oneDayQueryOptions,
  })

  const popAccess = useMemo(
    () => normalizePopAccessCache(popAccessQuery.data),
    [popAccessQuery.data],
  )
  const profile = profileQuery.data ?? null

  useEffect(() => {
    if (!queriesEnabled || !popAccessQuery.data) return
    if (!popAccessCacheNeedsRefresh(popAccessQuery.data)) return
    void popAccessQuery.refetch()
  }, [queriesEnabled, popAccessQuery.data, popAccessQuery.refetch])

  const roleLabel = useMemo(
    () => (popAccess ? buildPopRoleLabel(popAccess) : ""),
    [popAccess],
  )

  const isLoading =
    !queriesEnabled || profileQuery.isPending || popAccessQuery.isPending

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
