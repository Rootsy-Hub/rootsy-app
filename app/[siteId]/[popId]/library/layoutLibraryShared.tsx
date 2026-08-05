"use client"

import {
  CONCEPT_LIBRARY_ROOT,
} from "@/app/[siteId]/[popId]/library/concept/conceptLibraryNav"
import { isConceptLibrarySection } from "@/app/[siteId]/[popId]/library/concept/conceptLibraryNav"
import {
  COLOR_NEW_LIBRARY_ROOT,
  COLOR_NEW_LIBRARY_SUBITEMS,
} from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import { isColorNewLibrarySection } from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import { SPACING_LIBRARY_ROOT, SPACING_LIBRARY_SUBITEMS } from "@/app/[siteId]/[popId]/library/spacing/spacingLibraryNav"
import { isSpacingLibrarySection } from "@/app/[siteId]/[popId]/library/spacing/spacingLibraryNav"
import { GRID_LIBRARY_ROOT, GRID_LIBRARY_SUBITEMS } from "@/app/[siteId]/[popId]/library/grid/gridLibraryNav"
import { isGridLibrarySection } from "@/app/[siteId]/[popId]/library/grid/gridLibraryNav"
import { TYPOGRAPHY_LIBRARY_ROOT, TYPOGRAPHY_LIBRARY_SUBITEMS } from "@/app/[siteId]/[popId]/library/typography/typographyLibraryNav"
import { isTypographyLibrarySection } from "@/app/[siteId]/[popId]/library/typography/typographyLibraryNav"
import { MOTION_LIBRARY_ROOT, MOTION_LIBRARY_SUBITEMS } from "@/app/[siteId]/[popId]/library/motion/motionLibraryNav"
import { isMotionLibrarySection } from "@/app/[siteId]/[popId]/library/motion/motionLibraryNav"
import { ICONOGRAPHY_LIBRARY_ROOT } from "@/app/[siteId]/[popId]/library/iconography/iconographyLibraryNav"
import { isIconographyLibrarySection } from "@/app/[siteId]/[popId]/library/iconography/iconographyLibraryNav"
import { ILLUSTRATIONS_LIBRARY_ROOT } from "@/app/[siteId]/[popId]/library/illustrations/illustrationsLibraryNav"
import { isIllustrationsLibrarySection } from "@/app/[siteId]/[popId]/library/illustrations/illustrationsLibraryNav"
import { LOGOS_LIBRARY_ROOT } from "@/app/[siteId]/[popId]/library/logos/logosLibraryNav"
import { isLogosLibrarySection } from "@/app/[siteId]/[popId]/library/logos/logosLibraryNav"
import {
  ELEVATION_LIBRARY_ROOT,
  ELEVATION_LIBRARY_SUBITEMS,
} from "@/app/[siteId]/[popId]/library/elevation/elevationLibraryNav"
import { isElevationLibrarySection } from "@/app/[siteId]/[popId]/library/elevation/elevationLibraryNav"
import { BORDER_LIBRARY_ROOT } from "@/app/[siteId]/[popId]/library/border/borderLibraryNav"
import { isBorderLibrarySection } from "@/app/[siteId]/[popId]/library/border/borderLibraryNav"
import { RADIUS_LIBRARY_ROOT } from "@/app/[siteId]/[popId]/library/radius/radiusLibraryNav"
import { isRadiusLibrarySection } from "@/app/[siteId]/[popId]/library/radius/radiusLibraryNav"
import {
  LAYOUTS_LIBRARY_ROOT,
  LAYOUTS_LIBRARY_SUBITEMS,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsLibraryNav"
import { isLayoutsLibrarySection } from "@/app/[siteId]/[popId]/library/layouts/layoutsLibraryNav"
import {
  libraryNavGroupLabelClass,
  libraryNavLinkActiveClass,
  libraryNavLinkClass,
  libraryNavLinkParentActiveClass,
  libraryNavToggleClass,
  libraryPageHeaderBadgeClass,
  libraryPageHeaderClass,
  libraryPageHeaderMonoClass,
} from "@/app/[siteId]/[popId]/library/libraryColorTheme"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { ReactNode } from "react"

export type LibraryNavItem = {
  id: string
  label: string
  children?: LibraryNavItem[]
}

export type LibraryNavGroup = {
  id: string
  label: string
  items: LibraryNavItem[]
}

/** Navegación agrupada — orden de lectura de la librería. */
export const LIBRARY_NAV_GROUPS: LibraryNavGroup[] = [
  {
    id: "foundation",
    label: "Fundamentos",
    items: [
      { ...CONCEPT_LIBRARY_ROOT },
      {
        ...COLOR_NEW_LIBRARY_ROOT,
        children: [...COLOR_NEW_LIBRARY_SUBITEMS],
      },
      {
        ...SPACING_LIBRARY_ROOT,
        children: [...SPACING_LIBRARY_SUBITEMS],
      },
      {
        ...GRID_LIBRARY_ROOT,
        children: [...GRID_LIBRARY_SUBITEMS],
      },
      {
        ...TYPOGRAPHY_LIBRARY_ROOT,
        children: [...TYPOGRAPHY_LIBRARY_SUBITEMS],
      },
      {
        ...MOTION_LIBRARY_ROOT,
        children: [...MOTION_LIBRARY_SUBITEMS],
      },
      { ...ICONOGRAPHY_LIBRARY_ROOT },
      { ...ILLUSTRATIONS_LIBRARY_ROOT },
      { ...LOGOS_LIBRARY_ROOT },
      {
        ...ELEVATION_LIBRARY_ROOT,
        children: [...ELEVATION_LIBRARY_SUBITEMS],
      },
      { ...BORDER_LIBRARY_ROOT },
      { ...RADIUS_LIBRARY_ROOT },
    ],
  },
  {
    id: "forms",
    label: "Formulario",
    items: [
      { id: "labels", label: "Labels" },
      { id: "text", label: "Texto" },
      { id: "multiline", label: "Multilínea" },
      { id: "numeric", label: "Montos y cantidades" },
      { id: "select", label: "Select" },
      { id: "date", label: "Fecha" },
      { id: "boolean", label: "Booleanos" },
      { id: "field-help", label: "Ayuda de campo" },
      { id: "layout", label: "Layout" },
      { id: "composite", label: "Compuestos" },
    ],
  },
  {
    id: "components",
    label: "Componentes",
    items: [
      { id: "buttons", label: "Botones" },
      { id: "sortable-list", label: "Lista ordenable" },
      { id: "feedback", label: "Banners" },
    ],
  },
  {
    id: "overlays",
    label: "Overlays",
    items: [
      { id: "dropdown", label: "Dropdown" },
      { id: "modals", label: "Modales" },
      { id: "modals-alert", label: "Alert dialog" },
    ],
  },
  {
    id: "layouts",
    label: "Layouts",
    items: [
      {
        ...LAYOUTS_LIBRARY_ROOT,
        children: [...LAYOUTS_LIBRARY_SUBITEMS],
      },
    ],
  },
]

export const DEFAULT_LIBRARY_SECTION = "concept"

export const LIBRARY_SECTION_IDS = LIBRARY_NAV_GROUPS.flatMap((group) =>
  group.items.flatMap((item) =>
    item.children?.length
      ? [item.id, ...item.children.map((child) => child.id)]
      : [item.id],
  ),
)

export function isValidLibrarySection(sectionId: string): boolean {
  return LIBRARY_SECTION_IDS.includes(sectionId)
}

export function librarySectionHref(
  siteId: string,
  popId: string,
  sectionId: string,
): string {
  return popScopedHref(siteId, popId, `library/${sectionId}`)
}

export function libraryHomeHref(siteId: string, popId: string): string {
  return librarySectionHref(siteId, popId, DEFAULT_LIBRARY_SECTION)
}

export function getLibraryNavGroup(sectionId: string): LibraryNavGroup | undefined {
  if (
    isConceptLibrarySection(sectionId) ||
    isColorNewLibrarySection(sectionId) ||
    isSpacingLibrarySection(sectionId) ||
    isGridLibrarySection(sectionId) ||
    isTypographyLibrarySection(sectionId) ||
    isMotionLibrarySection(sectionId) ||
    isIconographyLibrarySection(sectionId) ||
    isIllustrationsLibrarySection(sectionId) ||
    isLogosLibrarySection(sectionId) ||
    isElevationLibrarySection(sectionId) ||
    isBorderLibrarySection(sectionId) ||
    isRadiusLibrarySection(sectionId) ||
    isLayoutsLibrarySection(sectionId)
  ) {
    if (isLayoutsLibrarySection(sectionId)) {
      return LIBRARY_NAV_GROUPS.find((group) => group.id === "layouts")
    }
    return LIBRARY_NAV_GROUPS.find((group) => group.id === "foundation")
  }
  return LIBRARY_NAV_GROUPS.find((group) =>
    group.items.some(
      (item) =>
        item.id === sectionId ||
        item.children?.some((child) => child.id === sectionId),
    ),
  )
}

function NavAccordionGroup({
  siteId,
  popId,
  item,
  activeSectionId,
}: {
  siteId: string
  popId: string
  item: LibraryNavItem & { children: LibraryNavItem[] }
  activeSectionId: string
}) {
  const isRootActive = item.id === activeSectionId
  const isChildActive = item.children.some((child) => child.id === activeSectionId)
  const isGroupActive = isRootActive || isChildActive
  const [open, setOpen] = useState(isGroupActive)

  useEffect(() => {
    if (isGroupActive) setOpen(true)
  }, [isGroupActive, activeSectionId])

  return (
    <li>
      <div className="flex items-stretch gap-0.5">
        <Link
          href={librarySectionHref(siteId, popId, item.id)}
          aria-current={isRootActive ? "page" : undefined}
          className={cn(
            "min-w-0 flex-1 py-1.5 pl-0 pr-1 text-sm",
            libraryNavLinkClass,
            isRootActive
              ? libraryNavLinkActiveClass
              : isGroupActive
                ? libraryNavLinkParentActiveClass
                : undefined,
          )}
        >
          {item.label}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? `Contraer ${item.label}` : `Expandir ${item.label}`}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "inline-flex shrink-0 items-center justify-center px-0.5 py-1.5",
            libraryNavToggleClass,
          )}
        >
          <ChevronRight
            className={cn("size-4 transition-transform duration-200", open && "rotate-90")}
          />
        </button>
      </div>
      {open ? (
        <ul className="mt-0.5 space-y-0.5">
          {item.children.map((child) => (
            <li key={child.id}>
              <NavLink
                siteId={siteId}
                popId={popId}
                item={child}
                activeSectionId={activeSectionId}
                nested
              />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function NavLink({
  siteId,
  popId,
  item,
  activeSectionId,
  nested = false,
}: {
  siteId: string
  popId: string
  item: LibraryNavItem
  activeSectionId: string
  nested?: boolean
}) {
  const isActive = item.id === activeSectionId
  return (
    <Link
      href={librarySectionHref(siteId, popId, item.id)}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "block py-1 text-sm",
        libraryNavLinkClass,
        nested ? "pl-3" : "pl-0",
        isActive && libraryNavLinkActiveClass,
      )}
    >
      {item.label}
    </Link>
  )
}

export function LibraryNav({
  siteId,
  popId,
  activeSectionId,
  className,
}: {
  siteId: string
  popId: string
  activeSectionId: string
  className?: string
}) {
  return (
    <nav className={cn("space-y-6", className)}>
      {LIBRARY_NAV_GROUPS.map((group) => (
        <div key={group.id}>
          <p className={cn("mb-2 px-0", libraryNavGroupLabelClass)}>
            {group.label}
          </p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              if (item.children?.length) {
                return (
                  <NavAccordionGroup
                    key={item.id}
                    siteId={siteId}
                    popId={popId}
                    item={item as LibraryNavItem & { children: LibraryNavItem[] }}
                    activeSectionId={activeSectionId}
                  />
                )
              }

              return (
                <li key={item.id}>
                  <NavLink
                    siteId={siteId}
                    popId={popId}
                    item={item}
                    activeSectionId={activeSectionId}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function LibraryPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <header className={cn("rounded-2xl border px-5 py-5 shadow-sm", libraryPageHeaderClass)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                libraryPageHeaderBadgeClass,
              )}
            >
              Design system
            </span>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 font-mono text-[10px]",
                libraryPageHeaderMonoClass,
              )}
            >
              rootsy-library · ceniza/bruma
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </header>
  )
}

export function LibrarySection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function SpecCard({
  title,
  source,
  tokens,
  children,
  className,
}: {
  title: string
  source: string
  tokens?: string[]
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm library-spec-card",
        className,
      )}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
            {source}
          </p>
        </div>
        {tokens?.length ? (
          <div className="flex max-w-[55%] flex-wrap justify-end gap-1">
            {tokens.map((token) => (
              <span
                key={token}
                className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {token}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function LibraryDemoRow({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

export function LibraryFootnote({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}
