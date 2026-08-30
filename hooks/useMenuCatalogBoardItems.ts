"use client"

import type {
  MenuCatalogPromotion,
  MenuCatalogRecipe,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { SaleCatalogArticle } from "@/app/[siteId]/[popId]/sale/actions"
import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import { usePopOperateCapabilities } from "@/hooks/usePopOperateCapabilities"
import { prefetchCatalogProductImages } from "@/lib/catalogProductImageCache"
import {
  uniqueById,
  uniqueInfinitePages,
  type OperateCatalogItemsFilter,
} from "@/lib/operateCatalogPage"
import { recipeSnapshotToMenuCatalogRecipe } from "@/lib/popLocalDb/mapRecipe"
import {
  fetchOperateRecipePages,
  fetchSaleBoardMerchandisePages,
  fetchSaleBoardPromotionPages,
  hydratePopArticlesFromNetwork,
  hydratePopPromotionsFromNetwork,
  hydratePopRecipeBomFromNetwork,
  hydratePopRecipesFromNetwork,
  listAllPromotions,
  listMenuRecipes,
  listSaleBoardArticles,
  openPopLocalDb,
  splitLocalPromotionsForMenu,
} from "@/lib/popLocalDb"
import type { ArticleSnapshot, RecipeSnapshot } from "@/lib/popLocalDb/types"
import {
  menuBoardArticlesQueryKey,
  menuBoardItemsQueryRoot,
  menuBoardPromotionsQueryKey,
  menuBoardRecipesQueryKey,
  popLocalArticlesHydrateQueryKey,
  popLocalPromotionsHydrateQueryKey,
  popLocalRecipeBomHydrateQueryKey,
  popLocalRecipesHydrateQueryKey,
} from "@/lib/queryKeys"
import type { ArticleListItem } from "@/lib/rootsyApi/articlesClient"
import {
  articleListItemToSaleCatalogArticle,
  articleSnapshotToSaleCatalogArticle,
} from "@/lib/saleCatalogArticleMap"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"

export const MENU_BOARD_PAGE_SIZE = 50

const EMPTY_ARTICLES: SaleCatalogArticle[] = []
const EMPTY_RECIPES: MenuCatalogRecipe[] = []
const EMPTY_PROMOS: MenuCatalogPromotion[] = []

const hydrateQueryOptions = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
} as const

type UseMenuCatalogBoardItemsOptions = {
  enabled?: boolean
}

function nextPageFromCount(page: number, totalCount: number, pageSize: number) {
  return page * pageSize < totalCount ? page + 1 : undefined
}

function matchesSearch(value: string, query: string) {
  return value.toLowerCase().includes(query)
}

function isMenuHttpArticle(
  row: ArticleListItem,
  filter: OperateCatalogItemsFilter,
): boolean {
  if (!row.isActive || !row.isSellable || row.itemKind !== "merchandise") {
    return false
  }
  const q = filter.search.trim().toLowerCase()
  if (q) {
    const inCatalog =
      !filter.catalogCategoryIds?.length ||
      filter.catalogCategoryIds.includes(row.categoryId ?? "")
    if (!inCatalog) return false
    return (
      row.name.toLowerCase().includes(q) ||
      (row.description ?? "").toLowerCase().includes(q) ||
      (row.barcode ?? "").toLowerCase().includes(q)
    )
  }
  if (filter.section === "products" && filter.categoryId) {
    return row.categoryId === filter.categoryId
  }
  return false
}

function isMenuHttpRecipe(
  row: RecipeSnapshot,
  filter: OperateCatalogItemsFilter,
): boolean {
  if (!row.isActive) return false
  const q = filter.search.trim().toLowerCase()
  if (q) {
    const inCatalog =
      !filter.catalogCategoryIds?.length ||
      filter.catalogCategoryIds.includes(row.categoryId)
    if (!inCatalog) return false
    return (
      matchesSearch(row.name, q) || matchesSearch(row.description, q)
    )
  }
  if (filter.section === "recipes" && filter.categoryId) {
    return row.categoryId === filter.categoryId
  }
  return false
}

