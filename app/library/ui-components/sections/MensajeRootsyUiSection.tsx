"use client"

import { MensajeRootsyHardcodedGallery } from "@/app/library/ui-components/MensajeRootsyHardcodedGallery"
import { getUiComponentsPageMeta } from "@/app/library/ui-components/uiComponentsLibraryNav"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function MensajeRootsyUiSection() {
  const meta = getUiComponentsPageMeta("ui-components-mensaje-rootsy")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <MensajeRootsyHardcodedGallery />
    </LibrarySection>
  )
}
