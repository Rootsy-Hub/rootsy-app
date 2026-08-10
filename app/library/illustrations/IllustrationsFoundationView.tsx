"use client"

import { IllustrationsOverviewSection } from "@/app/library/illustrations/sections/IllustrationsOverviewSection"
import { getIllustrationsPageMeta } from "@/app/library/illustrations/illustrationsLibraryNav"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function IllustrationsFoundationView({ sectionId }: Props) {
  let content: ReactNode = null

  switch (sectionId) {
    case "illustrations":
      content = <IllustrationsOverviewSection />
      break
    default:
      return null
  }

  return <div className="space-y-10">{content}</div>
}

export function getIllustrationsFoundationHeading(sectionId: string) {
  return getIllustrationsPageMeta(sectionId)?.title ?? "Ilustraciones"
}
