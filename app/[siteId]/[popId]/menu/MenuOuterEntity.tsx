"use client"

import {
  menuOuterEntityBeltClass,
  menuOuterEntityBeltContentClass,
  menuOuterEntityBodyClass,
  menuOuterEntityBodyFloatingClass,
  menuOuterEntityFootClass,
  menuOuterEntityFootContentClass,
  menuOuterEntityFootFloatingClass,
  menuOuterEntityFootFloatingChromeClass,
  menuOuterEntityFootFloatingContentClass,
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
  /** Solo para `foot` — flota sobre el planeta sin reservar altura. */
  floating?: boolean
  children: ReactNode
  className?: string
  contentClassName?: string
}

function MenuOuterEntityAtmosphere({
  withHorizon = true,
}: {
  withHorizon?: boolean
}) {
  return (
    <>
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
      {withHorizon ? (
        <div aria-hidden className="menu-outer-entity-horizon" />
      ) : null}
    </>
  )
}

/** Banda del universo exterior — cinturón de mundos o base del dock. */
export function MenuOuterEntity({
  variant,
  floating = false,
  children,
  className,
  contentClassName,
}: Props) {
  const lifeStyle = menuPlanetLifeStyle(
    floating ? "menu-outer-foot-float" : `menu-outer-${variant}`,
  )
  const isFloatingFoot = variant === "foot" && floating

  const shellClass =
    variant === "belt"
      ? menuOuterEntityBeltClass
      : isFloatingFoot
        ? menuOuterEntityFootFloatingClass
        : menuOuterEntityFootClass

  const bodyClass = isFloatingFoot
    ? menuOuterEntityBodyFloatingClass
    : menuOuterEntityBodyClass

  const contentClass =
    variant === "belt"
      ? menuOuterEntityBeltContentClass
      : isFloatingFoot
        ? menuOuterEntityFootFloatingContentClass
        : menuOuterEntityFootContentClass

  return (
    <div className={cn(shellClass, className)}>
      {variant === "foot" && !floating ? (
        <div aria-hidden className="menu-outer-entity-bridge--up" />
      ) : null}

      <div className={bodyClass} style={lifeStyle}>
        {isFloatingFoot ? (
          <div aria-hidden className={menuOuterEntityFootFloatingChromeClass}>
            <MenuOuterEntityAtmosphere withHorizon={false} />
          </div>
        ) : (
          <MenuOuterEntityAtmosphere />
        )}
        <div className={cn(contentClass, contentClassName)}>{children}</div>
      </div>

      {variant === "belt" ? (
        <div aria-hidden className="menu-outer-entity-bridge--down" />
      ) : null}
    </div>
  )
}
