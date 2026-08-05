"use client"

import { ModalsUiHardcodedGallery } from "@/app/[siteId]/[popId]/library/ui-components/ModalsUiHardcodedGallery"
import { getUiComponentsPageMeta } from "@/app/[siteId]/[popId]/library/ui-components/uiComponentsLibraryNav"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ModalsUiSection() {
  const meta = getUiComponentsPageMeta("ui-components-modals")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <ModalsUiHardcodedGallery />
    </LibrarySection>
  )
}
