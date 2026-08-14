"use client"

import { FormsLiveGallery } from "@/app/library/components/FormsLiveGallery"
import { ROOTSY_FORM_MANIFESTO } from "@/app/library/form/rootsyFormSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function LayoutFormLibrarySection() {
  return (
    <LibrarySection
      id="formulario"
      title="Formulario"
      description="Componentes RootsForm vivos — mismas specs que Formulario UI, interactivos en default."
    >
      <p className="max-w-3xl font-canopy text-sm leading-relaxed text-[var(--rootsy-bruma-500)]">
        {ROOTSY_FORM_MANIFESTO}
      </p>
      <FormsLiveGallery />
    </LibrarySection>
  )
}
