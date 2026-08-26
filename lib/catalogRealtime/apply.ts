"use client"

import {
  clearPopLocalCategoriesHydrateMark,
  deleteArticleById,
  deleteCategoryById,
  getCategoryById,
  openPopLocalDb,
  renameArticlesCategory,
  upsertArticleSnapshots,
  upsertCategorySnapshots,
} from "@/lib/popLocalDb"
import {
  articleIdFromRealtimeEvent,
  articleSnapshotFromRealtimePayload,
} from "@/lib/catalogRealtime/articlePayload"
import {
  categoryPatchFromRealtimePayload,
  categorySnapshotFromPatch,
} from "@/lib/catalogRealtime/categoryPayload"
import { invalidateDataWorkspaceTableInfinite } from "@/lib/dataWorkspaceTableInfinite"
import {
  popArticleCategoriesQueryRoot,
  popArticleQueryKey,
  popArticlesQueryRoot,
  popLocalCategoriesHydrateQueryKey,
  saleBoardArticlesQueryRoot,
  saleBoardCategoriesQueryRoot,
} from "@/lib/queryKeys"
import type { DomainEvent } from "@/lib/realtime/protocol"
import type { QueryClient } from "@tanstack/react-query"

const REFETCH_ALL = { refetchType: "all" as const }

export async function applyArticleRealtimeEvent(
  queryClient: QueryClient,
  popId: string,
  event: DomainEvent,
) {
  const articleId =
    (event.resource?.type === "article" && event.resource.id) ||
    articleIdFromRealtimeEvent(event.payload)
  if (!articleId) return

  try {
    const handle = await openPopLocalDb(popId)
    if (event.type === "articles.deleted") {
      deleteArticleById(handle.database, articleId)
      handle.markDirty()
    } else {
      const snapshot = articleSnapshotFromRealtimePayload(event.payload.article)
      if (snapshot) {
        upsertArticleSnapshots(handle.database, [snapshot])
        handle.markDirty()
      }
    }
  } catch {
    /* sqlite fallback: igual invalidamos HTTP */
  }

  void queryClient.invalidateQueries({
    queryKey: saleBoardArticlesQueryRoot(popId),
    ...REFETCH_ALL,
  })
  void invalidateDataWorkspaceTableInfinite(
    queryClient,
    popArticlesQueryRoot(popId),
  )
  void queryClient.invalidateQueries({
    queryKey: popArticleQueryKey(popId, articleId),
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

  let needsRehydrate = false
  let renamedArticles = false
  try {
    const handle = await openPopLocalDb(popId)
    if (type === "categories.deleted") {
      deleteCategoryById(handle.database, patch.id)
      handle.markDirty()
    } else {
      const existing = getCategoryById(handle.database, patch.id)
      const snapshot = categorySnapshotFromPatch(patch, existing)
      if (!snapshot) {
        needsRehydrate = true
      } else {
        upsertCategorySnapshots(handle.database, [snapshot])
        if (
          type === "categories.updated" &&
          renameArticlesCategory(handle.database, patch.id, snapshot.name)
        ) {
          renamedArticles = true
        }
        handle.markDirty()
      }
    }
  } catch {
    /* sqlite fallback: refetch HTTP */
  }

  if (needsRehydrate) {
    void clearPopLocalCategoriesHydrateMark(popId)
      .catch(() => undefined)
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: popLocalCategoriesHydrateQueryKey(popId),
          ...REFETCH_ALL,
        }),
      )
      .then(() => {
        invalidateLocalCategories(queryClient, popId)
      })
    return
  }

  if (renamedArticles) {
    void queryClient.invalidateQueries({
      queryKey: saleBoardArticlesQueryRoot(popId),
      ...REFETCH_ALL,
    })
  }

  invalidateLocalCategories(queryClient, popId)
}
