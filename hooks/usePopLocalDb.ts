"use client"

import { openPopLocalDb } from "@/lib/popLocalDb"
import { useEffect, useState } from "react"

export type PopLocalDbStatus = "loading" | "ready" | "fallback"

const statusByPop = new Map<string, PopLocalDbStatus>()

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
    void openPopLocalDb(popId).then(
      () => {
        statusByPop.set(popId, "ready")
        if (!cancelled) setStatus("ready")
      },
      () => {
        statusByPop.set(popId, "fallback")
        if (!cancelled) setStatus("fallback")
      },
    )
    return () => {
      cancelled = true
    }
  }, [popId])

  return status
}
