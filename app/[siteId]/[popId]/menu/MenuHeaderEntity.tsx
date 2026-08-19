"use client"

import {
  menuFooterEntityBodyClass,
  menuFooterEntityVeilClass,
  menuHeaderEntityBodyClass,
  menuHeaderEntityClass,
  menuHeaderEntityVeilClass,
} from "@/app/[siteId]/[popId]/menu/menuHeaderEntityStyles"
import "@/app/[siteId]/[popId]/menu/menuHeaderEntity.css"
import {
  menuHeaderHeightClass,
  menuModuleHeaderHeightClass,
} from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  /** home = 80px · module = 68px, más aire para datos. */
  size?: "home" | "module"
  /** header = cielo · footer = tierra húmeda. */
  as?: "header" | "footer"
}

/** Cielo arriba, tierra abajo — el umbral del mundo Rootsy. */
export function MenuHeaderEntity({
  children,
  size = "home",
  as = "header",
}: Props) {
  const Tag = as
  const isFooter = as === "footer"
  const heightClass =
    size === "module" ? menuModuleHeaderHeightClass : menuHeaderHeightClass

  return (
    <Tag className={menuHeaderEntityClass}>
      <div
        className={isFooter ? menuFooterEntityBodyClass : menuHeaderEntityBodyClass}
      >
        <div aria-hidden className="menu-header-entity-core" />
        <div aria-hidden className="menu-header-entity-sky" />
        <div
          aria-hidden
          className={isFooter ? menuFooterEntityVeilClass : menuHeaderEntityVeilClass}
        />
        <div aria-hidden className="menu-header-entity-weight" />
        <div aria-hidden className="menu-header-entity-edge" />
        {isFooter ? (
          <div aria-hidden className="menu-header-entity-soil" />
        ) : (
          <>
            <div aria-hidden className="menu-header-entity-stars" />
            <div aria-hidden className="menu-header-entity-stars--bright">
              <span className="menu-header-entity-star menu-header-entity-star--md" />
              <span className="menu-header-entity-star menu-header-entity-star--sm" />
              <span className="menu-header-entity-star menu-header-entity-star--md" />
              <span className="menu-header-entity-star menu-header-entity-star--sm" />
              <span className="menu-header-entity-star menu-header-entity-star--md" />
              <span className="menu-header-entity-star menu-header-entity-star--sm" />
              <span className="menu-header-entity-star menu-header-entity-star--md" />
            </div>
          </>
        )}
        <div aria-hidden className="menu-header-entity-horizon" />
        {isFooter ? null : <div aria-hidden className="menu-header-entity-bridge" />}
        <div className={cn(heightClass, "relative z-[1]")}>{children}</div>
      </div>
    </Tag>
  )
}
