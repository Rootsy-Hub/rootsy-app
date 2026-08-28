"use client"

import { openPopLocalDb } from "@/lib/popLocalDb"
import { useEffect, useState } from "react"

export type PopLocalDbStatus = "loading" | "ready" | "fallback"

const statusByPop = new Map<string, PopLocalDbStatus>()

export async function ensurePopLocalDbStatus(
  popId: string,
): Promise<Exclude<PopLocalDbStatus, "loading">> {
  const known = statusByPop.get(popId)
  if (known === "ready" || known === "fallback") return known
  try {
    await openPopLocalDb(popId)
    statusByPop.set(popId, "ready")
    return "ready"
  } catch {
    statusByPop.set(popId, "fallback")
    return "fallback"
  }
}

export function usePopLocalDb(popId: string | undefined): PopLocalDbStatus {
  const [status, setStatus] = useState<PopLocalDbStatus>(() =>
    popId ? (statusByPop.get(popId) ?? "loading") : "loading",
  )

  useEffect(() => {
    if (!popId) {
      setStatus("loading")
      return
    }
    const known = statusByPop.get(popId)
    if (known === "ready" || known === "fallback") {
      setStatus(known)
      return
    }
    let cancelled = false
    setStatus("loading")
    void ensurePopLocalDbStatus(popId).then((next) => {
      if (!cancelled) setStatus(next)
    })
    return () => {
      cancelled = true
    }
  }, [popId])

  return status
}
