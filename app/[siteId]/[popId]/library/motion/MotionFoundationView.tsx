"use client"

import "./rootsyMotionSystem.css"
import {
  MOTION_RELATED_LINKS,
  getMotionPageMeta,
} from "@/app/[siteId]/[popId]/library/motion/motionLibraryNav"
import { MotionOverviewSection } from "@/app/[siteId]/[popId]/library/motion/sections/MotionOverviewSection"
import { MotionApplyingSection } from "@/app/[siteId]/[popId]/library/motion/sections/MotionApplyingSection"
import { MotionRelatedLinks } from "@/app/[siteId]/[popId]/library/motion/MotionDocPrimitives"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function MotionFoundationView({ sectionId, siteId, popId }: Props) {
  let content: ReactNode = null
  switch (sectionId) {
    case "motion":
      content = <MotionOverviewSection />
      break
    case "motion-applying":
      content = <MotionApplyingSection />
      break
    default:
      return null
  }

  return (
    <div className="rootsy-motion-system space-y-10">
      {content}
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <MotionRelatedLinks
          siteId={siteId}
          popId={popId}
          excludeId={sectionId}
          links={MOTION_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

export function getMotionFoundationHeading(sectionId: string) {
  return getMotionPageMeta(sectionId)?.title ?? "Movimiento"
}
