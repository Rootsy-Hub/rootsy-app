"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import {
  MUNDOS_RELATED_LINKS,
  getMundosPageMeta,
} from "@/app/library/mundos/mundosLibraryNav"
import { MundosOverviewSection } from "@/app/library/mundos/sections/MundosOverviewSection"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function MundosFoundationView({ sectionId }: Props) {
  let content: ReactNode = null
  if (sectionId === "mundos") {
    content = <MundosOverviewSection />
  } else {
    return null
  }

  return (
    <div className="space-y-10">
      {content}
      <LibraryRelatedLinksSection excludeId={sectionId} links={MUNDOS_RELATED_LINKS} />
    </div>
  )
}

export function getMundosFoundationHeading(sectionId: string) {
  return getMundosPageMeta(sectionId)?.title ?? "Mundos"
}
