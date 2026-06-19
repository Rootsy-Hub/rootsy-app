"use client"

import { useEffect } from "react"
import { LANDING_BG } from "@/components/landing/constants"
import type { LandingLayoutMode } from "@/components/landing/types"

export function useLandingDocumentTheme(layout: LandingLayoutMode | null) {
  useEffect(() => {
    if (layout === null) return
    const html = document.documentElement
    const body = document.body
    const prevHtml = html.style.backgroundColor
    const prevBody = body.style.backgroundColor
    const prevOverflow = body.style.overflow
    html.style.backgroundColor = LANDING_BG
    body.style.backgroundColor = LANDING_BG
    body.style.overflow = layout === "desktop" ? "hidden" : ""
    return () => {
      html.style.backgroundColor = prevHtml
      body.style.backgroundColor = prevBody
      body.style.overflow = prevOverflow
    }
  }, [layout])
}
