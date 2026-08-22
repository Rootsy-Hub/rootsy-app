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
  /** home = 80px · module = 68px · dialog = alto por contenido. */
  size?: "home" | "module" | "dialog"
  /** header = éter · footer = suelo. */
  as?: "header" | "footer"
  className?: string
}

/** Éter arriba, suelo abajo — el umbral del mundo Rootsy. */
export function MenuHeaderEntity({
  children,
  size = "home",
  as = "header",
  className,
}: Props) {
  const Tag = as
  const isFooter = as === "footer"
  const isDialog = size === "dialog"
  const heightClass =
    isDialog
      ? "min-h-0 w-full"
      : size === "module"
        ? menuModuleHeaderHeightClass
        : menuHeaderHeightClass

  return (
    <Tag className={cn(menuHeaderEntityClass, className)}>
      <div
        className={cn(
          isFooter ? menuFooterEntityBodyClass : menuHeaderEntityBodyClass,
          !isFooter && !isDialog && "pt-[env(safe-area-inset-top)]",
          isFooter && !isDialog && "pb-[env(safe-area-inset-bottom)]",
        )}
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
        {isFooter || isDialog ? null : (
          <div aria-hidden className="menu-header-entity-bridge" />
        )}
        <div className={cn(heightClass, "relative z-[1]")}>{children}</div>
      </div>
    </Tag>
  )
}
