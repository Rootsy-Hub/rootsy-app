import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  SupabaseClient,
} from "@supabase/supabase-js"

export type RealtimeConnectionStatus = "connecting" | "connected" | "disconnected"

const REALTIME_SYNC_DEBOUNCE_MS = 250

export function readRealtimeRowId(
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
): string | null {
  const record =
    payload.eventType === "DELETE"
      ? payload.old
      : payload.new
  const id = record?.id
  return typeof id === "string" && id.trim() ? id.trim() : null
}

export function readRealtimeForeignKey(
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
  column: string,
): string | null {
  const record =
    payload.eventType === "DELETE"
      ? payload.old
      : payload.new
  const value = record?.[column]
  return typeof value === "string" && value.trim() ? value.trim() : null
}

export function createKeyedDebouncer(delayMs = REALTIME_SYNC_DEBOUNCE_MS) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  return {
    schedule(key: string, fn: () => void) {
      const existing = timers.get(key)
      if (existing) clearTimeout(existing)
      timers.set(
        key,
        setTimeout(() => {
          timers.delete(key)
          fn()
        }, delayMs),
      )
    },
    cancel(key: string) {
      const existing = timers.get(key)
      if (existing) {
        clearTimeout(existing)
        timers.delete(key)
      }
    },
    clear() {
      for (const timer of timers.values()) {
        clearTimeout(timer)
      }
      timers.clear()
    },
  }
}

type PostgresChangeHandler = (
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
) => void

type SubscribePostgresChangesOptions = {
  supabase: SupabaseClient
  channelName: string
  table: string
  schema?: string
  event?: "*" | "INSERT" | "UPDATE" | "DELETE"
  filter?: string
  onChange: PostgresChangeHandler
  onStatusChange?: (status: RealtimeConnectionStatus) => void
}

export function subscribePostgresChanges(
  options: SubscribePostgresChangesOptions,
): RealtimeChannel {
  const {
    supabase,
    channelName,
    table,
    schema = "public",
    event = "*",
    filter,
    onChange,
    onStatusChange,
  } = options

  let channel = supabase.channel(channelName)

  const changeConfig = {
    event,
    schema,
    table,
    ...(filter ? { filter } : {}),
  } as const

  channel = channel.on(
    "postgres_changes",
    changeConfig,
    (payload) => {
      onChange(payload as RealtimePostgresChangesPayload<Record<string, unknown>>)
    },
  )

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      onStatusChange?.("connected")
      return
    }
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      onStatusChange?.("disconnected")
      return
    }
    if (status === "CLOSED") {
      onStatusChange?.("disconnected")
    }
  })

  return channel
}
