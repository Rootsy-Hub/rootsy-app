"use client"

import {
  getUserMemberPopsCache,
  getUserOwnedPopsCache,
  getUserProfileCache,
} from "@/app/home/homeUserDataActions"
import {
  buildHomePopList,
  buildUserProfileFullName,
} from "@/app/home/homeUserDataResolve"
import { getPopSubscriptionInfo } from "@/app/profile/actions"
import type { UserPopListItem } from "@/app/profile/actions"
import {
  popSubscriptionQueryKey,
  userPopsOwnerQueryKey,
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
    queryFn: getUserProfileCache,
    enabled,
    ...oneDayQueryOptions,
  })

  const ownedPopsQuery = useQuery({
    queryKey: userPopsOwnerQueryKey(userId ?? ""),
    queryFn: getUserOwnedPopsCache,
    enabled,
    ...oneDayQueryOptions,
  })

  const memberPopsQuery = useQuery({
    queryKey: userPopsQueryKey(userId ?? ""),
    queryFn: getUserMemberPopsCache,
    enabled,
    ...oneDayQueryOptions,
  })

  const popsBase = useMemo(() => {
    return buildHomePopList(
      ownedPopsQuery.data ?? [],
      memberPopsQuery.data ?? [],
    )
  }, [ownedPopsQuery.data, memberPopsQuery.data])

  const subscriptionQueries = useQueries({
    queries: popsBase.map((pop) => ({
      queryKey: popSubscriptionQueryKey(pop.id),
      queryFn: () => getPopSubscriptionInfo(pop.id),
      enabled:
        enabled &&
        ownedPopsQuery.isSuccess &&
        memberPopsQuery.isSuccess,
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
    ownedPopsQuery.isLoading ||
    memberPopsQuery.isLoading ||
    subscriptionsPending

  const loadError =
    profileQuery.isError ||
    ownedPopsQuery.isError ||
    memberPopsQuery.isError

  const refetchAll = async () => {
    await Promise.all([
      profileQuery.refetch(),
      ownedPopsQuery.refetch(),
      memberPopsQuery.refetch(),
      ...subscriptionQueries.map((query) => query.refetch()),
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
