"use client"

import type { HomePopListItem, UserProfileCache } from "@/app/home/homeUserDataTypes"
import { buildUserProfileFullName } from "@/app/home/homeUserDataResolve"
import { useQueryPersistReady } from "@/components/providers/QueryProvider"
import { useAuth } from "@/context/AuthContextSupabase"
import {
  enabledModulesFromPermissionKeys,
  homePopToMenuAccess,
} from "@/lib/menuPopAccess"
import { modulesAvailableForPop } from "@/lib/rootsySubscriptionCatalog"
import { userPopsQueryKey, userProfileQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchMePops, fetchMeProfile } from "@/lib/rootsyApi/meClient"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

export function usePopMenuCache(popId: string) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? ""
  const persistReady = useQueryPersistReady()
  const queryClient = useQueryClient()
  const queriesEnabled =
    persistReady && !authLoading && Boolean(userId) && Boolean(popId)

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
    ...sessionListQueryOptions,
  })

  const popsQuery = useQuery({
    queryKey: userPopsQueryKey(userId),
    queryFn: fetchMePops,
    enabled: queriesEnabled,
    ...sessionListQueryOptions,
  })

  const profile = profileQuery.data ?? cachedProfile ?? null
  const pops = popsQuery.data ?? cachedPops ?? []
  const pop = pops.find((item) => item.id === popId) ?? null

  const enabledModules = useMemo(
    () =>
      pop
        ? enabledModulesFromPermissionKeys(
            pop.permissions,
            pop.isOwner,
            modulesAvailableForPop({
              businessTypeName: pop.subscription.businessTypeName,
              allModules: pop.limits.allModules,
            }),
          )
        : [],
    [pop],
  )

  const popAccess = useMemo(
    () => (pop ? homePopToMenuAccess(pop, enabledModules) : null),
    [pop, enabledModules],
  )

  const hasCachedPops = cachedPops !== undefined || popsQuery.data !== undefined
  const isLoading = !hasCachedPops && (!queriesEnabled || popsQuery.isPending)
  const loadError = popsQuery.isError && !hasCachedPops

  return {
    isLoading,
    loadError,
    popAccess,
    profile,
    profileFullName: profile ? buildUserProfileFullName(profile) : "",
    roleLabel: pop?.roleName ?? "",
    enabledModules,
    dockItemIds: pop?.dockItemIds,
  }
}
