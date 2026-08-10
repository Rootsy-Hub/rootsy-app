"use client"

import { LibraryNav } from "@/app/library/layoutLibraryShared"
import {
  libraryScrollDarkClass,
  librarySidebarClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"

export function LibrarySidebar() {
  const params = useParams()
  const activeSectionId =
    typeof params?.sectionId === "string" ? params.sectionId : "concept"

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
        <LibraryNav activeSectionId={activeSectionId} />
      </div>
    </aside>
  )
}
