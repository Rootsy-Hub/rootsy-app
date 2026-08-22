/** Contrato de cable Rootsy realtime. Mantener alineado con rootsy-api/src/realtime/protocol.ts */

export type RealtimeResourceRef = {
  type: string
  id: string
}

export type DomainEvent = {
  id: string
  seq: number
  type: string
  popId: string
  actorId: string
  occurredAt: string
  resource?: RealtimeResourceRef
  payload: Record<string, unknown>
  require?: { permissions?: string[] }
  channels?: string[]
}

export type PresenceMember = {
  userId: string
  displayName: string
  connectionCount: number
}

export type ClientMessage =
  | { type: "subscribe"; channels: string[]; lastSeq?: number }
  | { type: "unsubscribe"; channels: string[] }
  | { type: "ping" }

export type ServerMessage =
  | { type: "hello"; connectionId: string; seq: number }
  | { type: "subscribed"; channels: string[] }
  | { type: "unsubscribed"; channels: string[] }
  | { type: "event"; event: DomainEvent }
  | { type: "replay"; events: DomainEvent[] }
  | { type: "resync"; channels: string[]; reason: "gap" | "empty" }
  | { type: "pong"; at: number }
  | { type: "presence"; members: PresenceMember[] }
  | { type: "error"; code: string; message: string }

export type RealtimeConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
