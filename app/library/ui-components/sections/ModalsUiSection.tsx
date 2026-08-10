"use client"

import { ModalsUiHardcodedGallery } from "@/app/library/ui-components/ModalsUiHardcodedGallery"
import { getUiComponentsPageMeta } from "@/app/library/ui-components/uiComponentsLibraryNav"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function ModalsUiSection() {
  const meta = getUiComponentsPageMeta("ui-components-modals")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <ModalsUiHardcodedGallery />
    </LibrarySection>
  )
}
