"use client"

import { BACKOFFICE_NAV, type BackofficeNavItem } from "@/app/backoffice/backofficeNav"
import {
  libraryNavGroupLabelClass,
  libraryNavItemActiveClass,
  libraryNavItemClass,
  libraryNavItemIconClass,
  libraryNavItemLabelClass,
  libraryNavItemNestedClass,
  libraryNavNestedListClass,
  libraryNavToggleClass,
  libraryScrollDarkClass,
  librarySidebarClass,
  librarySidebarEyebrowClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

function isNavActive(item: BackofficeNavItem, pathname: string): boolean {
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function NavLink({
  item,
  pathname,
  nested = false,
}: {
  item: BackofficeNavItem
  pathname: string
  nested?: boolean
}) {
  const active = pathname === item.href
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        libraryNavItemClass,
        nested && libraryNavItemNestedClass,
        active && libraryNavItemActiveClass,
      )}
    >
      {!nested ? <Icon className={libraryNavItemIconClass} aria-hidden /> : null}
      <span className={libraryNavItemLabelClass}>{item.label}</span>
    </Link>
  )
}

function NavAccordion({
  item,
  pathname,
}: {
  item: BackofficeNavItem & { children: BackofficeNavItem[] }
  pathname: string
}) {
  const childActive = item.children.some((child) => isNavActive(child, pathname))
  const rootActive = pathname === item.href
  const groupActive = rootActive || childActive
  const [open, setOpen] = useState(groupActive)

  useEffect(() => {
    if (groupActive) setOpen(true)
  }, [groupActive, pathname])

  const Icon = item.icon

  return (
    <li className="library-nav-accordion">
      <div className="library-nav-accordion-row">
        <Link
          href={item.href}
          aria-current={rootActive ? "page" : undefined}
          className={cn(
            libraryNavItemClass,
            "min-w-0 flex-1",
            rootActive && libraryNavItemActiveClass,
          )}
        >
          <Icon className={libraryNavItemIconClass} aria-hidden />
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
              <NavLink item={child} pathname={pathname} nested />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function BackofficeSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "hidden min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r lg:flex",
        librarySidebarClass,
      )}
    >
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4",
          libraryScrollDarkClass,
        )}
      >
        <p className={cn("px-2", librarySidebarEyebrowClass)}>Plataforma</p>
        <nav className="library-nav mt-4" aria-label="Backoffice">
          <ul className="library-nav-list" role="list">
            {BACKOFFICE_NAV.map((item) => {
              if (item.children?.length) {
                return (
                  <NavAccordion
                    key={item.id}
                    item={item as BackofficeNavItem & { children: BackofficeNavItem[] }}
                    pathname={pathname}
                  />
                )
              }

              return (
                <li key={item.id}>
                  <NavLink item={item} pathname={pathname} />
                </li>
              )
            })}
          </ul>
        </nav>
        <p className={cn("mt-8 px-2", libraryNavGroupLabelClass)}>
          Fundamentos Rootsy
        </p>
        <p className="mt-2 px-2 text-xs leading-relaxed text-[var(--library-nav-text)] opacity-80">
          Superficie bruma, nave sombra y foco savia — mismo lenguaje que la
          librería de diseño.
        </p>
      </div>
    </aside>
  )
}
