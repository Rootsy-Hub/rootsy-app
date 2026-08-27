"use client"

import { usePopRealtime } from "@/hooks/usePopRealtime"
import {
  applyArticleRealtimeEvent,
  applyCategoryRealtimeEvent,
  applyPromotionRealtimeEvent,
} from "@/lib/catalogRealtime/apply"
import {
  bumpCatalogHydrateEpoch,
  scheduleCatalogArticleReplayIfHydrating,
  setCatalogArticleEventApplier,
} from "@/lib/catalogRealtime/hydrateGate"
import { invalidateDataWorkspaceTableInfinite } from "@/lib/dataWorkspaceTableInfinite"
import {
  clearPopLocalArticlesHydrateMarks,
  clearPopLocalCategoriesHydrateMark,
  clearPopLocalPromotionsHydrateMark,
} from "@/lib/popLocalDb"
import {
  popArticleCategoriesQueryRoot,
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
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect } from "react"

const CATALOG_CHANNELS = [
  "domain:articles",
  "domain:categories",
  "domain:promotions",
] as const

function isCatalogRealtimeChannel(channel: string) {
  return (
    channel === "domain:articles" ||
    channel === "domain:categories" ||
    channel === "domain:promotions"
  )
}

export function usePopCatalogRealtime(popId: string | undefined) {
  const queryClient = useQueryClient()

  const applyCatalogEvent = useCallback(
    (event: DomainEvent) => {
      if (!popId || event.popId !== popId) return
      if (event.type.startsWith("articles.")) {
        return applyArticleRealtimeEvent(queryClient, popId, event)
      }
      if (event.type.startsWith("categories.")) {
        return applyCategoryRealtimeEvent(queryClient, popId, event)
      }
      if (event.type.startsWith("promotions.")) {
        return applyPromotionRealtimeEvent(queryClient, popId, event)
      }
    },
    [popId, queryClient],
  )

  useEffect(() => {
    if (!popId) {
      setCatalogArticleEventApplier(null)
      return
    }
    setCatalogArticleEventApplier(applyCatalogEvent)
    return () => setCatalogArticleEventApplier(null)
  }, [applyCatalogEvent, popId])

  const onEvent = useCallback(
    (event: DomainEvent) => {
      if (!popId || event.popId !== popId) return
      if (
        event.type.startsWith("articles.") ||
        event.type.startsWith("promotions.")
      ) {
        scheduleCatalogArticleReplayIfHydrating(event)
      }
      return applyCatalogEvent(event)
    },
    [applyCatalogEvent, popId],
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
      void clearPopLocalCategoriesHydrateMark(popId)
        .catch(() => undefined)
        .then(() =>
          queryClient.invalidateQueries({
            queryKey: popLocalCategoriesHydrateQueryKey(popId),
            refetchType: "all",
          }),
        )
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: saleBoardCategoriesQueryRoot(popId),
            refetchType: "all",
          })
          void queryClient.invalidateQueries({
            queryKey: popArticleCategoriesQueryRoot(popId),
            refetchType: "all",
          })
        })
      void clearPopLocalPromotionsHydrateMark(popId)
        .catch(() => undefined)
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: popLocalPromotionsHydrateQueryKey(popId),
            refetchType: "all",
          })
          void queryClient.invalidateQueries({
            queryKey: saleBoardPromotionsQueryRoot(popId),
            refetchType: "all",
          })
        })
      void invalidateDataWorkspaceTableInfinite(
        queryClient,
        popArticlesQueryRoot(popId),
        { refetchType: "all" },
      )
      void invalidateDataWorkspaceTableInfinite(
        queryClient,
        popPromotionsQueryRoot(popId),
        { refetchType: "all" },
      )
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
