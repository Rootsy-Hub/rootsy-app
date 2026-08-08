"use client"

import type { ReactNode } from "react"
import type { LandingDesktopStageMode } from "@/components/landing/landingViews"
import { cn } from "@/lib/utils"

type LandingDesktopStageProps = {
  sceneKey: number
  stageMode: LandingDesktopStageMode
  children: ReactNode
}

export function LandingDesktopStage({
  sceneKey,
  stageMode,
  children,
}: LandingDesktopStageProps) {
  const isFit = stageMode === "fit"

  return (
    <main
      className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto rootsy-scroll-minimal"
      data-landing-stage
    >
      <div
        key={sceneKey}
        className={cn(
          "mx-auto flex w-full max-w-[90rem] flex-col px-4 sm:px-8",
          isFit
            ? "min-h-full justify-center py-4 sm:py-6"
            : "py-6 sm:py-8",
        )}
      >
        {children}
      </div>
    </main>
  )
}
