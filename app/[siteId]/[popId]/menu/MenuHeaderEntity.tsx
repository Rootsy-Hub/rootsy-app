"use client"

import {
  menuFooterEntityBodyClass,
  menuFooterEntityVeilClass,
  menuHeaderEntityBodyClass,
  menuHeaderEntityBodyLuzClass,
  menuHeaderEntityBodySombraClass,
  menuHeaderEntityClass,
} from "@/app/[siteId]/[popId]/menu/menuHeaderEntityStyles"
import "@/app/[siteId]/[popId]/menu/menuHeaderEntity.css"
import {
  menuHeaderHeightClass,
  menuModuleHeaderHeightClass,
} from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import type { RootsButtonAtmosphere } from "@/components/rootsy-button/rootsButtonAtmosphere"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  /** home = 80px · module = 68px · dialog = alto por contenido. */
  size?: "home" | "module" | "dialog"
  /** header = éter · footer = suelo. */
  as?: "header" | "footer"
  /** Superficie del header. El footer no cambia. */
  atmosphere?: RootsButtonAtmosphere
  className?: string
}

function headerBodyClass(atmosphere: RootsButtonAtmosphere) {
  if (atmosphere === "sombra") return menuHeaderEntityBodySombraClass
  if (atmosphere === "bruma") return menuHeaderEntityBodyLuzClass
  return menuHeaderEntityBodyClass
}

/** Éter arriba, suelo abajo — el umbral del mundo Rootsy. */
export function MenuHeaderEntity({
  children,
  size = "home",
  as = "header",
  atmosphere = "eter",
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
    <Tag
      className={cn(menuHeaderEntityClass, className)}
      data-rootsy-atmosphere={isFooter ? "sombra" : atmosphere}
    >
      <div
        className={cn(
          isFooter ? menuFooterEntityBodyClass : headerBodyClass(atmosphere),
          !isFooter && !isDialog && "pt-[env(safe-area-inset-top)]",
          isFooter && !isDialog && "pb-[env(safe-area-inset-bottom)]",
        )}
      >
        {isFooter ? (
          <>
            <div aria-hidden className="menu-header-entity-core" />
            <div aria-hidden className="menu-header-entity-sky" />
            <div aria-hidden className={menuFooterEntityVeilClass} />
            <div aria-hidden className="menu-header-entity-weight" />
            <div aria-hidden className="menu-header-entity-edge" />
            <div aria-hidden className="menu-header-entity-soil" />
            <div aria-hidden className="menu-header-entity-horizon" />
          </>
        ) : (
          <>
            <div aria-hidden className="menu-header-entity-atmosphere" />
            {atmosphere === "sombra" ? (
              <div aria-hidden className="menu-header-entity-soil" />
            ) : null}
            <div aria-hidden className="menu-header-entity-horizon" />
            {isDialog ? null : (
              <div aria-hidden className="menu-header-entity-bridge" />
            )}
          </>
        )}
        <div className={cn(heightClass, "relative z-[1]")}>{children}</div>
      </div>
    </Tag>
  )
}
