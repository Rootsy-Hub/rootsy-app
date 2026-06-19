import type { LandingViewId } from "@/components/landing/landingViews"

export type LandingLayoutMode = "desktop" | "mobile"

export type LandingSectionProps = {
  viewId: LandingViewId
}

export type LandingNavigationValue = {
  layout: LandingLayoutMode
  activeChapter: LandingViewId
  sceneKey: number
  goToChapter: (id: LandingViewId) => void
  goRegister: () => void
}
