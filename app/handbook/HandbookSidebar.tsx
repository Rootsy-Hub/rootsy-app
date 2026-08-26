import { HandbookDesignSystemNav } from "@/app/handbook/HandbookDesignSystemNav"
import {
  HANDBOOK_DESIGN_SYSTEM_BACK_HREF,
} from "@/app/handbook/handbookDesignSystem"
import { HandbookNav } from "@/app/handbook/layoutHandbookShared"
import {
  libraryNavItemClass,
  libraryNavItemIconClass,
  libraryScrollDarkClass,
  librarySidebarClass,
  librarySidebarEyebrowClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function HandbookSidebar({
  activeSectionId,
  designSystemPageId,
  isDesignSystem,
  onSelectSection,
  onSelectDesignSystemPage,
}: {
  activeSectionId: string
  designSystemPageId?: string
  isDesignSystem?: boolean
  onSelectSection?: (sectionId: string) => void
  onSelectDesignSystemPage?: (pageId: string) => void
}) {
  return (
    <aside
      className={cn(
        "handbook-rail hidden min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r lg:flex",
        librarySidebarClass,
      )}
    >
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4",
          libraryScrollDarkClass,
        )}
      >
        {isDesignSystem ? (
          <>
            <Link
              href={HANDBOOK_DESIGN_SYSTEM_BACK_HREF}
              scroll={false}
              className={cn(libraryNavItemClass, "mb-4")}
              onClick={() => onSelectSection?.("producto")}
            >
              <ArrowLeft className={libraryNavItemIconClass} aria-hidden />
              <span>Volver</span>
            </Link>
            <p className={cn("mb-4 px-2", librarySidebarEyebrowClass)}>Sistema de diseño</p>
            <HandbookDesignSystemNav
              activePageId={designSystemPageId ?? "overview"}
              onSelectPage={onSelectDesignSystemPage}
            />
          </>
        ) : (
          <>
            <Link
              href="/"
              aria-label="Rootsy — landing"
              className="mb-6 inline-flex px-2"
            >
              <Image
                src="/rootsy-logo.svg"
                alt="Rootsy"
                width={90}
                height={29}
                priority
                className="h-7 w-auto"
              />
            </Link>
            <HandbookNav activeSectionId={activeSectionId} onSelectSection={onSelectSection} />
          </>
        )}
      </div>
    </aside>
  )
}
