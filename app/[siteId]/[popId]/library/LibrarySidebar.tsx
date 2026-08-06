"use client"

import { LibraryNav } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import {
  libraryScrollDarkClass,
  librarySidebarClass,
} from "@/app/[siteId]/[popId]/library/libraryColorTheme"
import { cn } from "@/lib/utils"

type Props = {
  siteId: string
  popId: string
  activeSectionId: string
}

export function LibrarySidebar({ siteId, popId, activeSectionId }: Props) {
  return (
    <aside
      className={cn(
        "hidden min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r lg:flex",
        librarySidebarClass,
      )}
    >
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4",
          libraryScrollDarkClass,
        )}
      >
        <LibraryNav siteId={siteId} popId={popId} activeSectionId={activeSectionId} />
      </div>
    </aside>
  )
}
