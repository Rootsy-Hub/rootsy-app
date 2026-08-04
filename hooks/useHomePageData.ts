"use client"

import {
  canUserCreatePop,
  getPopSubscriptionInfo,
  getUserPopsList,
  getUserProfile,
  type UserPopListItem,
  type UserProfileDTO,
} from "@/app/profile/actions"
import {
  canUserCreatePopQueryKey,
  popSubscriptionQueryKey,
  userPopsQueryKey,
  userProfileQueryKey,
} from "@/lib/queryKeys"
import { oneDayQueryOptions } from "@/lib/queryStaleTimes"
import { useQueries, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export function useHomePageData(userId: string | undefined) {
  const enabled = Boolean(userId)

  const profileQuery = useQuery({
    queryKey: userProfileQueryKey(userId ?? ""),
    queryFn: getUserProfile,
    enabled,
    ...oneDayQueryOptions,
  })

  const popsQuery = useQuery({
    queryKey: userPopsQueryKey(userId ?? ""),
    queryFn: getUserPopsList,
    enabled,
    ...oneDayQueryOptions,
  })

  const canCreatePopQuery = useQuery({
    queryKey: canUserCreatePopQueryKey(userId ?? ""),
    queryFn: canUserCreatePop,
    enabled,
    ...oneDayQueryOptions,
  })

  const popsBase = popsQuery.data ?? []

  const subscriptionQueries = useQueries({
    queries: popsBase.map((pop) => ({
      queryKey: popSubscriptionQueryKey(pop.id),
      queryFn: () => getPopSubscriptionInfo(pop.id),
      enabled: enabled && popsQuery.isSuccess,
      ...oneDayQueryOptions,
    })),
  })

  const pops = useMemo((): UserPopListItem[] => {
    return popsBase.map((pop, index) => ({
      ...pop,
      subscription: subscriptionQueries[index]?.data ?? null,
    }))
  }, [popsBase, subscriptionQueries])

  const subscriptionsPending =
    popsBase.length > 0 &&
    subscriptionQueries.some((query) => query.isLoading)

  const isLoading =
    profileQuery.isLoading ||
    popsQuery.isLoading ||
    canCreatePopQuery.isLoading ||
    subscriptionsPending

  const loadError =
    profileQuery.isError || popsQuery.isError || canCreatePopQuery.isError

  const refetchAll = async () => {
    await Promise.all([
      profileQuery.refetch(),
      popsQuery.refetch(),
      canCreatePopQuery.refetch(),
      ...subscriptionQueries.map((query) => query.refetch()),
    ])
  }

  return {
    profile: (profileQuery.data ?? null) as UserProfileDTO | null,
    pops,
    canCreatePop: canCreatePopQuery.data?.canCreate === true,
    isLoading,
    loadError,
    refetchAll,
  }
}
