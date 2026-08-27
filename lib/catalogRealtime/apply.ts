"use client"

import {
  clearPopLocalArticlesHydrateMarks,
  clearPopLocalCategoriesHydrateMark,
  clearPopLocalPromotionsHydrateMark,
  clearPopLocalRecipeCategoriesHydrateMark,
  clearPopLocalRecipesHydrateMark,
  deleteArticleById,
  deleteCategoryById,
  deletePromotionById,
  deleteRecipeById,
  deleteRecipeCategoryById,
  getCategoryById,
  getRecipeCategoryById,
  openPopLocalDb,
  renameArticlesCategory,
  renameRecipesCategory,
  updateRecipesStationForCategory,
  upsertArticleSnapshots,
  upsertCategorySnapshots,
  upsertPromotionSnapshots,
  upsertRecipeCategorySnapshots,
  upsertRecipeSnapshots,
} from "@/lib/popLocalDb"
import {
  articleIdFromRealtimeEvent,
  articleSnapshotFromRealtimePayload,
} from "@/lib/catalogRealtime/articlePayload"
import {
  categoryPatchFromRealtimePayload,
  categorySnapshotFromPatch,
} from "@/lib/catalogRealtime/categoryPayload"
import {
  promotionIdFromRealtimeEvent,
  promotionSnapshotFromRealtimePayload,
} from "@/lib/catalogRealtime/promotionPayload"
import {
  recipeIdFromRealtimeEvent,
  recipeSnapshotFromRealtimePayload,
} from "@/lib/catalogRealtime/recipePayload"
import {
  recipeCategoryIdFromRealtimeEvent,
  recipeCategorySnapshotFromRealtimePayload,
} from "@/lib/catalogRealtime/recipeCategoryPayload"
import { invalidateDataWorkspaceTableInfinite } from "@/lib/dataWorkspaceTableInfinite"
import {
  popArticleCategoriesQueryRoot,
  popArticleQueryKey,
  popArticlesQueryRoot,
  popLocalArticlesHydrateQueryRoot,
  popLocalCategoriesHydrateQueryKey,
  popLocalPromotionsHydrateQueryKey,
  popLocalRecipeCategoriesHydrateQueryKey,
  popLocalRecipesHydrateQueryKey,
  menuBoardItemsQueryRoot,
  menuCatalogSectionsQueryRoot,
  popPromotionsQueryRoot,
  popRecipeCategoriesQueryKey,
  popRecipeQueryKey,
  popRecipesQueryRoot,
  saleBoardArticlesQueryRoot,
  saleBoardCategoriesQueryRoot,
  saleBoardPromotionsQueryRoot,
} from "@/lib/queryKeys"
import type { DomainEvent } from "@/lib/realtime/protocol"
import type { QueryClient } from "@tanstack/react-query"

const REFETCH_ALL = { refetchType: "all" as const }
const SQLITE_ATTEMPTS = 2

async function retrySqlite<T>(fn: () => Promise<T>): Promise<T> {
  let last: unknown
  for (let attempt = 0; attempt < SQLITE_ATTEMPTS; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      last = error
    }
  }
  throw last
}

function invalidateMenuBoardItems(queryClient: QueryClient, popId: string) {
  void queryClient.invalidateQueries({
    queryKey: menuBoardItemsQueryRoot(popId),
    ...REFETCH_ALL,
  })
}

function invalidateSaleBoardArticles(queryClient: QueryClient, popId: string) {
  void queryClient.invalidateQueries({
    queryKey: saleBoardArticlesQueryRoot(popId),
    ...REFETCH_ALL,
  })
  void invalidateDataWorkspaceTableInfinite(
    queryClient,
    popArticlesQueryRoot(popId),
  )
  invalidateMenuBoardItems(queryClient, popId)
}

function invalidateMenuCatalogSections(queryClient: QueryClient, popId: string) {
  void queryClient.invalidateQueries({
    queryKey: menuCatalogSectionsQueryRoot(popId),
    ...REFETCH_ALL,
  })
}

function invalidateLocalCategories(queryClient: QueryClient, popId: string) {
  void queryClient.invalidateQueries({
    queryKey: saleBoardCategoriesQueryRoot(popId),
    ...REFETCH_ALL,
  })
  void queryClient.invalidateQueries({
    queryKey: popArticleCategoriesQueryRoot(popId),
    ...REFETCH_ALL,
  })
  invalidateMenuCatalogSections(queryClient, popId)
}

