"use client"

import { usePopRealtime } from "@/hooks/usePopRealtime"
import {
  applyMostradorRealtimeEvent,
  invalidateMostradorRealtimeQueries,
} from "@/lib/mostradorRealtime/apply"
import type { DomainEvent } from "@/lib/realtime/protocol"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

const MOSTRADOR_CHANNELS = ["domain:mostrador", "domain:comandas"] as const

function isMostradorRealtimeChannel(channel: string) {
  return channel === "domain:mostrador" || channel === "domain:comandas"
}

export function useMostradorRealtime(popId: string | undefined) {
  const queryClient = useQueryClient()

  const onEvent = useCallback(
    (event: DomainEvent) => {
      if (!popId || event.popId !== popId) return
      applyMostradorRealtimeEvent(queryClient, popId, event)
    },
    [popId, queryClient],
  )

  const onResync = useCallback(
    (channels: string[], reason: "gap" | "empty") => {
      if (!popId) return
      if (reason !== "gap") return
      if (!channels.some(isMostradorRealtimeChannel)) return
      invalidateMostradorRealtimeQueries(queryClient, popId)
    },
    [popId, queryClient],
  )

  usePopRealtime({
    channels: MOSTRADOR_CHANNELS,
    enabled: Boolean(popId),
    onEvent,
    onResync,
  })
}
