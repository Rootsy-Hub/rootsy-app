"use client"

import type { MenuCatalogCategorySection } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import {
  buildMenuCatalogSections,
  categorySnapshotToRail,
  hasVisibleMenuComboPromotions,
  recipeCategorySnapshotToRail,
} from "@/lib/menuCatalogSections"
import {
  fetchSaleBoardPromotionPages,
  hydratePopCategoriesFromNetwork,
  hydratePopPromotionsFromNetwork,
  hydratePopRecipeCategoriesFromNetwork,
  listAllPromotions,
  listMenuRecipeCategories,
  listSaleBoardCategories,
  openPopLocalDb,
} from "@/lib/popLocalDb"
import {
  menuCatalogSectionsQueryKey,
  popLocalCategoriesHydrateQueryKey,
  popLocalPromotionsHydrateQueryKey,
  popLocalRecipeCategoriesHydrateQueryKey,
} from "@/lib/queryKeys"
import { fetchPopArticleCategories } from "@/lib/rootsyApi/categoriesClient"
import { fetchPopRecipeCategories } from "@/lib/rootsyApi/recipeCategoriesClient"
import { useQuery } from "@tanstack/react-query"

const EMPTY_SECTIONS: MenuCatalogCategorySection[] = []

const hydrateQueryOptions = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
} as const

type UseMenuCatalogSectionsOptions = {
  enabled?: boolean
}

function hydrateDone(query: { isSuccess: boolean; isError: boolean }) {
  return query.isSuccess || query.isError
}

export function useMenuCatalogSections(
  popId: string | undefined,
  options?: UseMenuCatalogSectionsOptions,
) {
  const localStatus = usePopLocalDb(popId)
  const sqliteReady = localStatus === "ready"
  const fallback = localStatus === "fallback"
  const enabled = Boolean(popId) && (options?.enabled ?? true)

  const categoriesHydrate = useQuery({
    queryKey: popLocalCategoriesHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopCategoriesFromNetwork(popId!)
      return true
    },
    enabled: sqliteReady && enabled,
    ...hydrateQueryOptions,
  })

  const recipeCategoriesHydrate = useQuery({
    queryKey: popLocalRecipeCategoriesHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopRecipeCategoriesFromNetwork(popId!)
      return true
    },
    enabled: sqliteReady && enabled,
    ...hydrateQueryOptions,
  })

  const promotionsHydrate = useQuery({
    queryKey: popLocalPromotionsHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopPromotionsFromNetwork(popId!)
      return true
    },
    enabled: sqliteReady && enabled,
    ...hydrateQueryOptions,
  })

  const hydratesReady =
    hydrateDone(categoriesHydrate) &&
    hydrateDone(recipeCategoriesHydrate) &&
    hydrateDone(promotionsHydrate)

  const localQuery = useQuery({
    queryKey: menuCatalogSectionsQueryKey(popId ?? "", "local"),
    queryFn: async (): Promise<MenuCatalogCategorySection[]> => {
      const handle = await openPopLocalDb(popId!)
      return buildMenuCatalogSections({
        recipeCategories: listMenuRecipeCategories(handle.database).map(
          recipeCategorySnapshotToRail,
        ),
        productCategories: listSaleBoardCategories(handle.database).map(
          categorySnapshotToRail,
        ),
        hasPromotions: hasVisibleMenuComboPromotions(
          listAllPromotions(handle.database),
        ),
      })
    },
    enabled: sqliteReady && enabled && hydratesReady,
    ...hydrateQueryOptions,
  })

  const networkQuery = useQuery({
    queryKey: menuCatalogSectionsQueryKey(popId ?? "", "http"),
    queryFn: async (): Promise<MenuCatalogCategorySection[]> => {
      const [recipeCategories, productCategories, promotions] = await Promise.all([
        fetchPopRecipeCategories(popId!),
        fetchPopArticleCategories(popId!),
        fetchSaleBoardPromotionPages(popId!),
      ])
      return buildMenuCatalogSections({
        recipeCategories: recipeCategories
          .filter((row) => row.isActive && row.showInMenu)
          .map(recipeCategorySnapshotToRail),
        productCategories: productCategories
          .filter((row) => row.itemKind === "merchandise" && row.showInSale)
          .map(categorySnapshotToRail),
        hasPromotions: hasVisibleMenuComboPromotions(promotions),
      })
    },
    enabled: fallback && enabled,
    ...hydrateQueryOptions,
  })

  const data = sqliteReady ? localQuery.data : networkQuery.data
  const waitingHydrate = sqliteReady && !hydratesReady
  const activeQuery = sqliteReady ? localQuery : networkQuery
  const hydrateError =
    sqliteReady &&
    (data?.length ?? 0) === 0 &&
    (categoriesHydrate.error ||
      recipeCategoriesHydrate.error ||
      promotionsHydrate.error)
      ? categoriesHydrate.error ??
        recipeCategoriesHydrate.error ??
        promotionsHydrate.error
      : null
  const queryError = activeQuery.error
  const error =
    hydrateError instanceof Error
      ? hydrateError.message
      : hydrateError
        ? String(hydrateError)
        : queryError instanceof Error
          ? queryError.message
          : queryError
            ? String(queryError)
            : null

  return {
    data: data ?? EMPTY_SECTIONS,
    isLoading:
      localStatus === "loading" || waitingHydrate || activeQuery.isLoading,
    error,
  }
}