async function recoverArticlesCatalog(queryClient: QueryClient, popId: string) {
  await clearPopLocalArticlesHydrateMarks(popId).catch(() => undefined)
  void queryClient.invalidateQueries({
    queryKey: popLocalArticlesHydrateQueryRoot(popId),
    ...REFETCH_ALL,
  })
  invalidateSaleBoardArticles(queryClient, popId)
}

async function recoverCategoriesCatalog(queryClient: QueryClient, popId: string) {
  await clearPopLocalCategoriesHydrateMark(popId).catch(() => undefined)
  void queryClient.invalidateQueries({
    queryKey: popLocalCategoriesHydrateQueryKey(popId),
    ...REFETCH_ALL,
  })
  invalidateLocalCategories(queryClient, popId)
}

async function writeArticleEventToSqlite(popId: string, event: DomainEvent, articleId: string) {
  const handle = await openPopLocalDb(popId)
  if (event.type === "articles.deleted") {
    deleteArticleById(handle.database, articleId)
    handle.markDirty()
    await handle.flush()
    return "ok" as const
  }
  const snapshot = articleSnapshotFromRealtimePayload(event.payload.article)
  if (!snapshot) return "needs-rehydrate" as const
  upsertArticleSnapshots(handle.database, [snapshot])
  handle.markDirty()
  await handle.flush()
  return "ok" as const
}

export async function applyArticleRealtimeEvent(
  queryClient: QueryClient,
  popId: string,
  event: DomainEvent,
) {
  const articleId =
    (event.resource?.type === "article" && event.resource.id) ||
    articleIdFromRealtimeEvent(event.payload)
  if (!articleId) return

  let outcome: "ok" | "needs-rehydrate" = "needs-rehydrate"
  try {
    outcome = await retrySqlite(() =>
      writeArticleEventToSqlite(popId, event, articleId),
    )
  } catch {
    await recoverArticlesCatalog(queryClient, popId)
    return
  }

  if (outcome === "needs-rehydrate") {
    await recoverArticlesCatalog(queryClient, popId)
    return
  }

  invalidateSaleBoardArticles(queryClient, popId)
  void queryClient.invalidateQueries({
    queryKey: popArticleQueryKey(popId, articleId),
    ...REFETCH_ALL,
  })
}

async function writeCategoryEventToSqlite(
  popId: string,
  event: DomainEvent,
  patch: NonNullable<ReturnType<typeof categoryPatchFromRealtimePayload>>,
) {
  const handle = await openPopLocalDb(popId)
  const type = event.type
  if (type === "categories.deleted") {
    deleteCategoryById(handle.database, patch.id)
    handle.markDirty()
    await handle.flush()
    return { kind: "ok" as const, renamedArticles: false }
  }
  const existing = getCategoryById(handle.database, patch.id)
  const snapshot = categorySnapshotFromPatch(patch, existing)
  if (!snapshot) return { kind: "needs-rehydrate" as const, renamedArticles: false }
  upsertCategorySnapshots(handle.database, [snapshot])
  const renamedArticles =
    type === "categories.updated" &&
    renameArticlesCategory(handle.database, patch.id, snapshot.name)
  handle.markDirty()
  await handle.flush()
  return { kind: "ok" as const, renamedArticles }
}

export async function applyCategoryRealtimeEvent(
  queryClient: QueryClient,
  popId: string,
  event: DomainEvent,
) {
  const type = event.type
  if (
    type !== "categories.created" &&
    type !== "categories.updated" &&
    type !== "categories.deleted"
  ) {
    return
  }
  const patch = categoryPatchFromRealtimePayload(event.payload)
  if (!patch) {
    invalidateLocalCategories(queryClient, popId)
    return
  }

  let written: Awaited<ReturnType<typeof writeCategoryEventToSqlite>>
  try {
    written = await retrySqlite(() =>
      writeCategoryEventToSqlite(popId, event, patch),
    )
  } catch {
    await recoverCategoriesCatalog(queryClient, popId)
    return
  }

  if (written.kind === "needs-rehydrate") {
    await recoverCategoriesCatalog(queryClient, popId)
    return
  }

  if (written.renamedArticles) {
    invalidateSaleBoardArticles(queryClient, popId)
  }
  invalidateLocalCategories(queryClient, popId)
}

