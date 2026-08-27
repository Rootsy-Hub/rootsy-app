"use client"

import { usePopRealtime } from "@/hooks/usePopRealtime"
import {
  applyMesasRealtimeEvent,
  invalidateMesasRealtimeQueries,
} from "@/lib/mesasRealtime/apply"
import type { DomainEvent } from "@/lib/realtime/protocol"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

const MESAS_CHANNELS = ["domain:mesas", "domain:comandas"] as const

function isMesasRealtimeChannel(channel: string) {
  return channel === "domain:mesas" || channel === "domain:comandas"
}

export function useMesasRealtime(popId: string | undefined) {
  const queryClient = useQueryClient()

  const onEvent = useCallback(
    (event: DomainEvent) => {
      if (!popId || event.popId !== popId) return
      applyMesasRealtimeEvent(queryClient, popId, event)
    },
    [popId, queryClient],
  )

  const onResync = useCallback(
    (channels: string[], reason: "gap" | "empty") => {
      if (!popId) return
      if (reason !== "gap") return
      if (!channels.some(isMesasRealtimeChannel)) return
      invalidateMesasRealtimeQueries(queryClient, popId)
    },
    [popId, queryClient],
  )

  usePopRealtime({
    channels: MESAS_CHANNELS,
    enabled: Boolean(popId),
    onEvent,
    onResync,
  })
}
