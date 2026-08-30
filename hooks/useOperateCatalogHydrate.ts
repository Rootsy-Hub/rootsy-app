"use client"

import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import { usePopOperateCapabilities } from "@/hooks/usePopOperateCapabilities"
import {
  hydratePopArticlesFromNetwork,
  hydratePopCategoriesFromNetwork,
  hydratePopPromotionsFromNetwork,
  hydratePopRecipeBomFromNetwork,
  hydratePopRecipeCategoriesFromNetwork,
  hydratePopRecipesFromNetwork,
} from "@/lib/popLocalDb"
import {
  popLocalArticlesHydrateQueryKey,
  popLocalCategoriesHydrateQueryKey,
  popLocalPromotionsHydrateQueryKey,
  popLocalRecipeBomHydrateQueryKey,
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
  const { caps, ready: capsReady } = usePopOperateCapabilities()
  const sqliteReady = localStatus === "ready"
  const enabled = Boolean(popId) && sqliteReady && capsReady

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
    enabled: enabled && caps.hydratePromotions,
    ...hydrateQueryOptions,
  })

  const recipeCategories = useQuery({
    queryKey: popLocalRecipeCategoriesHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopRecipeCategoriesFromNetwork(popId!)
      return true
    },
    enabled: enabled && caps.hydrateRecipes,
    ...hydrateQueryOptions,
  })

  const recipes = useQuery({
    queryKey: popLocalRecipesHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopRecipesFromNetwork(popId!)
      return true
    },
    enabled:
      enabled &&
      caps.hydrateRecipes &&
      (recipeCategories.isSuccess || recipeCategories.isError),
    ...hydrateQueryOptions,
  })

  const recipeBom = useQuery({
    queryKey: popLocalRecipeBomHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopRecipeBomFromNetwork(popId!)
      return true
    },
    enabled:
      enabled &&
      caps.hydrateBom &&
      (recipes.isSuccess || recipes.isError),
    ...hydrateQueryOptions,
  })

  return {
    sqliteReady,
    articles,
    categories,
    promotions,
    recipeCategories,
    recipes,
    recipeBom,
  }
}
