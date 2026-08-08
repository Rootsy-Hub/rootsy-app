"use client"

import { LandingTopBar } from "@/components/landing/chrome/LandingTopBar"
import { useLandingNavigation } from "@/components/landing/context/LandingNavigationProvider"
import { LandingSectionFrame } from "@/components/landing/sections/LandingSectionFrame"
import { LANDING_VIEW_IDS } from "@/components/landing/landingViews"

export function LandingShellMobile() {
  const { goToChapter } = useLandingNavigation()

  return (
    <div className="relative min-h-dvh text-foreground">
      <div className="relative z-10 grid min-h-dvh grid-rows-[auto_minmax(0,1fr)]">
        <LandingTopBar onHome={() => goToChapter("inicio")} sticky />
        <main className="min-h-0 overflow-y-auto overflow-x-hidden rootsy-scroll-minimal">
          {LANDING_VIEW_IDS.map((viewId) => (
            <LandingSectionFrame key={viewId} viewId={viewId} layout="mobile" />
          ))}
        </main>
      </div>
    </div>
  )
}
