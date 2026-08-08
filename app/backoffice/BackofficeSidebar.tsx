"use client"

import { BACKOFFICE_NAV } from "@/app/backoffice/backofficeNav"
import {
  libraryNavGroupLabelClass,
  libraryNavItemActiveClass,
  libraryNavItemClass,
  libraryNavItemIconClass,
  libraryNavItemLabelClass,
  libraryScrollDarkClass,
  librarySidebarClass,
  librarySidebarEyebrowClass,
} from "@/app/[siteId]/[popId]/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      libraryNavItemClass,
                      active && libraryNavItemActiveClass,
                    )}
                  >
                    <Icon className={libraryNavItemIconClass} aria-hidden />
                    <span className={libraryNavItemLabelClass}>{item.label}</span>
                  </Link>
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
