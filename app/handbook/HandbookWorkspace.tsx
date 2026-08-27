"use client"

import { HandbookBorderView } from "@/app/handbook/border/HandbookBorderView"
import { HandbookColorView } from "@/app/handbook/color/HandbookColorView"
import { HandbookComponentsFinalView } from "@/app/handbook/components/HandbookComponentsFinalView"
import { isHandbookComponentPageId } from "@/app/handbook/components/handbookComponentsSpec"
import { HandbookElevationView } from "@/app/handbook/elevation/HandbookElevationView"
import { HandbookIconographyView } from "@/app/handbook/iconography/HandbookIconographyView"
import { HandbookLayoutView } from "@/app/handbook/layout/HandbookLayoutView"
import { HandbookLogosView } from "@/app/handbook/logos/HandbookLogosView"
import { HandbookMotionView } from "@/app/handbook/motion/HandbookMotionView"
import { HandbookPatternsView } from "@/app/handbook/patterns/HandbookPatternsView"
import { HandbookRadiusView } from "@/app/handbook/radius/HandbookRadiusView"
import { HandbookSpacingView } from "@/app/handbook/spacing/HandbookSpacingView"
import { HandbookSurfacesView } from "@/app/handbook/surfaces/HandbookSurfacesView"
import { HandbookTypographyView } from "@/app/handbook/typography/HandbookTypographyView"
import { HandbookMobileNav } from "@/app/handbook/HandbookMobileNav"
import { HandbookSectionView } from "@/app/handbook/HandbookSectionView"
import { HandbookSidebar } from "@/app/handbook/HandbookSidebar"
import {
  DEFAULT_HANDBOOK_DESIGN_SYSTEM_PAGE,
  HANDBOOK_DESIGN_SYSTEM_ROOT,
  getHandbookDesignSystemNavGroup,
  getHandbookDesignSystemPageMeta,
  handbookDesignSystemHref,
  handbookDesignSystemPageFromPath,
  isHandbookDesignSystemPageId,
  isHandbookDesignSystemPath,
} from "@/app/handbook/handbookDesignSystem"
import {
  DEFAULT_HANDBOOK_SECTION,
  getHandbookNavGroup,
  handbookSectionHref,
  isValidHandbookSection,
} from "@/app/handbook/layoutHandbookShared"
import {
  libraryContentAreaClass,
  libraryContentEyebrowClass,
  libraryScrollLightClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

function sectionIdFromParams(params: ReturnType<typeof useParams>): string {
  return typeof params?.sectionId === "string" ? params.sectionId : DEFAULT_HANDBOOK_SECTION
}

export function HandbookWorkspace() {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)
  const pendingRef = useRef<string | null>(null)

  const urlIsDesignSystem = isHandbookDesignSystemPath(pathname)
  const urlSectionId = sectionIdFromParams(params)
  const urlDesignSystemPageId = handbookDesignSystemPageFromPath(pathname)

  const [mode, setMode] = useState<"handbook" | "design-system">(
    urlIsDesignSystem ? "design-system" : "handbook",
  )
  const [sectionId, setSectionId] = useState(urlSectionId)
  const [designSystemPageId, setDesignSystemPageId] = useState(urlDesignSystemPageId)

  useEffect(() => {
    const nextKey = urlIsDesignSystem
      ? `ds:${urlDesignSystemPageId}`
      : `hb:${urlSectionId}`

    if (pendingRef.current) {
      if (pendingRef.current === nextKey) {
        pendingRef.current = null
      }
      return
    }

    if (urlIsDesignSystem) {
      setMode("design-system")
      setDesignSystemPageId(urlDesignSystemPageId)
      return
    }

    setMode("handbook")
    setSectionId(urlSectionId)
  }, [urlDesignSystemPageId, urlIsDesignSystem, urlSectionId])

  useEffect(() => {
    if (mode !== "handbook") return
    if (!isValidHandbookSection(sectionId) || sectionId === "sistema-de-diseno") {
      router.replace(handbookSectionHref(DEFAULT_HANDBOOK_SECTION))
    }
  }, [mode, router, sectionId])

  useEffect(() => {
    if (mode !== "design-system") return
    const rest = pathname.slice(HANDBOOK_DESIGN_SYSTEM_ROOT.length).replace(/^\//, "")
    const raw = rest.split("/")[0] ?? ""
    if (raw.endsWith("-final") && isHandbookDesignSystemPageId(urlDesignSystemPageId)) {
      router.replace(handbookDesignSystemHref(urlDesignSystemPageId))
      return
    }
    if (!isHandbookDesignSystemPageId(designSystemPageId)) {
      router.replace(HANDBOOK_DESIGN_SYSTEM_ROOT)
    }
  }, [designSystemPageId, mode, pathname, router, urlDesignSystemPageId])

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
  }, [designSystemPageId, mode, sectionId])

  function selectSection(nextSectionId: string) {
    if (nextSectionId === "sistema-de-diseno") {
      pendingRef.current = `ds:${DEFAULT_HANDBOOK_DESIGN_SYSTEM_PAGE}`
      setMode("design-system")
      setDesignSystemPageId(DEFAULT_HANDBOOK_DESIGN_SYSTEM_PAGE)
      return
    }

    if (nextSectionId === sectionId && mode === "handbook") return
    pendingRef.current = `hb:${nextSectionId}`
    setMode("handbook")
    setSectionId(nextSectionId)
  }

  function selectDesignSystemPage(nextPageId: string) {
    if (nextPageId === designSystemPageId && mode === "design-system") return
    pendingRef.current = `ds:${nextPageId}`
    setMode("design-system")
    setDesignSystemPageId(nextPageId)
  }

  const isDesignSystem = mode === "design-system"
  const activeDesignSystemPageId = isHandbookDesignSystemPageId(designSystemPageId)
    ? designSystemPageId
    : DEFAULT_HANDBOOK_DESIGN_SYSTEM_PAGE
  const handbookReady = isValidHandbookSection(sectionId) && sectionId !== "sistema-de-diseno"

  if (!isDesignSystem && !handbookReady) {
    return null
  }

  const activeGroup = isDesignSystem
    ? getHandbookDesignSystemNavGroup(activeDesignSystemPageId)
    : getHandbookNavGroup(sectionId)
  const designSystemMeta = isDesignSystem
    ? getHandbookDesignSystemPageMeta(activeDesignSystemPageId)
    : undefined
  const isPatternsPage = isDesignSystem && activeDesignSystemPageId === "patrones"

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <HandbookSidebar
        activeSectionId={sectionId}
        designSystemPageId={activeDesignSystemPageId}
        isDesignSystem={isDesignSystem}
        onSelectSection={selectSection}
        onSelectDesignSystemPage={selectDesignSystemPage}
      />

      <div
        ref={contentRef}
        className={cn(
          "handbook-content min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10",
          libraryContentAreaClass,
          libraryScrollLightClass,
        )}
      >
        <div
          className={cn(
            "mx-auto w-full space-y-8",
            isPatternsPage ? "max-w-none" : "max-w-5xl",
          )}
        >
          <HandbookMobileNav
            activeSectionId={sectionId}
            designSystemPageId={activeDesignSystemPageId}
            isDesignSystem={isDesignSystem}
            onSelectSection={selectSection}
            onSelectDesignSystemPage={selectDesignSystemPage}
          />

          {isDesignSystem ? (
            <p className={cn("text-xs font-bold uppercase", libraryContentEyebrowClass)}>
              {activeGroup?.label || "Sistema de diseño"}
            </p>
          ) : activeGroup ? (
            <p className={cn("text-xs font-bold uppercase", libraryContentEyebrowClass)}>
              {activeGroup.label}
            </p>
          ) : null}

          {isDesignSystem && activeDesignSystemPageId === "color" ? (
            <HandbookColorView />
          ) : isDesignSystem && activeDesignSystemPageId === "tipografia" ? (
            <HandbookTypographyView />
          ) : isDesignSystem && activeDesignSystemPageId === "espaciado-y-proporciones" ? (
            <HandbookSpacingView />
          ) : isDesignSystem && activeDesignSystemPageId === "layout" ? (
            <HandbookLayoutView />
          ) : isDesignSystem && activeDesignSystemPageId === "superficies-y-profundidad" ? (
            <HandbookSurfacesView />
          ) : isDesignSystem && activeDesignSystemPageId === "borde" ? (
            <HandbookBorderView />
          ) : isDesignSystem && activeDesignSystemPageId === "radios" ? (
            <HandbookRadiusView />
          ) : isDesignSystem && activeDesignSystemPageId === "elevacion" ? (
            <HandbookElevationView />
          ) : isDesignSystem && activeDesignSystemPageId === "iconografia" ? (
            <HandbookIconographyView />
          ) : isDesignSystem && activeDesignSystemPageId === "logotipos" ? (
            <HandbookLogosView />
          ) : isDesignSystem && activeDesignSystemPageId === "movimiento" ? (
            <HandbookMotionView />
          ) : isDesignSystem && isHandbookComponentPageId(activeDesignSystemPageId) ? (
            <HandbookComponentsFinalView pageId={activeDesignSystemPageId} />
          ) : isDesignSystem && activeDesignSystemPageId === "patrones" ? (
            <HandbookPatternsView />
          ) : isDesignSystem ? (
            <HandbookSectionView meta={designSystemMeta} />
          ) : (
            <HandbookSectionView sectionId={sectionId} />
          )}
        </div>
      </div>
    </div>
  )
}
