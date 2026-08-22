"use client"

import {
  usePopRealtimeContext,
  type RealtimeEventHandler,
  type RealtimePresenceHandler,
  type RealtimeResyncHandler,
} from "@/context/PopRealtimeContext"
import { normalizeRealtimeChannels } from "@/lib/realtime/channels"
import { useEffect, useMemo } from "react"

type UsePopRealtimeOptions = {
  channels: readonly string[]
  enabled?: boolean
  onEvent?: RealtimeEventHandler
  onResync?: RealtimeResyncHandler
  onPresence?: RealtimePresenceHandler
}

export function usePopRealtime(options: UsePopRealtimeOptions) {
  const {
    status,
    lastSeq,
    members,
    subscribe,
    unsubscribe,
    addEventListener,
    addResyncListener,
    addPresenceListener,
  } = usePopRealtimeContext()

  const channelKey = options.channels.join("\0")
  const channels = useMemo(
    () => normalizeRealtimeChannels(channelKey ? channelKey.split("\0") : []),
    [channelKey],
  )
  const enabled = options.enabled ?? true

  useEffect(() => {
    if (!enabled || !channelKey) return
    subscribe(channels)
    return () => unsubscribe(channels)
  }, [channelKey, channels, enabled, subscribe, unsubscribe])

  useEffect(() => {
    if (!options.onEvent) return
    return addEventListener(options.onEvent)
  }, [addEventListener, options.onEvent])

  useEffect(() => {
    if (!options.onResync) return
    return addResyncListener(options.onResync)
  }, [addResyncListener, options.onResync])

  useEffect(() => {
    if (!options.onPresence) return
    return addPresenceListener(options.onPresence)
  }, [addPresenceListener, options.onPresence])

  return { status, lastSeq, members }
}
