"use client"

import { HandbookV2Nav } from "@/app/handbook/HandbookV2Nav"
import { HandbookV2View } from "@/app/handbook/HandbookV2View"
import {
  DEFAULT_HANDBOOK_V2_PAGE,
  HANDBOOK_V2_BACK_HREF,
  getHandbookV2NavGroup,
  handbookV2Href,
  handbookV2PageFromPath,
  isHandbookV2PageId,
} from "@/app/handbook/handbookV2"
import { MenuSidebar } from "@/components/MenuSidebar"
import {
  libraryContentAreaClass,
  libraryContentEyebrowClass,
  libraryNavItemClass,
  libraryNavItemIconClass,
  libraryScrollDarkClass,
  libraryScrollLightClass,
  librarySidebarClass,
  librarySidebarEyebrowClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export function HandbookV2Workspace() {
  const pathname = usePathname()
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)
  const urlPageId = handbookV2PageFromPath(pathname)
  const [pageId, setPageId] = useState(urlPageId)

  useEffect(() => {
    setPageId(urlPageId)
  }, [urlPageId])

  useEffect(() => {
    if (!isHandbookV2PageId(pageId)) {
      router.replace(handbookV2Href(DEFAULT_HANDBOOK_V2_PAGE))
    }
  }, [pageId, router])

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : ""
    if (hash) {
      const target = contentRef.current?.querySelector(`#${CSS.escape(hash)}`)
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ block: "start" })
        return
      }
    }
    contentRef.current?.scrollTo({ top: 0 })
  }, [pageId])

  const activePageId = isHandbookV2PageId(pageId) ? pageId : DEFAULT_HANDBOOK_V2_PAGE
  const activeGroup = getHandbookV2NavGroup(activePageId)

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <MenuSidebar
        backHref={HANDBOOK_V2_BACK_HREF}
        backLabel="Volver"
        eyebrow="Sistema de diseño v2"
      >
        <HandbookV2Nav
          activePageId={activePageId}
          onSelectPage={setPageId}
        />
      </MenuSidebar>

      <div
        ref={contentRef}
        className={cn(
          "handbook-content min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10",
          libraryContentAreaClass,
          libraryScrollLightClass,
        )}
      >
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <details className="lg:hidden">
            <summary className="handbook-mobile-trigger flex cursor-pointer list-none items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium">
              Secciones
              <span className="handbook-mobile-trigger-meta text-xs font-semibold uppercase tracking-[0.12em]">
                Sistema v2
              </span>
            </summary>
            <div
              className={cn(
                "handbook-rail mt-3 overflow-hidden rounded-2xl border",
                librarySidebarClass,
              )}
            >
              <div className={cn("max-h-[70vh] overflow-y-auto p-4", libraryScrollDarkClass)}>
                <Link
                  href={HANDBOOK_V2_BACK_HREF}
                  scroll={false}
                  className={cn(libraryNavItemClass, "mb-3")}
                >
                  <ArrowLeft className={libraryNavItemIconClass} aria-hidden />
                  <span>Volver</span>
                </Link>
                <p className={cn("mb-4 px-2", librarySidebarEyebrowClass)}>Navegación</p>
                <HandbookV2Nav
                  activePageId={activePageId}
                  onSelectPage={setPageId}
                />
              </div>
            </div>
          </details>

          <p className={cn("text-xs font-bold uppercase", libraryContentEyebrowClass)}>
            {activeGroup?.label || "Sistema de diseño v2"}
          </p>

          <HandbookV2View pageId={activePageId} />
        </div>
      </div>
    </div>
  )
}
