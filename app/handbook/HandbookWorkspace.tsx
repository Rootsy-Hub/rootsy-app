import { HandbookMobileNav } from "@/app/handbook/HandbookMobileNav"
import { HandbookSectionView } from "@/app/handbook/HandbookSectionView"
import { HandbookSidebar } from "@/app/handbook/HandbookSidebar"
import { getHandbookNavGroup } from "@/app/handbook/layoutHandbookShared"
import {
  libraryContentAreaClass,
  libraryContentEyebrowClass,
  libraryScrollLightClass,
  libraryThemeClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"

export function HandbookWorkspace({ sectionId }: { sectionId: string }) {
  const activeGroup = getHandbookNavGroup(sectionId)

  return (
    <div className={cn(libraryThemeClass, "rootsy-app-light flex min-h-0 flex-1 overflow-hidden")}>
      <HandbookSidebar activeSectionId={sectionId} />

      <div
        className={cn(
          "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10",
          libraryContentAreaClass,
          libraryScrollLightClass,
        )}
      >
        <div className="mx-auto max-w-5xl space-y-8">
          <HandbookMobileNav activeSectionId={sectionId} />

          {activeGroup ? (
            <p className={cn("text-xs font-bold uppercase", libraryContentEyebrowClass)}>
              {activeGroup.label}
            </p>
          ) : null}

          <HandbookSectionView sectionId={sectionId} />
        </div>
      </div>
    </div>
  )
}
