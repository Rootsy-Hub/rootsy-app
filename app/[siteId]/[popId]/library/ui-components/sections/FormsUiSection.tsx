"use client"

import { FormsUiHardcodedGallery } from "@/app/[siteId]/[popId]/library/ui-components/FormsUiHardcodedGallery"
import { getUiComponentsPageMeta } from "@/app/[siteId]/[popId]/library/ui-components/uiComponentsLibraryNav"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function FormsUiSection() {
  const meta = getUiComponentsPageMeta("ui-components-forms")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <FormsUiHardcodedGallery />
    </LibrarySection>
  )
}
