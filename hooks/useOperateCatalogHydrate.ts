"use client"

import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import {
  hydratePopArticlesFromNetwork,
  hydratePopCategoriesFromNetwork,
  hydratePopPromotionsFromNetwork,
  hydratePopRecipeCategoriesFromNetwork,
  hydratePopRecipesFromNetwork,
} from "@/lib/popLocalDb"
import {
  popLocalArticlesHydrateQueryKey,
  popLocalCategoriesHydrateQueryKey,
  popLocalPromotionsHydrateQueryKey,
  popLocalRecipeCategoriesHydrateQueryKey,
  popLocalRecipesHydrateQueryKey,
} from "@/lib/queryKeys"
import { useQuery } from "@tanstack/react-query"

const hydrateQueryOptions = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
} as const

export function useOperateCatalogHydrate(popId: string | undefined) {
  const localStatus = usePopLocalDb(popId)
  const sqliteReady = localStatus === "ready"
  const enabled = Boolean(popId) && sqliteReady

  const articles = useQuery({
    queryKey: popLocalArticlesHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopArticlesFromNetwork(popId!)
      return true
    },
    enabled,
    ...hydrateQueryOptions,
  })

  const categories = useQuery({
    queryKey: popLocalCategoriesHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopCategoriesFromNetwork(popId!)
      return true
    },
    enabled,
    ...hydrateQueryOptions,
  })

  const promotions = useQuery({
    queryKey: popLocalPromotionsHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopPromotionsFromNetwork(popId!)
      return true
    },
    enabled,
    ...hydrateQueryOptions,
  })

  const recipeCategories = useQuery({
    queryKey: popLocalRecipeCategoriesHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopRecipeCategoriesFromNetwork(popId!)
      return true
    },
    enabled,
    ...hydrateQueryOptions,
  })

  const recipes = useQuery({
    queryKey: popLocalRecipesHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopRecipesFromNetwork(popId!)
      return true
    },
    enabled:
      enabled && (recipeCategories.isSuccess || recipeCategories.isError),
    ...hydrateQueryOptions,
  })

  return {
    sqliteReady,
    articles,
    categories,
    promotions,
    recipeCategories,
    recipes,
  }
}
