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
import { fetchPopCacheRevisions } from "@/lib/popCacheRevisions"
import { useQueryPersistReady } from "@/components/providers/QueryProvider"
import { useAuth } from "@/context/AuthContextSupabase"
import {
  popAccessQueryKey,
  popPermissionsRevQueryKey,
  userProfileQueryKey,
} from "@/lib/queryKeys"
import {
  catalogRevQueryOptions,
  oneDayQueryOptions,
} from "@/lib/queryStaleTimes"
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

  const permissionsRevQuery = useQuery({
    queryKey: popPermissionsRevQueryKey(popId),
    queryFn: async () => {
      const revisions = await fetchPopCacheRevisions(popId)
      return revisions.permissionsRev
    },
    enabled: queriesEnabled,
    ...catalogRevQueryOptions,
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

  useEffect(() => {
    if (!queriesEnabled || !popAccessQuery.data) return
    if (permissionsRevQuery.data == null || popAccessQuery.isFetching) return
    if (popAccessQuery.data.permissionsRev === permissionsRevQuery.data) return
    void queryClient.invalidateQueries({
      queryKey: popAccessQueryKey(popId),
    })
  }, [
    queriesEnabled,
    permissionsRevQuery.data,
    popAccessQuery.data,
    popAccessQuery.isFetching,
    popId,
    queryClient,
  ])

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
