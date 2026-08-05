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
    <aside className={cn("hidden w-64 shrink-0 border-r lg:block", librarySidebarClass)}>
      <div
        className={cn(
          "sticky top-0 flex max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto p-4",
          libraryScrollDarkClass,
        )}
      >
        <LibraryNav siteId={siteId} popId={popId} activeSectionId={activeSectionId} />
      </div>
    </aside>
  )
}
