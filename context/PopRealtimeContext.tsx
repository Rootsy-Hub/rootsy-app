"use client"

import { useAuth } from "@/context/AuthContextSupabase"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { normalizeRealtimeChannels } from "@/lib/realtime/channels"
import { connectPopRealtimeSocket, type PopRealtimeSocket } from "@/lib/realtime/client"
import { applyRealtimeEventToQuery } from "@/lib/realtime/queryBridge"
import type {
  DomainEvent,
  PresenceMember,
  RealtimeConnectionStatus,
  ServerMessage,
} from "@/lib/realtime/protocol"
import { popRealtimeBaseUrl, popRealtimeWsUrl } from "@/lib/realtime/url"
import {
  loadRealtimeLastSeq,
  persistRealtimeLastSeq,
  readSessionRealtimeLastSeq,
  writeSessionRealtimeLastSeq,
} from "@/lib/popLocalDb/realtimeSeq"
import { createClient } from "@/utils/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

export type RealtimeEventHandler = (event: DomainEvent) => void
export type RealtimeResyncHandler = (
  channels: string[],
  reason: "gap" | "empty",
) => void
export type RealtimePresenceHandler = (members: PresenceMember[]) => void

export type PopRealtimeContextValue = {
  status: RealtimeConnectionStatus
  lastSeq: number | null
  members: PresenceMember[]
  subscribe: (channels: readonly string[]) => void
  unsubscribe: (channels: readonly string[]) => void
  addEventListener: (handler: RealtimeEventHandler) => () => void
  addResyncListener: (handler: RealtimeResyncHandler) => () => void
  addPresenceListener: (handler: RealtimePresenceHandler) => () => void
}

const PopRealtimeContext = createContext<PopRealtimeContextValue | undefined>(
  undefined,
)

const SEQ_PERSIST_MS = 300

