"use client"

import {
  menuHeaderEntityBodyClass,
  menuHeaderEntityClass,
  menuHeaderEntityVeilClass,
} from "@/app/[siteId]/[popId]/menu/menuHeaderEntityStyles"
import "@/app/[siteId]/[popId]/menu/menuHeaderEntity.css"
import "@/app/[siteId]/[popId]/menu/menuPlanetLife.css"
import { menuHeaderHeightClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { menuPlanetLifeStyle } from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

const headerLifeStyle = menuPlanetLifeStyle("menu-header-outer-space")

type Props = {
  children: ReactNode
}

/** Universo exterior — entidad neutra que se une al planeta en el umbral. */
export function MenuHeaderEntity({ children }: Props) {
  return (
    <header className={menuHeaderEntityClass}>
      <div className={menuHeaderEntityBodyClass} style={headerLifeStyle}>
        <div aria-hidden className="menu-header-entity-core" />
        <div aria-hidden className="menu-header-entity-sky" />
        <div aria-hidden className={menuHeaderEntityVeilClass} />
        <div aria-hidden className="menu-header-entity-weight" />
        <div aria-hidden className="menu-header-entity-edge" />
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
        <div aria-hidden className="menu-header-entity-horizon" />
        <div aria-hidden className="menu-header-entity-bridge" />
        <div className={cn(menuHeaderHeightClass, "relative z-[1]")}>{children}</div>
      </div>
    </header>
  )
}
