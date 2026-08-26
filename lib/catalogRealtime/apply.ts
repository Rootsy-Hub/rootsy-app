"use client"

import type { ArticleCategoryOption } from "@/app/[siteId]/[popId]/articles/actions"
import {
  deleteArticleById,
  openPopLocalDb,
  upsertArticleSnapshots,
} from "@/lib/popLocalDb"
import {
  articleIdFromRealtimeEvent,
  articleSnapshotFromRealtimePayload,
} from "@/lib/catalogRealtime/articlePayload"
import {
  applyCategoryPatchToSaleBoard,
  categoryPatchFromRealtimePayload,
} from "@/lib/catalogRealtime/categoryPayload"
import { invalidateDataWorkspaceTableInfinite } from "@/lib/dataWorkspaceTableInfinite"
import {
  popArticleCategoriesQueryKey,
  popArticleQueryKey,
  popArticlesQueryRoot,
  saleBoardArticlesQueryRoot,
  saleBoardCategoriesQueryKey,
} from "@/lib/queryKeys"
import type { DomainEvent } from "@/lib/realtime/protocol"
import type { QueryClient } from "@tanstack/react-query"

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
  })
  void invalidateDataWorkspaceTableInfinite(
    queryClient,
    popArticlesQueryRoot(popId),
  )
  void queryClient.invalidateQueries({
    queryKey: popArticleQueryKey(popId, articleId),
  })
}

export function applyCategoryRealtimeEvent(
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
    void queryClient.invalidateQueries({
      queryKey: saleBoardCategoriesQueryKey(popId),
    })
    void queryClient.invalidateQueries({
      queryKey: popArticleCategoriesQueryKey(popId),
    })
    return
  }

  let invalidated = false
  queryClient.setQueryData<ArticleCategoryOption[]>(
    saleBoardCategoriesQueryKey(popId),
    (current) => {
      if (!current) {
        invalidated = true
        return current
      }
      const next = applyCategoryPatchToSaleBoard(current, patch, type)
      if (next === "invalidate") {
        invalidated = true
        return current
      }
      return next
    },
  )
  if (invalidated) {
    void queryClient.invalidateQueries({
      queryKey: saleBoardCategoriesQueryKey(popId),
    })
  }
  void queryClient.invalidateQueries({
    queryKey: popArticleCategoriesQueryKey(popId),
  })
}
