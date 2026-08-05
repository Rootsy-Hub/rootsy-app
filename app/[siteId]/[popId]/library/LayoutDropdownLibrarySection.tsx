"use client"

import { DropdownLiveGallery } from "@/app/[siteId]/[popId]/library/components/DropdownLiveGallery"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

type Props = {
  siteId?: string
  popId?: string
}

export function LayoutDropdownLibrarySection(_props: Props) {
  return (
    <LibrarySection id="dropdown" title="Dropdown">
      <DropdownLiveGallery />
    </LibrarySection>
  )
}
