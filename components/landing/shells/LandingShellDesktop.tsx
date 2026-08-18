"use client"

import { LandingTopBar } from "@/components/landing/chrome/LandingTopBar"
import { useLandingNavigation } from "@/components/landing/context/LandingNavigationProvider"
import { LandingSectionFrame } from "@/components/landing/sections/LandingSectionFrame"
import { LANDING_VIEW_IDS } from "@/components/landing/landingViews"

export function LandingShellDesktop() {
  const { goToChapter } = useLandingNavigation()

  return (
    <div className="relative min-h-dvh text-foreground">
      <div className="relative z-10">
        <LandingTopBar onHome={() => goToChapter("inicio")} sticky />
        <main>
          {LANDING_VIEW_IDS.map((viewId) => (
            <LandingSectionFrame key={viewId} viewId={viewId} layout="desktop" />
          ))}
        </main>
      </div>
    </div>
  )
}
