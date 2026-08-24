"use client"

import {
  CONCEPT_LIBRARY_ROOT,
} from "@/app/library/concept/conceptLibraryNav"
import { isConceptLibrarySection } from "@/app/library/concept/conceptLibraryNav"
import {
  COLOR_NEW_LIBRARY_ROOT,
  COLOR_NEW_LIBRARY_SUBITEMS,
} from "@/app/library/color/colorNewLibraryNav"
import { isColorNewLibrarySection } from "@/app/library/color/colorNewLibraryNav"
import { MUNDOS_LIBRARY_ROOT } from "@/app/library/mundos/mundosLibraryNav"
import { isMundosLibrarySection } from "@/app/library/mundos/mundosLibraryNav"
import { SPACING_LIBRARY_ROOT, SPACING_LIBRARY_SUBITEMS } from "@/app/library/spacing/spacingLibraryNav"
import { isSpacingLibrarySection } from "@/app/library/spacing/spacingLibraryNav"
import { GRID_LIBRARY_ROOT, GRID_LIBRARY_SUBITEMS } from "@/app/library/grid/gridLibraryNav"
import { isGridLibrarySection } from "@/app/library/grid/gridLibraryNav"
import { TYPOGRAPHY_LIBRARY_ROOT, TYPOGRAPHY_LIBRARY_SUBITEMS } from "@/app/library/typography/typographyLibraryNav"
import { isTypographyLibrarySection } from "@/app/library/typography/typographyLibraryNav"
import { MOTION_LIBRARY_ROOT, MOTION_LIBRARY_SUBITEMS } from "@/app/library/motion/motionLibraryNav"
import { isMotionLibrarySection } from "@/app/library/motion/motionLibraryNav"
import { ICONOGRAPHY_LIBRARY_ROOT } from "@/app/library/iconography/iconographyLibraryNav"
import { isIconographyLibrarySection } from "@/app/library/iconography/iconographyLibraryNav"
import { ILLUSTRATIONS_LIBRARY_ROOT } from "@/app/library/illustrations/illustrationsLibraryNav"
import { isIllustrationsLibrarySection } from "@/app/library/illustrations/illustrationsLibraryNav"
import { LOGOS_LIBRARY_ROOT } from "@/app/library/logos/logosLibraryNav"
import { isLogosLibrarySection } from "@/app/library/logos/logosLibraryNav"
import {
  ELEVATION_LIBRARY_ROOT,
  ELEVATION_LIBRARY_SUBITEMS,
} from "@/app/library/elevation/elevationLibraryNav"
import { isElevationLibrarySection } from "@/app/library/elevation/elevationLibraryNav"
import { BORDER_LIBRARY_ROOT } from "@/app/library/border/borderLibraryNav"
import { isBorderLibrarySection } from "@/app/library/border/borderLibraryNav"
import { RADIUS_LIBRARY_ROOT } from "@/app/library/radius/radiusLibraryNav"
import { isRadiusLibrarySection } from "@/app/library/radius/radiusLibraryNav"
import {
  LAYOUTS_LIBRARY_SUBITEMS,
} from "@/app/library/layouts/layoutsLibraryNav"
import { isLayoutsLibrarySection } from "@/app/library/layouts/layoutsLibraryNav"
import {
  UI_COMPONENTS_LIBRARY_ROOT,
  UI_COMPONENTS_LIBRARY_SUBITEMS,
  isUiComponentsLibrarySection,
} from "@/app/library/ui-components/uiComponentsLibraryNav"
import {
  TEXT_COMPONENT_LIBRARY_ROOT,
  TEXT_COMPONENT_LIBRARY_SUBITEMS,
} from "@/app/library/text-component/textComponentLibraryNav"
import {
  libraryNavGroupClass,
  libraryNavGroupLabelClass,
  libraryNavItemActiveClass,
  libraryNavItemClass,
  libraryNavItemIconClass,
  libraryNavItemLabelClass,
  libraryNavItemNestedClass,
  libraryNavNestedListClass,
  libraryNavToggleClass,
  libraryPageHeaderBadgeClass,
  libraryPageHeaderClass,
  libraryPageHeaderMonoClass,
  libraryDocMetaLabelClass,
  libraryDocPageDescriptionClass,
  libraryDocPageTitleClass,
  libraryDocSectionDescriptionClass,
  libraryDocSectionTitleClass,
} from "@/app/library/libraryColorTheme"
import { getLibraryNavIcon } from "@/app/library/libraryNavIcons"
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
      { ...MUNDOS_LIBRARY_ROOT },
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
      {
        ...UI_COMPONENTS_LIBRARY_ROOT,
        children: [...UI_COMPONENTS_LIBRARY_SUBITEMS],
      },
    ],
  },
  {
    id: "components",
    label: "Componentes",
    items: [
      {
        ...TEXT_COMPONENT_LIBRARY_ROOT,
        children: [...TEXT_COMPONENT_LIBRARY_SUBITEMS],
      },
      { id: "buttons", label: "Botones" },
      { id: "formulario", label: "Formulario" },
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
    items: [...LAYOUTS_LIBRARY_SUBITEMS],
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

export function librarySectionHref(sectionId: string): string {
  return `/library/${sectionId}`
}

export function libraryHomeHref(): string {
  return librarySectionHref(DEFAULT_LIBRARY_SECTION)
}

export function getLibraryNavGroup(sectionId: string): LibraryNavGroup | undefined {
  if (
    isConceptLibrarySection(sectionId) ||
    isColorNewLibrarySection(sectionId) ||
    isMundosLibrarySection(sectionId) ||
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
    isUiComponentsLibrarySection(sectionId) ||
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

function NavItemIcon({ sectionId }: { sectionId: string }) {
  const Icon = getLibraryNavIcon(sectionId)
  if (!Icon) return null
  return <Icon className={libraryNavItemIconClass} aria-hidden />
}

function NavLink({
  item,
  activeSectionId,
  nested = false,
}: {
  item: LibraryNavItem
  activeSectionId: string
  nested?: boolean
}) {
  const isActive = item.id === activeSectionId
  return (
    <Link
      href={librarySectionHref(item.id)}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        libraryNavItemClass,
        nested && libraryNavItemNestedClass,
        isActive && libraryNavItemActiveClass,
      )}
    >
      {!nested ? <NavItemIcon sectionId={item.id} /> : null}
      <span className={libraryNavItemLabelClass}>{item.label}</span>
    </Link>
  )
}

function NavAccordionGroup({
  item,
  activeSectionId,
}: {
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
    <li className="library-nav-accordion">
      <div className="library-nav-accordion-row">
        <Link
          href={librarySectionHref(item.id)}
          aria-current={isRootActive ? "page" : undefined}
          className={cn(
            libraryNavItemClass,
            "min-w-0 flex-1",
            isRootActive && libraryNavItemActiveClass,
          )}
        >
          <NavItemIcon sectionId={item.id} />
          <span className={libraryNavItemLabelClass}>{item.label}</span>
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? `Contraer ${item.label}` : `Expandir ${item.label}`}
          onClick={() => setOpen((prev) => !prev)}
          className={libraryNavToggleClass}
        >
          <ChevronRight
            className={cn("library-nav-chevron size-4", open && "library-nav-chevron--open")}
            aria-hidden
          />
        </button>
      </div>
      {open ? (
        <ul className={libraryNavNestedListClass}>
          {item.children.map((child) => (
            <li key={child.id}>
              <NavLink
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

export function LibraryNav({
  activeSectionId,
  className,
}: {
  activeSectionId: string
  className?: string
}) {
  return (
    <nav className={cn("library-nav", className)} aria-label="Secciones de la librería">
      {LIBRARY_NAV_GROUPS.map((group, groupIndex) => (
        <section
          key={group.id}
          className={cn(libraryNavGroupClass, groupIndex > 0 && "library-nav-group--separated")}
        >
          <h2 className={libraryNavGroupLabelClass}>{group.label}</h2>
          <ul className="library-nav-list">
            {group.items.map((item) => {
              if (item.children?.length) {
                return (
                  <NavAccordionGroup
                    key={item.id}
                    item={item as LibraryNavItem & { children: LibraryNavItem[] }}
                    activeSectionId={activeSectionId}
                  />
                )
              }

              return (
                <li key={item.id}>
                  <NavLink
                    item={item}
                    activeSectionId={activeSectionId}
                  />
                </li>
              )
            })}
          </ul>
        </section>
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
    <header className={cn("rounded-2xl border px-5 py-5", libraryPageHeaderClass)}>
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
              rootsy-library · sombra/bruma
            </span>
          </div>
          <h1 className={libraryDocPageTitleClass}>
            {title}
          </h1>
          <p className={libraryDocPageDescriptionClass}>
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
        <h2 className={libraryDocPageTitleClass}>
          {title}
        </h2>
        {description ? (
          <p className={cn("mt-1", libraryDocSectionDescriptionClass)}>
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
        "library-spec-card rounded-2xl border p-4",
        className,
      )}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">{title}</h3>
          <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--rootsy-bruma-500)]">
            {source}
          </p>
        </div>
        {tokens?.length ? (
          <div className="flex max-w-[55%] flex-wrap justify-end gap-1">
            {tokens.map((token) => (
              <span
                key={token}
                className="rounded-md bg-[var(--rootsy-bruma-50)] px-2 py-0.5 font-mono text-[10px] text-[var(--rootsy-bruma-500)]"
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
      <p className={libraryDocMetaLabelClass}>
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

export function LibraryFootnote({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] leading-relaxed text-[var(--rootsy-bruma-500)]">
      {children}
    </p>
  )
}
