"use client"

import "./rootsyBorderSystem.css"
import {
  BORDER_RELATED_LINKS,
  getBorderPageMeta,
} from "@/app/library/border/borderLibraryNav"
import { BorderOverviewSection } from "@/app/library/border/sections/BorderOverviewSection"
import { BorderRelatedLinks } from "@/app/library/border/BorderDocPrimitives"
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
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <BorderRelatedLinks
          excludeId={sectionId}
          links={BORDER_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

export function getBorderFoundationHeading(sectionId: string) {
  return getBorderPageMeta(sectionId)?.title ?? "Borde"
}
