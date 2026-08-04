"use client"

import { COLOR_LIBRARY_ITEMS } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import { isColorLibrarySection } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import Link from "next/link"
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
      {
        id: "colors-group",
        label: "Color",
        children: [...COLOR_LIBRARY_ITEMS],
      },
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
      { id: "modals", label: "Modales" },
      { id: "modals-alert", label: "Alert dialog" },
    ],
  },
]

export const DEFAULT_LIBRARY_SECTION = "colors"

export const LIBRARY_SECTION_IDS = LIBRARY_NAV_GROUPS.flatMap((group) =>
  group.items.flatMap((item) =>
    item.children?.length
      ? item.children.map((child) => child.id)
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
  if (isColorLibrarySection(sectionId)) {
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
        "block rounded-lg py-1.5 text-sm transition-colors",
        nested ? "pl-6 pr-2" : "px-2",
        isActive
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
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
          <p className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {group.label}
          </p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              if (item.children?.length) {
                const colorGroupActive = item.children.some(
                  (child) => child.id === activeSectionId,
                )
                return (
                  <li key={item.id}>
                    <p
                      className={cn(
                        "px-2 py-1.5 text-sm font-medium",
                        colorGroupActive
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </p>
                    <ul className="space-y-0.5">
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
                  </li>
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
    <header className="rounded-2xl border border-border/70 bg-card px-5 py-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              Design system
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              rootsy-app-light
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
        "rounded-2xl border border-border/70 bg-card p-4 shadow-sm",
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
