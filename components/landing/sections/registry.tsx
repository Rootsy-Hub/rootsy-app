import type { ComponentType } from "react"
import { LandingEmpezarSection } from "@/components/landing/sections/LandingEmpezarSection"
import { LandingInicioSection } from "@/components/landing/sections/LandingInicioSection"
import { LandingSectionPlaceholder } from "@/components/landing/sections/LandingSectionPlaceholder"
import {
  LANDING_VIEW_IDS,
  type LandingViewId,
} from "@/components/landing/landingViews"
import type { LandingSectionProps } from "@/components/landing/types"

const LANDING_SECTION_COMPONENTS: Partial<
  Record<LandingViewId, ComponentType<LandingSectionProps>>
> = {
  inicio: LandingInicioSection,
  empezar: LandingEmpezarSection,
}

export const LANDING_SECTION_REGISTRY: Record<
  LandingViewId,
  ComponentType<LandingSectionProps>
> = Object.fromEntries(
  LANDING_VIEW_IDS.map((id) => [
    id,
    LANDING_SECTION_COMPONENTS[id] ?? LandingSectionPlaceholder,
  ]),
) as Record<LandingViewId, ComponentType<LandingSectionProps>>

export function LandingSection({ viewId }: LandingSectionProps) {
  const Component = LANDING_SECTION_REGISTRY[viewId]
  return <Component viewId={viewId} />
}
