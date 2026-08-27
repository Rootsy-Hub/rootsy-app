"use client"

import {
  HANDBOOK_DESIGN_SYSTEM_NAV,
  handbookDesignSystemHref,
} from "@/app/handbook/handbookDesignSystem"
import { getHandbookDesignSystemNavIcon } from "@/app/handbook/handbookNavIcons"
import {
  libraryNavGroupClass,
  libraryNavGroupLabelClass,
  libraryNavItemActiveClass,
  libraryNavItemClass,
  libraryNavItemIconClass,
  libraryNavItemLabelClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import Link from "next/link"

/** Incluye el grupo Componentes-final (páginas *-final). */
export function HandbookDesignSystemNav({
  activePageId,
  onSelectPage,
}: {
  activePageId: string
  onSelectPage?: (pageId: string) => void
}) {
  return (
    <nav className="library-nav" aria-label="Sistema de diseño">
      {HANDBOOK_DESIGN_SYSTEM_NAV.map((group, groupIndex) => (
        <section
          key={group.id}
          className={cn(libraryNavGroupClass, groupIndex > 0 && "library-nav-group--separated")}
        >
          {group.label ? <h2 className={libraryNavGroupLabelClass}>{group.label}</h2> : null}
          <ul className="library-nav-list">
            {group.items.map((item) => {
              const isActive = item.id === activePageId
              const Icon = getHandbookDesignSystemNavIcon(item.id)
              return (
                <li key={item.id}>
                  <Link
                    href={handbookDesignSystemHref(item.id)}
                    scroll={false}
                    prefetch
                    aria-current={isActive ? "page" : undefined}
                    className={cn(libraryNavItemClass, isActive && libraryNavItemActiveClass)}
                    onClick={() => onSelectPage?.(item.id)}
                  >
                    {Icon ? <Icon className={libraryNavItemIconClass} aria-hidden /> : null}
                    <span className={libraryNavItemLabelClass}>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </nav>
  )
}