export function PopRealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient
  const { user } = useAuth()
  const { popId, popAccess, error } = usePopWorkspace()
  const userId = user?.id ?? null
  const allowedPopRef = useRef<string | null>(null)
  if (popId && popAccess && !error) {
    allowedPopRef.current = popId
  } else if (!popId || allowedPopRef.current !== popId) {
    allowedPopRef.current = null
  }
  const canConnect = Boolean(
    userId &&
      popId &&
      allowedPopRef.current === popId &&
      !error &&
      popRealtimeBaseUrl(),
  )

  const [status, setStatus] = useState<RealtimeConnectionStatus>("idle")
  const [lastSeq, setLastSeq] = useState<number | null>(null)
  const [members, setMembers] = useState<PresenceMember[]>([])
  const [wantsSocket, setWantsSocket] = useState(false)
  const [seqReady, setSeqReady] = useState(false)

  const socketRef = useRef<PopRealtimeSocket | null>(null)
  const refsRef = useRef(new Map<string, number>())
  const lastSeqRef = useRef<number | null>(null)
  const helloSeqRef = useRef<number | null>(null)
  const popIdRef = useRef(popId)
  popIdRef.current = popId
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const eventHandlersRef = useRef(new Set<RealtimeEventHandler>())
  const resyncHandlersRef = useRef(new Set<RealtimeResyncHandler>())
  const presenceHandlersRef = useRef(new Set<RealtimePresenceHandler>())

  const rememberSeq = useCallback((seq: number) => {
    if (lastSeqRef.current != null && seq <= lastSeqRef.current) return
    lastSeqRef.current = seq
    setLastSeq(seq)
    const id = popIdRef.current
    if (!id) return
    writeSessionRealtimeLastSeq(id, seq)
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null
      void persistRealtimeLastSeq(id, seq)
    }, SEQ_PERSIST_MS)
  }, [])

  const subscribeSeq = useCallback(() => {
    return lastSeqRef.current ?? helloSeqRef.current ?? 0
  }, [])

  const flushSubscribe = useCallback(
    (channels: string[]) => {
      if (!channels.length || helloSeqRef.current == null) return
      socketRef.current?.send({
        type: "subscribe",
        channels,
        lastSeq: subscribeSeq(),
      })
    },
    [subscribeSeq],
  )

  const handleMessage = useCallback(
    (message: ServerMessage) => {
      if (message.type === "hello") {
        helloSeqRef.current = message.seq
        if (lastSeqRef.current == null) rememberSeq(message.seq)
        const channels = [...refsRef.current.keys()]
        if (channels.length) {
          socketRef.current?.send({
            type: "subscribe",
            channels,
            lastSeq: subscribeSeq(),
          })
        }
        return
      }
      if (message.type === "event") {
        rememberSeq(message.event.seq)
        applyRealtimeEventToQuery(queryClientRef.current, message.event)
        for (const handler of eventHandlersRef.current) handler(message.event)
        return
      }
      if (message.type === "replay") {
        for (const event of message.events) {
          rememberSeq(event.seq)
          applyRealtimeEventToQuery(queryClientRef.current, event)
          for (const handler of eventHandlersRef.current) handler(event)
        }
        return
      }
      if (message.type === "resync") {
        if (helloSeqRef.current != null) rememberSeq(helloSeqRef.current)
        for (const handler of resyncHandlersRef.current) {
          handler(message.channels, message.reason)
        }
        return
      }
      if (message.type === "presence") {
        setMembers(message.members)
        for (const handler of presenceHandlersRef.current) {
          handler(message.members)
        }
      }
    },
    [rememberSeq, subscribeSeq],
  )
  const handleMessageRef = useRef(handleMessage)
  handleMessageRef.current = handleMessage

  const subscribe = useCallback(
    (channels: readonly string[]) => {
      const normalized = normalizeRealtimeChannels(channels)
      const fresh: string[] = []
      for (const channel of normalized) {
        const next = (refsRef.current.get(channel) ?? 0) + 1
        refsRef.current.set(channel, next)
        if (next === 1) fresh.push(channel)
      }
      if (fresh.length) {
        setWantsSocket(true)
        flushSubscribe(fresh)
      }
    },
    [flushSubscribe],
  )

  const unsubscribe = useCallback((channels: readonly string[]) => {
    const normalized = normalizeRealtimeChannels(channels)
    const dropped: string[] = []
    for (const channel of normalized) {
      const current = refsRef.current.get(channel) ?? 0
      if (current <= 1) {
        refsRef.current.delete(channel)
        dropped.push(channel)
      } else {
        refsRef.current.set(channel, current - 1)
      }
    }
    if (dropped.length) {
      socketRef.current?.send({ type: "unsubscribe", channels: dropped })
    }
  }, [])

  const addEventListener = useCallback((handler: RealtimeEventHandler) => {
    eventHandlersRef.current.add(handler)
    return () => {
      eventHandlersRef.current.delete(handler)
    }
  }, [])

  const addResyncListener = useCallback((handler: RealtimeResyncHandler) => {
    resyncHandlersRef.current.add(handler)
    return () => {
      resyncHandlersRef.current.delete(handler)
    }
  }, [])

  const addPresenceListener = useCallback((handler: RealtimePresenceHandler) => {
    presenceHandlersRef.current.add(handler)
    return () => {
      presenceHandlersRef.current.delete(handler)
    }
  }, [])

  useEffect(() => {
    helloSeqRef.current = null
    lastSeqRef.current = popId ? readSessionRealtimeLastSeq(popId) : null
    setLastSeq(lastSeqRef.current)
    setSeqReady(false)
    const id = popId
    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current)
        persistTimerRef.current = null
      }
      const seq = lastSeqRef.current
      if (id && seq != null) void persistRealtimeLastSeq(id, seq)
    }
  }, [popId])

  useEffect(() => {
    if (!popId || !wantsSocket) return
    let cancelled = false
    void loadRealtimeLastSeq(popId).then((seq) => {
      if (cancelled) return
      if (seq != null) rememberSeq(seq)
      setSeqReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [popId, rememberSeq, wantsSocket])

  useEffect(() => {
    if (!canConnect || !wantsSocket || !seqReady || !userId || !popId) {
      socketRef.current?.close()
      socketRef.current = null
      helloSeqRef.current = null
      setStatus("idle")
      setMembers([])
      return
    }

    const supabase = createClient()
    const socket = connectPopRealtimeSocket(
      async () => {
        const { data } = await supabase.auth.getSession()
        const token = data.session?.access_token
        return token ? popRealtimeWsUrl(popId, token) : null
      },
      {
        onStatus: setStatus,
        onMessage: (message) => handleMessageRef.current(message),
      },
    )
    socketRef.current = socket

    return () => {
      socket.close()
      if (socketRef.current === socket) socketRef.current = null
      helloSeqRef.current = null
    }
  }, [canConnect, popId, seqReady, userId, wantsSocket])

  const value = useMemo(
    (): PopRealtimeContextValue => ({
      status,
      lastSeq,
      members,
      subscribe,
      unsubscribe,
      addEventListener,
      addResyncListener,
      addPresenceListener,
    }),
    [
      addEventListener,
      addPresenceListener,
      addResyncListener,
      lastSeq,
      members,
      status,
      subscribe,
      unsubscribe,
    ],
  )

  return (
    <PopRealtimeContext.Provider value={value}>
      {children}
    </PopRealtimeContext.Provider>
  )
}

export function usePopRealtimeContext(): PopRealtimeContextValue {
  const ctx = useContext(PopRealtimeContext)
  if (ctx === undefined) {
    throw new Error("usePopRealtime debe usarse dentro de PopRealtimeProvider")
  }
  return ctx
}

export function usePopRealtimeContextOptional(): PopRealtimeContextValue | null {
  return useContext(PopRealtimeContext) ?? null
}
