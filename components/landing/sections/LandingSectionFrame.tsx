import {
  LANDING_VIEW_STRUCTURE,
  type LandingViewId,
} from "@/components/landing/landingViews"
import type { LandingLayoutMode } from "@/components/landing/types"
import { cn } from "@/lib/utils"
import { LandingSection } from "@/components/landing/sections/registry"

type LandingSectionFrameProps = {
  viewId: LandingViewId
  layout: LandingLayoutMode
}

export function LandingSectionFrame({ viewId, layout }: LandingSectionFrameProps) {
  const structure = LANDING_VIEW_STRUCTURE[viewId]

  if (layout === "mobile") {
    return (
      <section
        id={viewId}
        data-landing-chapter={viewId}
        className={cn(
          "scroll-mt-[3.75rem] border-b border-rootsy-hairline/40 px-4 py-10 sm:px-6",
          structure.mobileSection === "viewport" &&
            "flex min-h-[calc(100dvh-3.75rem)] flex-col justify-center",
        )}
      >
        <LandingSection viewId={viewId} />
      </section>
    )
  }

  return (
    <div
      data-landing-chapter={viewId}
      className={cn(
        "rootsy-landing-scene-in w-full min-w-0 shrink-0",
        structure.desktopStage === "scroll" && "mx-auto max-w-7xl",
      )}
    >
      <LandingSection viewId={viewId} />
    </div>
  )
}
