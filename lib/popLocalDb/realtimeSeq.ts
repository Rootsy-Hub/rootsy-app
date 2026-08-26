import { openPopLocalDb } from "@/lib/popLocalDb/store"

export const REALTIME_LAST_SEQ_META = "realtime_last_seq"

const SESSION_PREFIX = "rootsy-realtime-seq:"

export function parseRealtimeLastSeq(raw: string | null | undefined): number | null {
  if (!raw) return null
  const seq = Number(raw)
  return Number.isFinite(seq) && seq >= 0 ? seq : null
}

export function nextPersistedRealtimeSeq(
  current: number | null,
  incoming: number,
): number {
  if (current != null && incoming <= current) return current
  return incoming
}

export function readSessionRealtimeLastSeq(popId: string): number | null {
  if (typeof window === "undefined") return null
  return parseRealtimeLastSeq(sessionStorage.getItem(`${SESSION_PREFIX}${popId}`))
}

export function writeSessionRealtimeLastSeq(popId: string, seq: number) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(`${SESSION_PREFIX}${popId}`, String(seq))
}

export async function loadRealtimeLastSeq(popId: string): Promise<number | null> {
  try {
    const handle = await openPopLocalDb(popId)
    const seq = parseRealtimeLastSeq(
      handle.database.getMeta(REALTIME_LAST_SEQ_META),
    )
    if (seq != null) return seq
  } catch {
    /* OPFS / sql.js fallback */
  }
  return readSessionRealtimeLastSeq(popId)
}

export async function persistRealtimeLastSeq(popId: string, seq: number): Promise<number> {
  try {
    const handle = await openPopLocalDb(popId)
    const current = parseRealtimeLastSeq(
      handle.database.getMeta(REALTIME_LAST_SEQ_META),
    )
    const next = nextPersistedRealtimeSeq(current, seq)
    writeSessionRealtimeLastSeq(popId, next)
    if (current != null && next === current) return next
    handle.database.setMeta(REALTIME_LAST_SEQ_META, String(next))
    handle.markDirty()
    await handle.flush()
    return next
  } catch {
    writeSessionRealtimeLastSeq(popId, seq)
    return seq
  }
}
