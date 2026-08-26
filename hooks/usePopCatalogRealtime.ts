"use client"

import { usePopRealtime } from "@/hooks/usePopRealtime"
import {
  applyArticleRealtimeEvent,
  applyCategoryRealtimeEvent,
} from "@/lib/catalogRealtime/apply"
import {
  bumpCatalogHydrateEpoch,
  enqueueOrApplyCatalogArticleEvent,
  setCatalogArticleEventApplier,
} from "@/lib/catalogRealtime/hydrateGate"
import { invalidateDataWorkspaceTableInfinite } from "@/lib/dataWorkspaceTableInfinite"
import { clearPopLocalArticlesHydrateMarks } from "@/lib/popLocalDb"
import {
  popArticleCategoriesQueryKey,
  popArticlesQueryRoot,
  popLocalArticlesHydrateQueryRoot,
  saleBoardArticlesQueryRoot,
  saleBoardCategoriesQueryKey,
} from "@/lib/queryKeys"
import type { DomainEvent } from "@/lib/realtime/protocol"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect } from "react"

const CATALOG_CHANNELS = ["domain:articles", "domain:categories"] as const

function isCatalogRealtimeChannel(channel: string) {
  return channel === "domain:articles" || channel === "domain:categories"
}

export function usePopCatalogRealtime(popId: string | undefined) {
  const queryClient = useQueryClient()

  const applyArticle = useCallback(
    (event: DomainEvent) => {
      if (!popId || event.popId !== popId) return
      return applyArticleRealtimeEvent(queryClient, popId, event)
    },
    [popId, queryClient],
  )

  useEffect(() => {
    if (!popId) {
      setCatalogArticleEventApplier(null)
      return
    }
    setCatalogArticleEventApplier(applyArticle)
    return () => setCatalogArticleEventApplier(null)
  }, [applyArticle, popId])

  const onEvent = useCallback(
    (event: DomainEvent) => {
      if (!popId || event.popId !== popId) return
      if (event.type.startsWith("articles.")) {
        enqueueOrApplyCatalogArticleEvent(event)
        return
      }
      if (event.type.startsWith("categories.")) {
        applyCategoryRealtimeEvent(queryClient, popId, event)
      }
    },
    [popId, queryClient],
  )

  const onResync = useCallback(
    (channels: string[], reason: "gap" | "empty") => {
      if (!popId) return
      if (reason !== "gap") return
      if (!channels.some(isCatalogRealtimeChannel)) return
      bumpCatalogHydrateEpoch()
      void clearPopLocalArticlesHydrateMarks(popId)
        .catch(() => undefined)
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: popLocalArticlesHydrateQueryRoot(popId),
            refetchType: "all",
          })
          void queryClient.invalidateQueries({
            queryKey: saleBoardArticlesQueryRoot(popId),
            refetchType: "all",
          })
        })
      void queryClient.invalidateQueries({
        queryKey: saleBoardCategoriesQueryKey(popId),
        refetchType: "all",
      })
      void invalidateDataWorkspaceTableInfinite(
        queryClient,
        popArticlesQueryRoot(popId),
        { refetchType: "all" },
      )
      void queryClient.invalidateQueries({
        queryKey: popArticleCategoriesQueryKey(popId),
        refetchType: "all",
      })
    },
    [popId, queryClient],
  )

  usePopRealtime({
    channels: CATALOG_CHANNELS,
    enabled: Boolean(popId),
    onEvent,
    onResync,
  })
}
