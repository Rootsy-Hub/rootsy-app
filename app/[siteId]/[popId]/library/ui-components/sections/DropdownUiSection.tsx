"use client"

import { DropdownUiHardcodedGallery } from "@/app/[siteId]/[popId]/library/ui-components/DropdownUiHardcodedGallery"
import { getUiComponentsPageMeta } from "@/app/[siteId]/[popId]/library/ui-components/uiComponentsLibraryNav"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function DropdownUiSection() {
  const meta = getUiComponentsPageMeta("ui-components-dropdown")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <DropdownUiHardcodedGallery />
    </LibrarySection>
  )
}
