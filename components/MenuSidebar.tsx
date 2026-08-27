"use client"

import "@/app/handbook/handbookAtmosphere.css"
import "@/components/statistics/statisticsNavRail.css"
import {
  libraryNavItemClass,
  libraryNavItemIconClass,
  libraryScrollDarkClass,
  librarySidebarClass,
  librarySidebarEyebrowClass,
} from "@/app/library/libraryColorTheme"
import {
  statisticsNavAsideClass,
  statisticsNavScrollClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import { PopLink as Link } from "@/lib/pop-spa/PopLink"
import type { ReactNode } from "react"

export type MenuSidebarCollapseBelow = "lg" | "md" | false
export type MenuSidebarLayout = "rail" | "strip"

export type MenuSidebarProps = {
  children: ReactNode
  backHref?: string
  backLabel?: string
  onBack?: () => void
  eyebrow?: string
  brand?: ReactNode
  className?: string
  scrollClassName?: string
  /** Si es false, el children llena el rail (catálogo de operar trae su propio scroll). */
  padded?: boolean
  /**
   * Ocultar bajo este breakpoint.
   * `false` = siempre visible (el caller puede esconderlo con className).
   */
  collapseBelow?: MenuSidebarCollapseBelow
  /** @deprecated Usar collapseBelow. */
  collapseBelowLg?: boolean
  /** `strip` = chips en mobile, sidecar en desktop (estadísticas / ajustes). */
  layout?: MenuSidebarLayout
  /** Si es false, el caller controla el ancho (rail colapsable de operar). */
  fixedWidth?: boolean
  id?: string
  "aria-label"?: string
  "aria-hidden"?: boolean
  inert?: boolean
}

/** Rail de navegación — chrome sombra compartido (handbook, librería, operar, estadísticas). */
export function MenuSidebar({
  children,
  backHref,
  backLabel = "Volver",
  onBack,
  eyebrow,
  brand,
  className,
  scrollClassName,
  padded = true,
  collapseBelow,
  collapseBelowLg,
  layout = "rail",
  fixedWidth = true,
  id,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
  inert,
}: MenuSidebarProps) {
  const isStrip = layout === "strip"
  const resolvedCollapse: MenuSidebarCollapseBelow = isStrip
    ? false
    : collapseBelow !== undefined
      ? collapseBelow
      : collapseBelowLg === false
        ? false
        : "lg"
  const useFixedWidth = isStrip ? false : fixedWidth

  return (
    <aside
      id={id}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      inert={inert}
      className={cn(
        "handbook-rail min-h-0 shrink-0 flex-col overflow-hidden",
        isStrip
          ? statisticsNavAsideClass
          : cn(
              "h-full border-r",
              resolvedCollapse === "lg" && "hidden lg:flex",
              resolvedCollapse === "md" && "hidden md:flex",
              resolvedCollapse === false && "flex",
              useFixedWidth && "w-64",
              librarySidebarClass,
            ),
        className,
      )}
    >
      <div
        className={cn(
          isStrip
            ? statisticsNavScrollClass
            : padded
              ? cn(
                  "min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4",
                  libraryScrollDarkClass,
                )
              : "flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden",
          scrollClassName,
        )}
      >
        {backHref ? (
          <Link
            href={backHref}
            scroll={false}
            className={cn(libraryNavItemClass, "mb-4")}
            onClick={onBack}
          >
            <ArrowLeft className={libraryNavItemIconClass} aria-hidden />
            <span>{backLabel}</span>
          </Link>
        ) : null}
        {brand}
        {eyebrow ? (
          <p className={cn("mb-4 px-2", librarySidebarEyebrowClass)}>{eyebrow}</p>
        ) : null}
        {children}
      </div>
    </aside>
  )
}
