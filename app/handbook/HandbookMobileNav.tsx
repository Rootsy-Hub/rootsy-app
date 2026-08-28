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
import Link from "next/link"

export function HandbookMobileNav({
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
    <details className="lg:hidden">
      <summary
        className={cn(
          "handbook-mobile-trigger flex cursor-pointer list-none items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium",
        )}
      >
        Secciones
        <span
          className={cn(
            "handbook-mobile-trigger-meta text-xs font-semibold uppercase tracking-[0.12em]",
          )}
        >
          {isDesignSystem ? "Sistema de diseño" : "Handbook"}
        </span>
      </summary>
      <div
        className={cn(
          "handbook-rail mt-3 overflow-hidden rounded-2xl border",
          librarySidebarClass,
        )}
      >
        <div className={cn("max-h-[70vh] overflow-y-auto p-4", libraryScrollDarkClass)}>
          {isDesignSystem ? (
            <>
              <Link
                href={HANDBOOK_DESIGN_SYSTEM_BACK_HREF}
                scroll={false}
                className={cn(libraryNavItemClass, "mb-3")}
                onClick={() => onSelectSection?.("producto")}
              >
                <ArrowLeft className={libraryNavItemIconClass} aria-hidden />
                <span>Volver</span>
              </Link>
              <p className={cn("mb-4 px-2", librarySidebarEyebrowClass)}>Navegación</p>
              <HandbookDesignSystemNav
                activePageId={designSystemPageId ?? "overview"}
                onSelectPage={onSelectDesignSystemPage}
              />
            </>
          ) : (
            <>
              <p className={cn("mb-4 px-2", librarySidebarEyebrowClass)}>Navegación</p>
              <HandbookNav activeSectionId={activeSectionId} onSelectSection={onSelectSection} />
            </>
          )}
        </div>
      </div>
    </details>
  )
}
