"use client"

import { useLandingDocumentTheme } from "@/components/landing/hooks/useLandingDocumentTheme"
import { useLandingLayout } from "@/components/landing/hooks/useLandingLayout"
import { LandingShell } from "@/components/landing/shells/LandingShell"
import { LANDING_BG } from "@/components/landing/constants"

function LandingPageSkeleton() {
  return (
    <div
      className="min-h-dvh w-full"
      style={{ backgroundColor: LANDING_BG }}
      aria-busy="true"
      aria-label="Cargando landing"
    />
  )
}

export function LandingPage() {
  const layout = useLandingLayout()
  useLandingDocumentTheme(layout)

  if (layout === null) {
    return <LandingPageSkeleton />
  }

  return <LandingShell layout={layout} />
}
