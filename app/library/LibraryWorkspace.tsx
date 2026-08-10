"use client"

import { LibrarySectionView } from "@/app/library/LibrarySectionView"
import { LibrarySidebar } from "@/app/library/LibrarySidebar"
import {
  libraryContentAreaClass,
  libraryContentEyebrowClass,
  libraryScrollLightClass,
} from "@/app/library/libraryColorTheme"
import { getLibraryNavGroup } from "@/app/library/layoutLibraryShared"
import { useParams } from "next/navigation"

export function LibraryWorkspace() {
  const params = useParams()
  const sectionId =
    typeof params?.sectionId === "string" ? params.sectionId : "concept"
  const activeGroup = getLibraryNavGroup(sectionId)

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <LibrarySidebar />

      <div
        className={`min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10 ${libraryContentAreaClass} ${libraryScrollLightClass}`}
      >
        <div className="mx-auto max-w-5xl space-y-8">
          {activeGroup ? (
            <p
              className={`text-xs font-bold uppercase ${libraryContentEyebrowClass}`}
            >
              {activeGroup.label}
            </p>
          ) : null}

          <LibrarySectionView sectionId={sectionId} />
        </div>
      </div>
    </div>
  )
}
