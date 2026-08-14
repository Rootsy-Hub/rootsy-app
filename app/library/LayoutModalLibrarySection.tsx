"use client"

import { ModalsLiveGallery } from "@/app/library/components/ModalsLiveGallery"
import { ROOTSY_MODAL_MANIFESTO } from "@/app/library/modal/rootsyModalSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function LayoutModalLibrarySection() {
  return (
    <LibrarySection
      id="modals"
      title="Modales"
      description="RootsDialog* vivos — scrim fixed · elevation.surface.overlay + shadow.overlay · body sunken."
    >
      <p className="max-w-3xl font-canopy text-sm leading-relaxed text-[var(--rootsy-bruma-500)]">
        {ROOTSY_MODAL_MANIFESTO}
      </p>
      <ModalsLiveGallery />
    </LibrarySection>
  )
}
