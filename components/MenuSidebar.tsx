"use client"

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
import type { ReactNode } from "react"

export type MenuSidebarProps = {
  children: ReactNode
  backHref?: string
  backLabel?: string
  onBack?: () => void
  eyebrow?: string
  brand?: ReactNode
  className?: string
  /** Si es false, el rail se ve en cualquier ancho (catálogo). */
  collapseBelowLg?: boolean
}

/** Rail de navegación — el mismo chrome del handbook a la izquierda. */
export function MenuSidebar({
  children,
  backHref,
  backLabel = "Volver",
  onBack,
  eyebrow,
  brand,
  className,
  collapseBelowLg = true,
}: MenuSidebarProps) {
  return (
    <aside
      className={cn(
        "handbook-rail h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r",
        collapseBelowLg ? "hidden lg:flex" : "flex",
        librarySidebarClass,
        className,
      )}
    >
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4",
          libraryScrollDarkClass,
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
