"use client"

import { LibraryNav } from "@/app/library/layoutLibraryShared"
import { MenuSidebar } from "@/components/MenuSidebar"
import { useParams } from "next/navigation"

export function LibrarySidebar() {
  const params = useParams()
  const activeSectionId =
    typeof params?.sectionId === "string" ? params.sectionId : "concept"

  return (
    <MenuSidebar aria-label="Librería">
      <LibraryNav activeSectionId={activeSectionId} />
    </MenuSidebar>
  )
}
