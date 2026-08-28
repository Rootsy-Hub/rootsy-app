"use client"

import { usePopRealtime } from "@/hooks/usePopRealtime"
import {
  applyMostradorRealtimeEvent,
  invalidateMostradorRealtimeQueries,
} from "@/lib/mostradorRealtime/apply"
import { popMostradorOrderQueryKey } from "@/lib/queryKeys"
import { orderResourceChannel } from "@/lib/realtime/channels"
import type { DomainEvent } from "@/lib/realtime/protocol"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

export function useMostradorRealtime(
  popId: string | undefined,
  selectedOrderId?: string | null,
) {
  const queryClient = useQueryClient()
  const resourceChannel = selectedOrderId
    ? orderResourceChannel(selectedOrderId)
    : null

  const channels = useMemo(() => {
    const next = ["domain:mostrador"]
    if (resourceChannel) next.push(resourceChannel)
    return next
  }, [resourceChannel])

  const onEvent = useCallback(
    (event: DomainEvent) => {
      if (!popId || event.popId !== popId) return
      applyMostradorRealtimeEvent(queryClient, popId, event)
    },
    [popId, queryClient],
  )

  const onResync = useCallback(
    (resyncChannels: string[], reason: "gap" | "empty") => {
      if (!popId) return
      if (reason !== "gap") return
      if (resyncChannels.includes("domain:mostrador")) {
        invalidateMostradorRealtimeQueries(queryClient, popId)
        return
      }
      if (resourceChannel && resyncChannels.includes(resourceChannel) && selectedOrderId) {
        void queryClient.invalidateQueries({
          queryKey: popMostradorOrderQueryKey(popId, selectedOrderId),
          refetchType: "all",
        })
      }
    },
    [popId, queryClient, resourceChannel, selectedOrderId],
  )

  usePopRealtime({
    channels,
    enabled: Boolean(popId),
    onEvent,
    onResync,
  })
}
