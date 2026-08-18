"use client"

import {
  menuOuterEntityBeltClass,
  menuOuterEntityBeltContentClass,
  menuOuterEntityBodyClass,
  menuOuterEntityFootClass,
  menuOuterEntityFootContentClass,
  menuOuterEntityVeilClass,
} from "@/app/[siteId]/[popId]/menu/menuOuterEntityStyles"
import "@/app/[siteId]/[popId]/menu/menuOuterEntity.css"
import "@/app/[siteId]/[popId]/menu/menuPlanetLife.css"
import { menuPlanetLifeStyle } from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Variant = "belt" | "foot"

type Props = {
  variant: Variant
  children: ReactNode
  className?: string
  contentClassName?: string
}

/** Banda del universo exterior — cinturón de mundos o base del dock. */
export function MenuOuterEntity({
  variant,
  children,
  className,
  contentClassName,
}: Props) {
  const lifeStyle = menuPlanetLifeStyle(`menu-outer-${variant}`)
  const shellClass =
    variant === "belt" ? menuOuterEntityBeltClass : menuOuterEntityFootClass
  const contentClass =
    variant === "belt"
      ? menuOuterEntityBeltContentClass
      : menuOuterEntityFootContentClass

  return (
    <div className={cn(shellClass, className)}>
      {variant === "foot" ? (
        <div aria-hidden className="menu-outer-entity-bridge--up" />
      ) : null}

      <div className={menuOuterEntityBodyClass} style={lifeStyle}>
        <div aria-hidden className="menu-outer-entity-core" />
        <div aria-hidden className="menu-outer-entity-sky" />
        <div aria-hidden className={menuOuterEntityVeilClass} />
        <div aria-hidden className="menu-outer-entity-weight" />
        <div aria-hidden className="menu-outer-entity-edge" />
        <div aria-hidden className="menu-outer-entity-stars" />
        <div aria-hidden className="menu-outer-entity-stars--bright">
          <span className="menu-outer-entity-star menu-outer-entity-star--md" />
          <span className="menu-outer-entity-star menu-outer-entity-star--sm" />
          <span className="menu-outer-entity-star menu-outer-entity-star--md" />
          <span className="menu-outer-entity-star menu-outer-entity-star--sm" />
        </div>
        <div aria-hidden className="menu-outer-entity-horizon" />
        <div className={cn(contentClass, contentClassName)}>{children}</div>
      </div>

      {variant === "belt" ? (
        <div aria-hidden className="menu-outer-entity-bridge--down" />
      ) : null}
    </div>
  )
}
