"use client"

import { ButtonsLiveGallery } from "@/app/library/components/ButtonsLiveGallery"
import { ROOTSY_BUTTON_MANIFESTO } from "@/app/library/button/rootsyButtonSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function LayoutButtonLibrarySection() {
  return (
    <LibrarySection
      id="buttons"
      title="Botones"
      description="Componentes Roots*Button vivos — mismas specs que Botones UI, interactivos en default."
    >
      <p className="max-w-3xl font-canopy text-sm leading-relaxed text-muted-foreground">
        {ROOTSY_BUTTON_MANIFESTO}
      </p>
      <ButtonsLiveGallery />
    </LibrarySection>
  )
}
