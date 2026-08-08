"use client"

import { ModalsLiveGallery } from "@/app/[siteId]/[popId]/library/components/ModalsLiveGallery"
import { ROOTSY_MODAL_MANIFESTO } from "@/app/[siteId]/[popId]/library/modal/rootsyModalSystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

type Props = {
  siteId?: string
  popId?: string
}

export function LayoutModalLibrarySection(_props: Props) {
  return (
    <LibrarySection
      id="modals"
      title="Modales"
      description="RootsDialog* vivos — scrim fixed · elevation.surface.overlay + shadow.overlay · body sunken."
    >
      <p className="max-w-3xl font-canopy text-sm leading-relaxed text-muted-foreground">
        {ROOTSY_MODAL_MANIFESTO}
      </p>
      <ModalsLiveGallery />
    </LibrarySection>
  )
}
