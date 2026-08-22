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

const SEQ_STORAGE_PREFIX = "rootsy-realtime-seq:"

export type RealtimeEventHandler = (event: DomainEvent) => void
export type RealtimeResyncHandler = (channels: string[], reason: "gap" | "empty") => void
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

function readStoredSeq(popId: string): number | null {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(`${SEQ_STORAGE_PREFIX}${popId}`)
  if (!raw) return null
  const seq = Number(raw)
  return Number.isFinite(seq) && seq >= 0 ? seq : null
}

function writeStoredSeq(popId: string, seq: number) {
  sessionStorage.setItem(`${SEQ_STORAGE_PREFIX}${popId}`, String(seq))
}

export function PopRealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { popId, popAccess, loading, error } = usePopWorkspace()
  const enabled = Boolean(user && popId && popAccess && !loading && !error)

  const [status, setStatus] = useState<RealtimeConnectionStatus>("idle")
  const [lastSeq, setLastSeq] = useState<number | null>(null)
  const [members, setMembers] = useState<PresenceMember[]>([])
  const [wantsSocket, setWantsSocket] = useState(false)

  const socketRef = useRef<PopRealtimeSocket | null>(null)
  const refsRef = useRef(new Map<string, number>())
  const lastSeqRef = useRef<number | null>(null)
  const helloSeqRef = useRef<number | null>(null)
  const eventHandlersRef = useRef(new Set<RealtimeEventHandler>())
  const resyncHandlersRef = useRef(new Set<RealtimeResyncHandler>())
  const presenceHandlersRef = useRef(new Set<RealtimePresenceHandler>())

  const rememberSeq = useCallback(
    (seq: number) => {
      if (lastSeqRef.current != null && seq <= lastSeqRef.current) return
      lastSeqRef.current = seq
      setLastSeq(seq)
      if (popId) writeStoredSeq(popId, seq)
    },
    [popId],
  )

  const dispatchEvent = useCallback(
    (event: DomainEvent) => {
      rememberSeq(event.seq)
      applyRealtimeEventToQuery(queryClient, event)
      for (const handler of eventHandlersRef.current) handler(event)
    },
    [queryClient, rememberSeq],
  )

  const handleMessage = useCallback(
    (message: ServerMessage) => {
      if (message.type === "hello") {
        helloSeqRef.current = message.seq
        const stored = lastSeqRef.current
        const channels = [...refsRef.current.keys()]
        if (channels.length) {
          socketRef.current?.send({
            type: "subscribe",
            channels,
            lastSeq: stored ?? undefined,
          })
        }
        return
      }
      if (message.type === "event") {
        dispatchEvent(message.event)
        return
      }
      if (message.type === "replay") {
        for (const event of message.events) dispatchEvent(event)
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
    [dispatchEvent, rememberSeq],
  )

  const flushSubscribe = useCallback((channels: string[]) => {
    if (!channels.length) return
    socketRef.current?.send({
      type: "subscribe",
      channels,
      lastSeq: lastSeqRef.current ?? undefined,
    })
  }, [])

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
    lastSeqRef.current = popId ? readStoredSeq(popId) : null
    setLastSeq(lastSeqRef.current)
  }, [popId])

  useEffect(() => {
    if (!enabled || !wantsSocket || !user || !popId || !popRealtimeBaseUrl()) {
      socketRef.current?.close()
      socketRef.current = null
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
        onMessage: handleMessage,
      },
    )
    socketRef.current = socket

    return () => {
      socket.close()
      if (socketRef.current === socket) socketRef.current = null
    }
  }, [enabled, handleMessage, popId, user, wantsSocket])

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

