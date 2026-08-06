"use client"

import { DropdownLiveGallery } from "@/app/[siteId]/[popId]/library/components/DropdownLiveGallery"
import { ROOTSY_DROPDOWN_MANIFESTO } from "@/app/[siteId]/[popId]/library/dropdown/rootsyDropdownSystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

type Props = {
  siteId?: string
  popId?: string
}

export function LayoutDropdownLibrarySection(_props: Props) {
  return (
    <LibrarySection
      id="dropdown"
      title="Dropdown"
      description="RootsDropdown* vivos — panel overlay + shadow.overlay · sin scrim · anclado al trigger."
    >
      <p className="max-w-3xl font-canopy text-sm leading-relaxed text-muted-foreground">
        {ROOTSY_DROPDOWN_MANIFESTO}
      </p>
      <DropdownLiveGallery />
    </LibrarySection>
  )
}
