"use client"

import { BannersUiHardcodedGallery } from "@/app/library/ui-components/BannersUiHardcodedGallery"
import { getUiComponentsPageMeta } from "@/app/library/ui-components/uiComponentsLibraryNav"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function BannersUiSection() {
  const meta = getUiComponentsPageMeta("ui-components-banners")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <BannersUiHardcodedGallery />
    </LibrarySection>
  )
}
