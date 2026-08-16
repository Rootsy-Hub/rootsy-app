"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import "./rootsyBorderSystem.css"
import {
  BORDER_RELATED_LINKS,
  getBorderPageMeta,
} from "@/app/library/border/borderLibraryNav"
import { BorderOverviewSection } from "@/app/library/border/sections/BorderOverviewSection"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function BorderFoundationView({ sectionId }: Props) {
  let content: ReactNode = null
  if (sectionId === "border") {
    content = <BorderOverviewSection />
  } else {
    return null
  }

  return (
    <div className="rootsy-border-system space-y-10">
      {content}
      <LibraryRelatedLinksSection excludeId={sectionId} links={BORDER_RELATED_LINKS} />
    </div>
  )
}

export function getBorderFoundationHeading(sectionId: string) {
  return getBorderPageMeta(sectionId)?.title ?? "Borde"
}
