"use client"

import { FormsUiHardcodedGallery } from "@/app/library/ui-components/FormsUiHardcodedGallery"
import { getUiComponentsPageMeta } from "@/app/library/ui-components/uiComponentsLibraryNav"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function FormsUiSection() {
  const meta = getUiComponentsPageMeta("ui-components-forms")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <FormsUiHardcodedGallery />
    </LibrarySection>
  )
}
