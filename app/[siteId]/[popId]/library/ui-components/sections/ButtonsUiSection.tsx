"use client"

import { ButtonsUiHardcodedGallery } from "@/app/[siteId]/[popId]/library/ui-components/ButtonsUiHardcodedGallery"
import { getUiComponentsPageMeta } from "@/app/[siteId]/[popId]/library/ui-components/uiComponentsLibraryNav"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ButtonsUiSection() {
  const meta = getUiComponentsPageMeta("ui-components-buttons")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <ButtonsUiHardcodedGallery />
    </LibrarySection>
  )
}
