"use client"

import { useEffect, useState } from "react"
import { LANDING_DESKTOP_MIN_WIDTH } from "@/components/landing/constants"
import type { LandingLayoutMode } from "@/components/landing/types"

export function useLandingLayout(): LandingLayoutMode | null {
  const [layout, setLayout] = useState<LandingLayoutMode | null>(null)

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LANDING_DESKTOP_MIN_WIDTH}px)`)
    const update = () => {
      setLayout(mq.matches ? "desktop" : "mobile")
    }
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  return layout
}
