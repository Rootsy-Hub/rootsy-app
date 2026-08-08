"use client"

import { useCallback } from "react"
import type { MouseEvent } from "react"

const TILT_MAX_DEG = 8

export function useCardTiltHandlers() {
  const onMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty("--rx", `${-py * TILT_MAX_DEG}deg`)
    el.style.setProperty("--ry", `${px * TILT_MAX_DEG}deg`)
  }, [])

  const onMouseLeave = useCallback((e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    el.style.setProperty("--rx", "0deg")
    el.style.setProperty("--ry", "0deg")
  }, [])

  return { onMouseMove, onMouseLeave }
}
