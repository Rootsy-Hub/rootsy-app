"use client"

import { usePopRealtime } from "@/hooks/usePopRealtime"
import {
  applyCajasRealtimeEvent,
  invalidateCajasRealtimeQueries,
} from "@/lib/cajasRealtime/apply"
import { cajasUserChannel } from "@/lib/realtime/channels"
import type { DomainEvent } from "@/lib/realtime/protocol"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

export function useCajasRealtime(
  popId: string | undefined,
  userId: string | undefined | null,
) {
  const queryClient = useQueryClient()
  const channel = userId ? cajasUserChannel(userId) : null
  const channels = useMemo(() => (channel ? [channel] : []), [channel])

  const onEvent = useCallback(
    (event: DomainEvent) => {
      if (!popId || event.popId !== popId) return
      applyCajasRealtimeEvent(queryClient, popId, event)
    },
    [popId, queryClient],
  )

  const onResync = useCallback(
    (resyncChannels: string[], reason: "gap" | "empty") => {
      if (!popId || reason !== "gap" || !channel) return
      if (resyncChannels.includes(channel)) {
        invalidateCajasRealtimeQueries(queryClient, popId)
      }
    },
    [channel, popId, queryClient],
  )

  usePopRealtime({
    channels,
    enabled: Boolean(popId && userId),
    onEvent,
    onResync,
  })
}
