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
  const isDesktop = layout === "desktop"

  return (
    <section
      id={viewId}
      data-landing-chapter={viewId}
      className={cn(
        "w-full min-w-0",
        isDesktop
          ? "scroll-mt-14 px-4 py-12 sm:scroll-mt-15 sm:px-8 sm:py-16"
          : "scroll-mt-[3.75rem] border-b border-rootsy-hairline/40 px-4 py-10 sm:px-6",
        isDesktop &&
          structure.desktopStage === "fit" &&
          "flex min-h-[calc(100dvh-3.5rem)] flex-col justify-center sm:min-h-[calc(100dvh-3.75rem)]",
        !isDesktop &&
          structure.mobileSection === "viewport" &&
          "flex min-h-[calc(100dvh-3.75rem)] flex-col justify-center",
        isDesktop && structure.desktopStage === "scroll" && "mx-auto max-w-7xl",
      )}
    >
      <LandingSection viewId={viewId} />
    </section>
  )
}
