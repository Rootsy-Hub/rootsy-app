"use client"

import {
  ROOTSY_LAYOUTS_VARIANT_CONCEPT,
  type LayoutsHeroVariant,
} from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsSystem"
import { FoundationConceptHero } from "@/app/[siteId]/[popId]/library/libraryFoundationDocShared"

export {
  LibraryDocLead as LayoutsDocLead,
  LibraryDocSection as LayoutsDocSection,
  LibraryPrinciplesGrid as LayoutsPrinciplesGrid,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"

export function LayoutsSystemHero({ variant }: { variant: LayoutsHeroVariant }) {
  const { eyebrow, ...concept } = ROOTSY_LAYOUTS_VARIANT_CONCEPT[variant]
  return <FoundationConceptHero eyebrow={eyebrow} concept={concept} />
}
