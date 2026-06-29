"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function formatMesaOpenDuration(openedAt: string, now = Date.now()): string {
  const ms = Math.max(0, now - new Date(openedAt).getTime())
  const mins = Math.floor(ms / 60_000)
  if (mins < 1) return "<1m"
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  if (hours < 24) {
    return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`
  }
  const days = Math.floor(hours / 24)
  const remHours = hours % 24
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`
}

type Props = {
  openedAt: string
  className?: string
}

/** Tiempo abierta; se actualiza cada minuto. */
export function MesaOpenDurationLabel({ openedAt, className }: Props) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((n) => n + 1)
    }, 60_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span className={cn("font-medium tabular-nums", className)}>
      {formatMesaOpenDuration(openedAt)}
    </span>
  )
}
