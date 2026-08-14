"use client"

import { DropdownLiveGallery } from "@/app/library/components/DropdownLiveGallery"
import { ROOTSY_DROPDOWN_MANIFESTO } from "@/app/library/dropdown/rootsyDropdownSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function LayoutDropdownLibrarySection() {
  return (
    <LibrarySection
      id="dropdown"
      title="Dropdown"
      description="RootsDropdown* vivos — panel overlay + shadow.overlay · sin scrim · anclado al trigger."
    >
      <p className="max-w-3xl font-canopy text-sm leading-relaxed text-[var(--rootsy-bruma-500)]">
        {ROOTSY_DROPDOWN_MANIFESTO}
      </p>
      <DropdownLiveGallery />
    </LibrarySection>
  )
}
