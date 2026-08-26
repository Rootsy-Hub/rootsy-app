"use client"

import {
  HANDBOOK_DESIGN_SYSTEM_NAV,
  handbookDesignSystemHref,
} from "@/app/handbook/handbookDesignSystem"
import {
  libraryNavGroupClass,
  libraryNavGroupLabelClass,
  libraryNavItemActiveClass,
  libraryNavItemClass,
  libraryNavItemLabelClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import Link from "next/link"

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
