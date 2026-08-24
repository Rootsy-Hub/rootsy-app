"use client"

import { getMundosPageMeta } from "@/app/library/mundos/mundosLibraryNav"
import {
  MundosDocLead,
  MundosDocSection,
  MundosWorldGallery,
} from "@/app/library/mundos/MundosDocPrimitives"
import {
  ROOTSY_MUNDOS_MANIFESTO,
  ROOTSY_PRODUCT_WORLDS,
} from "@/app/library/mundos/rootsyMundosSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function MundosOverviewSection() {
  const meta = getMundosPageMeta("mundos")!

  return (
    <LibrarySection id="mundos" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <MundosDocLead>{ROOTSY_MUNDOS_MANIFESTO}</MundosDocLead>

        {ROOTSY_PRODUCT_WORLDS.map((world) => (
          <MundosDocSection
            key={world.id}
            id={`mundo-${world.id}`}
            title={world.name}
            description={world.usedIn}
            titleClassName="text-[length:var(--rootsy-text-heading-medium-size)] leading-[var(--rootsy-text-heading-medium-lh)]"
          >
            <MundosWorldGallery worldId={world.id} />
          </MundosDocSection>
        ))}
      </div>
    </LibrarySection>
  )
}
