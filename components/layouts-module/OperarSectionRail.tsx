"use client"

import "@/app/library/layouts/layoutsOperarTheme.css"
import {
  libraryNavItemIconClass,
  libraryNavItemLabelClass,
} from "@/app/library/libraryColorTheme"
import {
  layoutsOperarCatalogRailItemClass,
  layoutsOperarCatalogRailItemSelectedClass,
  layoutsOperarCatalogRailItemWithIconClass,
  layoutsOperarCatalogRailListClass,
  layoutsOperarCatalogRailListItemClass,
  layoutsOperarCatalogRailNavClass,
  layoutsOperarCatalogRailSectionGroupClass,
  layoutsOperarCatalogRailSectionGroupDividerClass,
  layoutsOperarCatalogRailSectionLabelClass,
  layoutsOperarModuleBodyClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { PopLink as Link } from "@/lib/pop-spa/PopLink"
import type { LucideIcon } from "lucide-react"
import { forwardRef, type MouseEvent, type ReactNode } from "react"

export type OperarSectionRailItem = {
  id: string
  label: string
  icon?: LucideIcon
  trailing?: ReactNode
  href?: string
}

export type OperarSectionRailGroup = {
  id: string
  label: string
  items: OperarSectionRailItem[]
}

type Props = {
  ariaLabel: string
  activeId: string
  onSelect?: (id: string) => void
  items?: OperarSectionRailItem[]
  groups?: OperarSectionRailGroup[]
  density?: "default" | "comfortable"
  /** El padre scrollea (sidecar de estadísticas / ajustes). */
  embedded?: boolean
  className?: string
  listClassName?: string
  listItemClassName?: string
  itemClassName?: string
}

function RailItem({
  item,
  active,
  onSelect,
  itemClassName,
}: {
  item: OperarSectionRailItem
  active: boolean
  onSelect?: (id: string) => void
  itemClassName?: string
}) {
  const Icon = item.icon
  const className = cn(
    layoutsOperarCatalogRailItemClass,
    Icon && layoutsOperarCatalogRailItemWithIconClass,
    active && layoutsOperarCatalogRailItemSelectedClass,
    itemClassName,
  )
  const content = (
    <>
      {Icon ? <Icon className={libraryNavItemIconClass} aria-hidden /> : null}
      <span className={libraryNavItemLabelClass}>{item.label}</span>
      {item.trailing}
    </>
  )

  if (item.href) {
    return (
      <Link
        href={item.href}
        scroll={false}
        aria-current={active ? "page" : undefined}
        aria-label={item.label}
        className={className}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          if (!onSelect) return
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
          ) {
            return
          }
          event.preventDefault()
          onSelect(item.id)
        }}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      onClick={() => onSelect?.(item.id)}
      className={className}
    >
      {content}
    </button>
  )
}

function RailList({
  items,
  activeId,
  onSelect,
  listClassName,
  listItemClassName,
  itemClassName,
}: {
  items: OperarSectionRailItem[]
  activeId: string
  onSelect?: (id: string) => void
  listClassName?: string
  listItemClassName?: string
  itemClassName?: string
}) {
  return (
    <ul className={cn(layoutsOperarCatalogRailListClass, listClassName)} role="list">
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(layoutsOperarCatalogRailListItemClass, listItemClassName)}
        >
          <RailItem
            item={item}
            active={item.id === activeId}
            onSelect={onSelect}
            itemClassName={itemClassName}
          />
        </li>
      ))}
    </ul>
  )
}

/** Rail de secciones — misma receta que el navbar de Vender. */
export const OperarSectionRail = forwardRef<HTMLElement, Props>(
  function OperarSectionRail(
    {
      ariaLabel,
      activeId,
      onSelect,
      items,
      groups,
      density = "default",
      embedded = false,
      className,
      listClassName,
      listItemClassName,
      itemClassName,
    },
    ref,
  ) {
    const comfortable = density === "comfortable"

    return (
      <nav
        ref={ref}
        className={cn(
          layoutsOperarModuleBodyClass,
          embedded ? "library-nav w-full min-w-0" : layoutsOperarCatalogRailNavClass,
          comfortable && "p-3 [&_button]:min-h-12 [&_button]:px-3 [&_button]:text-base",
          className,
        )}
        aria-label={ariaLabel}
      >
        {groups?.length ? (
          groups.map((group, groupIndex) => (
            <div
              key={group.id}
              className={cn(
                layoutsOperarCatalogRailSectionGroupClass,
                groupIndex > 0 && layoutsOperarCatalogRailSectionGroupDividerClass,
              )}
            >
              <p className={layoutsOperarCatalogRailSectionLabelClass}>{group.label}</p>
              <RailList
                items={group.items}
                activeId={activeId}
                onSelect={onSelect}
                listClassName={listClassName}
                listItemClassName={listItemClassName}
                itemClassName={itemClassName}
              />
            </div>
          ))
        ) : (
          <RailList
            items={items ?? []}
            activeId={activeId}
            onSelect={onSelect}
            listClassName={listClassName}
            listItemClassName={listItemClassName}
            itemClassName={itemClassName}
          />
        )}
      </nav>
    )
  },
)
