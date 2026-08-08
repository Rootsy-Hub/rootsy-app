"use client"

import { ButtonsLiveGallery } from "@/app/[siteId]/[popId]/library/components/ButtonsLiveGallery"
import { ROOTSY_BUTTON_MANIFESTO } from "@/app/[siteId]/[popId]/library/button/rootsyButtonSystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

type Props = {
  siteId?: string
  popId?: string
}

export function LayoutButtonLibrarySection(_props: Props) {
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
