import type { ClientMessage, RealtimeConnectionStatus, ServerMessage } from "./protocol"

const PING_MS = 25_000
const RECONNECT_MIN_MS = 500
const RECONNECT_MAX_MS = 10_000

type SocketHandlers = {
  onStatus: (status: Exclude<RealtimeConnectionStatus, "idle">) => void
  onMessage: (message: ServerMessage) => void
}

export type PopRealtimeSocket = {
  send: (message: ClientMessage) => void
  close: () => void
}

export function connectPopRealtimeSocket(
  resolveUrl: () => Promise<string | null>,
  handlers: SocketHandlers,
): PopRealtimeSocket {
  let closed = false
  let ws: WebSocket | null = null
  let attempt = 0
  let outbound: string[] = []
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let pingTimer: ReturnType<typeof setInterval> | null = null

  function clearTimers() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (pingTimer) {
      clearInterval(pingTimer)
      pingTimer = null
    }
  }

  function startPing() {
    if (pingTimer) clearInterval(pingTimer)
    pingTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send("ping")
      }
    }, PING_MS)
  }

  function flushOutbound(socket: WebSocket) {
    if (!outbound.length) return
    const pending = outbound
    outbound = []
    for (const frame of pending) socket.send(frame)
  }

  function scheduleReconnect() {
    if (closed || reconnectTimer) return
    const delay = Math.min(
      RECONNECT_MAX_MS,
      RECONNECT_MIN_MS * 2 ** attempt,
    )
    attempt += 1
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      void open()
    }, delay)
  }

  async function open() {
    if (closed) return
    clearTimers()
    handlers.onStatus("connecting")

    const url = await resolveUrl()
    if (closed) return
    if (!url) {
      handlers.onStatus("disconnected")
      scheduleReconnect()
      return
    }

    const socket = new WebSocket(url)
    ws = socket

    socket.onopen = () => {
      if (ws !== socket) return
      attempt = 0
      handlers.onStatus("connected")
      flushOutbound(socket)
      startPing()
    }

    socket.onmessage = (event) => {
      if (ws !== socket) return
      if (typeof event.data !== "string" || event.data === "pong") return
      try {
        handlers.onMessage(JSON.parse(event.data) as ServerMessage)
      } catch {
        // ignore malformed frames
      }
    }

    socket.onerror = () => {
      // onclose handles reconnect
    }

    socket.onclose = () => {
      if (ws !== socket) return
      ws = null
      clearTimers()
      if (closed) return
      handlers.onStatus("disconnected")
      scheduleReconnect()
    }
  }

  void open()

  return {
    send(message) {
      const frame = JSON.stringify(message)
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(frame)
        return
      }
      outbound.push(frame)
    },
    close() {
      closed = true
      outbound = []
      clearTimers()
      const socket = ws
      ws = null
      socket?.close()
    },
  }
}