function invalidateSaleBoardPromotions(queryClient: QueryClient, popId: string) {
  void queryClient.invalidateQueries({
    queryKey: saleBoardPromotionsQueryRoot(popId),
    ...REFETCH_ALL,
  })
  void invalidateDataWorkspaceTableInfinite(
    queryClient,
    popPromotionsQueryRoot(popId),
  )
  invalidateMenuCatalogSections(queryClient, popId)
  invalidateMenuBoardItems(queryClient, popId)
}

async function recoverPromotionsCatalog(queryClient: QueryClient, popId: string) {
  await clearPopLocalPromotionsHydrateMark(popId).catch(() => undefined)
  void queryClient.invalidateQueries({
    queryKey: popLocalPromotionsHydrateQueryKey(popId),
    ...REFETCH_ALL,
  })
  invalidateSaleBoardPromotions(queryClient, popId)
}

async function writePromotionEventToSqlite(
  popId: string,
  event: DomainEvent,
  promotionId: string,
) {
  const handle = await openPopLocalDb(popId)
  if (event.type === "promotions.deleted") {
    deletePromotionById(handle.database, promotionId)
    handle.markDirty()
    await handle.flush()
    return "ok" as const
  }
  const snapshot = promotionSnapshotFromRealtimePayload(event.payload.promotion)
  if (!snapshot) return "needs-rehydrate" as const
  upsertPromotionSnapshots(handle.database, [snapshot])
  handle.markDirty()
  await handle.flush()
  return "ok" as const
}

export async function applyPromotionRealtimeEvent(
  queryClient: QueryClient,
  popId: string,
  event: DomainEvent,
) {
  const type = event.type
  if (
    type !== "promotions.created" &&
    type !== "promotions.updated" &&
    type !== "promotions.deleted"
  ) {
    return
  }
  const promotionId =
    (event.resource?.type === "promotion" && event.resource.id) ||
    promotionIdFromRealtimeEvent(event.payload)
  if (!promotionId) return

  let outcome: "ok" | "needs-rehydrate" = "needs-rehydrate"
  try {
    outcome = await retrySqlite(() =>
      writePromotionEventToSqlite(popId, event, promotionId),
    )
  } catch {
    await recoverPromotionsCatalog(queryClient, popId)
    return
  }

  if (outcome === "needs-rehydrate") {
    await recoverPromotionsCatalog(queryClient, popId)
    return
  }

  invalidateSaleBoardPromotions(queryClient, popId)
}

function invalidateLocalRecipes(queryClient: QueryClient, popId: string) {
  void invalidateDataWorkspaceTableInfinite(
    queryClient,
    popRecipesQueryRoot(popId),
  )
  invalidateMenuBoardItems(queryClient, popId)
}

function invalidateLocalRecipeCategories(queryClient: QueryClient, popId: string) {
  void queryClient.invalidateQueries({
    queryKey: popRecipeCategoriesQueryKey(popId),
    ...REFETCH_ALL,
  })
  invalidateMenuCatalogSections(queryClient, popId)
}

async function recoverRecipesCatalog(queryClient: QueryClient, popId: string) {
  await clearPopLocalRecipesHydrateMark(popId).catch(() => undefined)
  void queryClient.invalidateQueries({
    queryKey: popLocalRecipesHydrateQueryKey(popId),
    ...REFETCH_ALL,
  })
  invalidateLocalRecipes(queryClient, popId)
}

async function recoverRecipeCategoriesCatalog(
  queryClient: QueryClient,
  popId: string,
) {
  await clearPopLocalRecipeCategoriesHydrateMark(popId).catch(() => undefined)
  void queryClient.invalidateQueries({
    queryKey: popLocalRecipeCategoriesHydrateQueryKey(popId),
    ...REFETCH_ALL,
  })
  invalidateLocalRecipeCategories(queryClient, popId)
}

