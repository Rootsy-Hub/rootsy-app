"use client"

import { usePopRealtime } from "@/hooks/usePopRealtime"
import {
  applyMesasRealtimeEvent,
  invalidateMesasRealtimeQueries,
} from "@/lib/mesasRealtime/apply"
import { popMesasSessionQueryKey } from "@/lib/queryKeys"
import { sessionResourceChannel } from "@/lib/realtime/channels"
import type { DomainEvent } from "@/lib/realtime/protocol"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

export function useMesasRealtime(
  popId: string | undefined,
  selectedSessionId?: string | null,
) {
  const queryClient = useQueryClient()
  const resourceChannel = selectedSessionId
    ? sessionResourceChannel(selectedSessionId)
    : null

  const channels = useMemo(() => {
    const next = ["domain:mesas"]
    if (resourceChannel) next.push(resourceChannel)
    return next
  }, [resourceChannel])

  const onEvent = useCallback(
    (event: DomainEvent) => {
      if (!popId || event.popId !== popId) return
      applyMesasRealtimeEvent(queryClient, popId, event)
    },
    [popId, queryClient],
  )

  const onResync = useCallback(
    (resyncChannels: string[], reason: "gap" | "empty") => {
      if (!popId) return
      if (reason !== "gap") return
      if (resyncChannels.includes("domain:mesas")) {
        invalidateMesasRealtimeQueries(queryClient, popId)
        return
      }
      if (resourceChannel && resyncChannels.includes(resourceChannel) && selectedSessionId) {
        void queryClient.invalidateQueries({
          queryKey: popMesasSessionQueryKey(popId, selectedSessionId),
          refetchType: "all",
        })
      }
    },
    [popId, queryClient, resourceChannel, selectedSessionId],
  )

  usePopRealtime({
    channels,
    enabled: Boolean(popId),
    onEvent,
    onResync,
  })
}
