"use client"

import {
  HANDBOOK_V2_NAV,
  handbookV2Href,
} from "@/app/handbook/handbookV2"
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
import {
  Accessibility,
  Compass,
  Component,
  Layers,
  Palette,
  ShoppingCart,
  Sparkles,
  Type,
  Workflow,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

const HANDBOOK_V2_NAV_ICONS: Record<string, LucideIcon> = {
  overview: Compass,
  esencia: Sparkles,
  evolucion: Layers,
  fundamentos: Palette,
  tokens: Type,
  componentes: Component,
  patrones: Workflow,
  accesibilidad: Accessibility,
  vender: ShoppingCart,
  mejoras: Layers,
  extension: Workflow,
}

export function HandbookV2Nav({
  activePageId,
  onSelectPage,
}: {
  activePageId: string
  onSelectPage?: (pageId: string) => void
}) {
  return (
    <nav className="library-nav" aria-label="Sistema de diseño v2">
      {HANDBOOK_V2_NAV.map((group, groupIndex) => (
        <section
          key={group.id}
          className={cn(libraryNavGroupClass, groupIndex > 0 && "library-nav-group--separated")}
        >
          {group.label ? <h2 className={libraryNavGroupLabelClass}>{group.label}</h2> : null}
          <ul className="library-nav-list">
            {group.items.map((item) => {
              const isActive = item.id === activePageId
              const Icon =
                HANDBOOK_V2_NAV_ICONS[item.id] ?? getHandbookDesignSystemNavIcon(item.id)
              return (
                <li key={item.id}>
                  <Link
                    href={handbookV2Href(item.id)}
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
