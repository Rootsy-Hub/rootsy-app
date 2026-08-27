"use client"

import { usePopRealtime } from "@/hooks/usePopRealtime"
import {
  applyComandasRealtimeEvent,
  invalidateComandasRealtimeQueries,
} from "@/lib/comandasRealtime/apply"
import type { DomainEvent } from "@/lib/realtime/protocol"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

const COMANDAS_CHANNELS = ["domain:comandas"] as const

export function useComandasRealtime(popId: string | undefined) {
  const queryClient = useQueryClient()

  const onEvent = useCallback(
    (event: DomainEvent) => {
      if (!popId || event.popId !== popId) return
      applyComandasRealtimeEvent(queryClient, popId, event)
    },
    [popId, queryClient],
  )

  const onResync = useCallback(
    (channels: string[], reason: "gap" | "empty") => {
      if (!popId) return
      if (reason !== "gap") return
      if (!channels.some((channel) => channel === "domain:comandas")) return
      invalidateComandasRealtimeQueries(queryClient, popId)
    },
    [popId, queryClient],
  )

  usePopRealtime({
    channels: COMANDAS_CHANNELS,
    enabled: Boolean(popId),
    onEvent,
    onResync,
  })
}
