"use client"

import { FormsLiveGallery } from "@/app/[siteId]/[popId]/library/components/FormsLiveGallery"
import { ROOTSY_FORM_MANIFESTO } from "@/app/[siteId]/[popId]/library/form/rootsyFormSystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function LayoutFormLibrarySection() {
  return (
    <LibrarySection
      id="formulario"
      title="Formulario"
      description="Componentes RootsForm vivos — mismas specs que Formulario UI, interactivos en default."
    >
      <p className="max-w-3xl font-canopy text-sm leading-relaxed text-muted-foreground">
        {ROOTSY_FORM_MANIFESTO}
      </p>
      <FormsLiveGallery />
    </LibrarySection>
  )
}
