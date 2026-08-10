"use client"

import { ButtonsUiHardcodedGallery } from "@/app/library/ui-components/ButtonsUiHardcodedGallery"
import { getUiComponentsPageMeta } from "@/app/library/ui-components/uiComponentsLibraryNav"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function ButtonsUiSection() {
  const meta = getUiComponentsPageMeta("ui-components-buttons")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <ButtonsUiHardcodedGallery />
    </LibrarySection>
  )
}
