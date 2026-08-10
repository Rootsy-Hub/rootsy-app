"use client"

import { DropdownUiHardcodedGallery } from "@/app/library/ui-components/DropdownUiHardcodedGallery"
import { getUiComponentsPageMeta } from "@/app/library/ui-components/uiComponentsLibraryNav"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function DropdownUiSection() {
  const meta = getUiComponentsPageMeta("ui-components-dropdown")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <DropdownUiHardcodedGallery />
    </LibrarySection>
  )
}
