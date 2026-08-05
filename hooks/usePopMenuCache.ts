"use client"

import {
  getPopAccessCache,
  getUserProfileCache,
} from "@/app/home/homeUserDataActions"
import { buildUserProfileFullName } from "@/app/home/homeUserDataResolve"
import { useQueryPersistReady } from "@/components/providers/QueryProvider"
import { useAuth } from "@/context/AuthContextSupabase"
import {
  popAccessQueryKey,
  userProfileQueryKey,
} from "@/lib/queryKeys"
import { oneDayQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export function usePopMenuCache(popId: string) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id
  const persistReady = useQueryPersistReady()
  const queriesEnabled = persistReady && !authLoading && Boolean(userId) && Boolean(popId)

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

  const popAccess = popAccessQuery.data ?? null
  const profile = profileQuery.data ?? null

  const roleLabel = useMemo(() => {
    if (!popAccess) return ""
    if (popAccess.isOwner) return "Dueño"
    return popAccess.role?.displayName || popAccess.role?.name || "Miembro"
  }, [popAccess])

  const isLoading =
    !queriesEnabled || profileQuery.isPending || popAccessQuery.isPending

  const loadError = profileQuery.isError || popAccessQuery.isError

  return {
    isLoading,
    loadError,
    popAccess,
    profile,
    profileFullName: profile ? buildUserProfileFullName(profile) : "",
    roleLabel,
    enabledModules: popAccess?.enabledModules ?? [],
  }
}
