"use client"

import { useEffect, useState } from "react"

const listeners = new Set<() => void>()
let intervalId: ReturnType<typeof setInterval> | null = null

function subscribeDurationTick(onTick: () => void) {
  listeners.add(onTick)
  if (intervalId == null) {
    intervalId = setInterval(() => {
      for (const listener of listeners) {
        listener()
      }
    }, 60_000)
  }
  return () => {
    listeners.delete(onTick)
    if (listeners.size === 0 && intervalId != null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }
}

/** Un solo timer compartido para todas las etiquetas de duración en el plano. */
export function useMesaOpenDurationTick() {
  const [, setTick] = useState(0)
  useEffect(() => subscribeDurationTick(() => setTick((n) => n + 1)), [])
}
