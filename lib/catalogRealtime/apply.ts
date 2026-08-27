"use client"

import {
  clearPopLocalArticlesHydrateMarks,
  clearPopLocalCategoriesHydrateMark,
  clearPopLocalPromotionsHydrateMark,
  deleteArticleById,
  deleteCategoryById,
  deletePromotionById,
  getCategoryById,
  openPopLocalDb,
  renameArticlesCategory,
  upsertArticleSnapshots,
  upsertCategorySnapshots,
  upsertPromotionSnapshots,
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
import { invalidateDataWorkspaceTableInfinite } from "@/lib/dataWorkspaceTableInfinite"
import {
  popArticleCategoriesQueryRoot,
  popArticleQueryKey,
  popArticlesQueryRoot,
  popLocalArticlesHydrateQueryRoot,
  popLocalCategoriesHydrateQueryKey,
  popLocalPromotionsHydrateQueryKey,
  popPromotionsQueryRoot,
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

function invalidateSaleBoardArticles(queryClient: QueryClient, popId: string) {
  void queryClient.invalidateQueries({
    queryKey: saleBoardArticlesQueryRoot(popId),
    ...REFETCH_ALL,
  })
  void invalidateDataWorkspaceTableInfinite(
    queryClient,
    popArticlesQueryRoot(popId),
  )
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