export function useMenuCatalogBoardItems(
  popId: string | undefined,
  filter: OperateCatalogItemsFilter,
  options?: UseMenuCatalogBoardItemsOptions,
) {
  const queryClient = useQueryClient()
  const localStatus = usePopLocalDb(popId)
  const { caps, ready: capsReady } = usePopOperateCapabilities()
  const sqliteReady = localStatus === "ready"
  const fallback = localStatus === "fallback"
  const search = filter.search.trim()
  const isSearch = Boolean(search)
  const wantArticles =
    isSearch || filter.section === "products" || filter.section === "discounts"
  const wantRecipes =
    (isSearch || filter.section === "recipes") && caps.hydrateRecipes
  const wantPromotions =
    (isSearch || filter.section === "promotions") && caps.hydratePromotions
  const listingEnabled =
    Boolean(popId) && (options?.enabled ?? true) && capsReady
  const categoryId = filter.categoryId ?? ""
  const catalogCategoryIds = filter.catalogCategoryIds

  const articlesHydrate = useQuery({
    queryKey: popLocalArticlesHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopArticlesFromNetwork(popId!, {
        onProgress: () => {
          void queryClient.invalidateQueries({
            queryKey: menuBoardItemsQueryRoot(popId!),
          })
        },
      })
      return true
    },
    enabled: sqliteReady && listingEnabled && wantArticles,
    ...hydrateQueryOptions,
  })

  const recipesHydrate = useQuery({
    queryKey: popLocalRecipesHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopRecipesFromNetwork(popId!, {
        onProgress: () => {
          void queryClient.invalidateQueries({
            queryKey: menuBoardItemsQueryRoot(popId!),
          })
        },
      })
      return true
    },
    enabled: sqliteReady && listingEnabled && wantRecipes,
    ...hydrateQueryOptions,
  })

  const recipeBomHydrate = useQuery({
    queryKey: popLocalRecipeBomHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopRecipeBomFromNetwork(popId!, {
        onProgress: () => {
          void queryClient.invalidateQueries({
            queryKey: menuBoardItemsQueryRoot(popId!),
          })
        },
      })
      return true
    },
    enabled:
      sqliteReady &&
      listingEnabled &&
      wantRecipes &&
      caps.hydrateBom &&
      (recipesHydrate.isSuccess || recipesHydrate.isError),
    ...hydrateQueryOptions,
  })

  const promotionsHydrate = useQuery({
    queryKey: popLocalPromotionsHydrateQueryKey(popId ?? ""),
    queryFn: async () => {
      await hydratePopPromotionsFromNetwork(popId!)
      return true
    },
    enabled: sqliteReady && listingEnabled && wantPromotions,
    ...hydrateQueryOptions,
  })

  const articlesQuery = useInfiniteQuery({
    queryKey: menuBoardArticlesQueryKey(
      popId ?? "",
      isSearch ? "" : categoryId,
      search,
      "local",
    ),
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1
      const handle = await openPopLocalDb(popId!)
      const res = listSaleBoardArticles(handle.database, {
        categoryId: isSearch ? null : filter.categoryId,
        categoryIds: isSearch ? catalogCategoryIds : undefined,
        search,
        page,
        pageSize: MENU_BOARD_PAGE_SIZE,
      })
      return {
        articles: res.articles,
        nextPage: nextPageFromCount(
          res.page,
          res.totalCount,
          MENU_BOARD_PAGE_SIZE,
        ),
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: sqliteReady && listingEnabled && wantArticles,
    select: uniqueInfinitePages,
    ...hydrateQueryOptions,
  })

  const recipesQuery = useInfiniteQuery({
    queryKey: menuBoardRecipesQueryKey(
      popId ?? "",
      isSearch ? "" : categoryId,
      search,
      "local",
    ),
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1
      const handle = await openPopLocalDb(popId!)
      const res = listMenuRecipes(handle.database, {
        categoryId: isSearch ? null : filter.categoryId,
        categoryIds: isSearch ? catalogCategoryIds : undefined,
        search,
        page,
        pageSize: MENU_BOARD_PAGE_SIZE,
      })
      return {
        recipes: res.recipes,
        nextPage: nextPageFromCount(
          res.page,
          res.totalCount,
          MENU_BOARD_PAGE_SIZE,
        ),
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: sqliteReady && listingEnabled && wantRecipes,
    select: uniqueInfinitePages,
    ...hydrateQueryOptions,
  })

  const promotionsQuery = useQuery({
    queryKey: menuBoardPromotionsQueryKey(popId ?? "", "local"),
    queryFn: async () => {
      const handle = await openPopLocalDb(popId!)
      return splitLocalPromotionsForMenu(listAllPromotions(handle.database)).combos
    },
    enabled: sqliteReady && listingEnabled && wantPromotions,
    ...hydrateQueryOptions,
  })

  const networkArticlesDump = useQuery({
    queryKey: [...popLocalArticlesHydrateQueryKey(popId ?? ""), "http"] as const,
    queryFn: () => fetchSaleBoardMerchandisePages(popId!),
    enabled: fallback && listingEnabled && wantArticles,
    ...hydrateQueryOptions,
  })

  const networkRecipesDump = useQuery({
    queryKey: [...popLocalRecipesHydrateQueryKey(popId ?? ""), "http"] as const,
    queryFn: () => fetchOperateRecipePages(popId!),
    enabled: fallback && listingEnabled && wantRecipes,
    ...hydrateQueryOptions,
  })

  const networkPromotionsDump = useQuery({
    queryKey: [...popLocalPromotionsHydrateQueryKey(popId ?? ""), "http"] as const,
    queryFn: () => fetchSaleBoardPromotionPages(popId!),
    enabled: fallback && listingEnabled && wantPromotions,
    ...hydrateQueryOptions,
  })

  const localArticles = useMemo((): SaleCatalogArticle[] => {
    const rows = uniqueById(
      (articlesQuery.data?.pages.flatMap((page) => page.articles) ??
        []) as ArticleSnapshot[],
    )
    return rows.map((row) =>
      articleSnapshotToSaleCatalogArticle(row, filter.priceListId),
    )
  }, [articlesQuery.data, filter.priceListId])

  const localRecipes = useMemo((): MenuCatalogRecipe[] => {
    const rows = uniqueById(
      (recipesQuery.data?.pages.flatMap((page) => page.recipes) ??
        []) as RecipeSnapshot[],
    )
    return rows.map((row) =>
      recipeSnapshotToMenuCatalogRecipe(row, filter.priceListId),
    )
  }, [filter.priceListId, recipesQuery.data])

  const networkArticles = useMemo((): SaleCatalogArticle[] => {
    return uniqueById(networkArticlesDump.data ?? [])
      .filter((row) => isMenuHttpArticle(row, filter))
      .map((row) => articleListItemToSaleCatalogArticle(row, filter.priceListId))
  }, [filter, networkArticlesDump.data])

  const networkRecipes = useMemo((): MenuCatalogRecipe[] => {
    return uniqueById(networkRecipesDump.data ?? [])
      .filter((row) => isMenuHttpRecipe(row, filter))
      .map((row) => recipeSnapshotToMenuCatalogRecipe(row, filter.priceListId))
  }, [filter, networkRecipesDump.data])

  const networkPromotions = useMemo(
    () =>
      splitLocalPromotionsForMenu(networkPromotionsDump.data ?? []).combos,
    [networkPromotionsDump.data],
  )

  const articles = sqliteReady
    ? wantArticles
      ? localArticles
      : EMPTY_ARTICLES
    : wantArticles
      ? networkArticles
      : EMPTY_ARTICLES
  const recipes = sqliteReady
    ? wantRecipes
      ? localRecipes
      : EMPTY_RECIPES
    : wantRecipes
      ? networkRecipes
      : EMPTY_RECIPES
  const promotions = sqliteReady
    ? wantPromotions
      ? (promotionsQuery.data ?? EMPTY_PROMOS)
      : EMPTY_PROMOS
    : wantPromotions
      ? networkPromotions
      : EMPTY_PROMOS

  useEffect(() => {
    prefetchCatalogProductImages([
      ...articles.map((row) => row.imageUrl),
      ...recipes.map((row) => row.imageUrl),
      ...promotions.map((row) => row.imageUrl),
    ])
  }, [articles, promotions, recipes])

  const waitingArticles =
    wantArticles &&
    articles.length === 0 &&
    (sqliteReady
      ? articlesHydrate.isLoading || articlesQuery.isLoading
      : networkArticlesDump.isLoading)
  const waitingRecipes =
    wantRecipes &&
    recipes.length === 0 &&
    (sqliteReady
      ? recipesHydrate.isLoading || recipesQuery.isLoading
      : networkRecipesDump.isLoading)
  const waitingPromotions =
    wantPromotions &&
    promotions.length === 0 &&
    (sqliteReady
      ? promotionsHydrate.isLoading || promotionsQuery.isLoading
      : networkPromotionsDump.isLoading)

  const isLoading =
    localStatus === "loading" ||
    waitingArticles ||
    waitingRecipes ||
    waitingPromotions

  const hydrateError =
    (wantArticles && articles.length === 0 && articlesHydrate.error) ||
    (wantRecipes && recipes.length === 0 && recipesHydrate.error) ||
    (wantRecipes &&
      recipes.length === 0 &&
      caps.hydrateBom &&
      recipeBomHydrate.error) ||
    (wantPromotions && promotions.length === 0 && promotionsHydrate.error)
  const queryError = articlesQuery.error ?? recipesQuery.error ?? promotionsQuery.error

  const fetchNextPage = async () => {
    await Promise.all([
      wantArticles && articlesQuery.hasNextPage
        ? articlesQuery.fetchNextPage()
        : Promise.resolve(),
      wantRecipes && recipesQuery.hasNextPage
        ? recipesQuery.fetchNextPage()
        : Promise.resolve(),
    ])
  }

  return {
    articles,
    recipes,
    promotions,
    isLoading,
    isFetchingNextPage:
      articlesQuery.isFetchingNextPage || recipesQuery.isFetchingNextPage,
    hasNextPage: Boolean(articlesQuery.hasNextPage || recipesQuery.hasNextPage),
    fetchNextPage,
    error: hydrateError
      ? hydrateError instanceof Error
        ? hydrateError.message
        : String(hydrateError)
      : queryError instanceof Error
        ? queryError.message
        : queryError
          ? String(queryError)
          : null,
  }
}
