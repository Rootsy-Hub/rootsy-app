"use client"

import { useEffect, useState } from "react"

export type LandingPointerGlow = {
  x: number
  y: number
}

const DEFAULT_GLOW: LandingPointerGlow = { x: 72, y: 48 }

export function useLandingPointerGlow(): LandingPointerGlow {
  const [glow, setGlow] = useState(DEFAULT_GLOW)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setGlow({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return glow
}
