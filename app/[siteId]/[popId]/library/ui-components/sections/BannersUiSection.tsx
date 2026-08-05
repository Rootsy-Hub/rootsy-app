"use client"

import { BannersUiHardcodedGallery } from "@/app/[siteId]/[popId]/library/ui-components/BannersUiHardcodedGallery"
import { getUiComponentsPageMeta } from "@/app/[siteId]/[popId]/library/ui-components/uiComponentsLibraryNav"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function BannersUiSection() {
  const meta = getUiComponentsPageMeta("ui-components-banners")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <BannersUiHardcodedGallery />
    </LibrarySection>
  )
}