async function writeRecipeEventToSqlite(
  popId: string,
  event: DomainEvent,
  recipeId: string,
) {
  const handle = await openPopLocalDb(popId)
  if (event.type === "recipes.deleted") {
    deleteRecipeById(handle.database, recipeId)
    handle.markDirty()
    await handle.flush()
    return "ok" as const
  }
  const snapshot = recipeSnapshotFromRealtimePayload(event.payload.recipe)
  if (!snapshot) return "needs-rehydrate" as const
  if (!snapshot.stationId && snapshot.categoryId) {
    snapshot.stationId =
      getRecipeCategoryById(handle.database, snapshot.categoryId)?.stationId ??
      null
  }
  upsertRecipeSnapshots(handle.database, [snapshot])
  handle.markDirty()
  await handle.flush()
  return "ok" as const
}

export async function applyRecipeRealtimeEvent(
  queryClient: QueryClient,
  popId: string,
  event: DomainEvent,
) {
  const type = event.type
  if (
    type !== "recipes.created" &&
    type !== "recipes.updated" &&
    type !== "recipes.deleted"
  ) {
    return
  }
  const recipeId =
    (event.resource?.type === "recipe" && event.resource.id) ||
    recipeIdFromRealtimeEvent(event.payload)
  if (!recipeId) return

  let outcome: "ok" | "needs-rehydrate" = "needs-rehydrate"
  try {
    outcome = await retrySqlite(() =>
      writeRecipeEventToSqlite(popId, event, recipeId),
    )
  } catch {
    await recoverRecipesCatalog(queryClient, popId)
    return
  }

  if (outcome === "needs-rehydrate") {
    await recoverRecipesCatalog(queryClient, popId)
    return
  }

  invalidateLocalRecipes(queryClient, popId)
  void queryClient.invalidateQueries({
    queryKey: popRecipeQueryKey(popId, recipeId),
    ...REFETCH_ALL,
  })
}

async function writeRecipeCategoryEventToSqlite(
  popId: string,
  event: DomainEvent,
  categoryId: string,
) {
  const handle = await openPopLocalDb(popId)
  if (event.type === "recipecategories.deleted") {
    deleteRecipeCategoryById(handle.database, categoryId)
    handle.markDirty()
    await handle.flush()
    return { kind: "ok" as const, recipesChanged: false }
  }
  const snapshot = recipeCategorySnapshotFromRealtimePayload(
    event.payload.category,
  )
  if (!snapshot) return { kind: "needs-rehydrate" as const, recipesChanged: false }
  const previous = getRecipeCategoryById(handle.database, snapshot.id)
  upsertRecipeCategorySnapshots(handle.database, [snapshot])
  const renamed =
    event.type === "recipecategories.updated" &&
    renameRecipesCategory(handle.database, snapshot.id, snapshot.name)
  const stationChanged =
    event.type === "recipecategories.updated" &&
    previous?.stationId !== snapshot.stationId &&
    updateRecipesStationForCategory(
      handle.database,
      snapshot.id,
      snapshot.stationId,
    )
  handle.markDirty()
  await handle.flush()
  return { kind: "ok" as const, recipesChanged: renamed || stationChanged }
}

export async function applyRecipeCategoryRealtimeEvent(
  queryClient: QueryClient,
  popId: string,
  event: DomainEvent,
) {
  const type = event.type
  if (type === "recipecategories.layout") {
    await recoverRecipeCategoriesCatalog(queryClient, popId)
    return
  }
  if (
    type !== "recipecategories.created" &&
    type !== "recipecategories.updated" &&
    type !== "recipecategories.deleted"
  ) {
    return
  }
  const categoryId =
    (event.resource?.type === "recipecategory" && event.resource.id) ||
    recipeCategoryIdFromRealtimeEvent(event.payload)
  if (!categoryId) return

  let written: Awaited<ReturnType<typeof writeRecipeCategoryEventToSqlite>>
  try {
    written = await retrySqlite(() =>
      writeRecipeCategoryEventToSqlite(popId, event, categoryId),
    )
  } catch {
    await recoverRecipeCategoriesCatalog(queryClient, popId)
    return
  }

  if (written.kind === "needs-rehydrate") {
    await recoverRecipeCategoriesCatalog(queryClient, popId)
    return
  }

  if (written.recipesChanged) {
    invalidateLocalRecipes(queryClient, popId)
  }
  invalidateLocalRecipeCategories(queryClient, popId)
}
