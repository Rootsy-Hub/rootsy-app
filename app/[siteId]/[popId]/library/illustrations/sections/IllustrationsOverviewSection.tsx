"use client"

import {
  IllustrationsDocLead,
  IllustrationsPrinciplesGrid,
  IllustrationsRoadmapPanel,
  IllustrationsSystemHero,
} from "@/app/[siteId]/[popId]/library/illustrations/IllustrationsDocPrimitives"
import { getIllustrationsPageMeta } from "@/app/[siteId]/[popId]/library/illustrations/illustrationsLibraryNav"
import {
  ROOTSY_ILLUSTRATIONS_MANIFESTO,
  ROOTSY_ILLUSTRATIONS_PRINCIPLES,
} from "@/app/[siteId]/[popId]/library/illustrations/rootsyIllustrationsSystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function IllustrationsOverviewSection() {
  const meta = getIllustrationsPageMeta("illustrations")!

  return (
    <LibrarySection id="illustrations" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <IllustrationsSystemHero />
        <IllustrationsDocLead className="font-canopy">
          {ROOTSY_ILLUSTRATIONS_MANIFESTO}
        </IllustrationsDocLead>
        <IllustrationsPrinciplesGrid principles={[...ROOTSY_ILLUSTRATIONS_PRINCIPLES]} />
        <IllustrationsRoadmapPanel />
      </div>
    </LibrarySection>
  )
}
