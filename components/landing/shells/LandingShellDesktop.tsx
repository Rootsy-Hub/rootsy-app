"use client"

import { LandingChapterStrip } from "@/components/landing/chrome/LandingChapterStrip"
import { LandingTopBar } from "@/components/landing/chrome/LandingTopBar"
import { useLandingNavigation } from "@/components/landing/context/LandingNavigationProvider"
import { LandingDesktopStage } from "@/components/landing/shells/LandingDesktopStage"
import { LandingSectionFrame } from "@/components/landing/sections/LandingSectionFrame"
import { LANDING_VIEW_STRUCTURE } from "@/components/landing/landingViews"

export function LandingShellDesktop() {
  const { activeChapter, sceneKey, goToChapter } = useLandingNavigation()
  const stageMode = LANDING_VIEW_STRUCTURE[activeChapter].desktopStage

  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden text-foreground">
      <div className="relative z-10 grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
        <LandingTopBar onHome={() => goToChapter("inicio")} />
        <LandingDesktopStage sceneKey={sceneKey} stageMode={stageMode}>
          <LandingSectionFrame viewId={activeChapter} layout="desktop" />
        </LandingDesktopStage>
        <LandingChapterStrip />
      </div>
    </div>
  )
}
