"use client"

import {
  authPlanetEntityBodyClass,
  authPlanetEntityClass,
  authPlanetEntityContentClass,
  authPlanetEntityInnerClass,
  authPlanetEntityVeilClass,
} from "@/components/auth/authPlanetPanelStyles"
import "@/components/auth/authPlanetPanel.css"
import "@/app/[siteId]/[popId]/menu/menuPlanetLife.css"
import {
  menuPlanetCoreLifeStyle,
  menuPlanetLifeStyle,
} from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
}

const entityLifeStyle = menuPlanetLifeStyle("auth-planet-entity")
const entityCoreStyle = menuPlanetCoreLifeStyle("operar")

/** Portal holográfico — entidad con presencia propia en el planeta Rootsy. */
export function AuthPlanetEntity({ children, className }: Props) {
  return (
    <div className={cn(authPlanetEntityClass, className)}>
      <div aria-hidden className="auth-planet-entity-aura" />
      <div aria-hidden className="auth-planet-entity-presence" />

      <div className={authPlanetEntityBodyClass} style={entityLifeStyle}>
        <div aria-hidden className="auth-planet-entity-orbit" />
        <div aria-hidden className="auth-planet-entity-orbit auth-planet-entity-orbit--inner" />
        <div
          aria-hidden
          className="auth-planet-entity-core menu-planet-core-life"
          style={entityCoreStyle}
        />
        <div aria-hidden className="auth-planet-entity-sky" />
        <div aria-hidden className={authPlanetEntityVeilClass} />
        <div aria-hidden className="auth-planet-entity-weight" />
        <div aria-hidden className="auth-planet-entity-edge" />
        <div
          aria-hidden
          className="auth-planet-entity-nucleus menu-planet-core-life"
          style={entityCoreStyle}
        />
        <div aria-hidden className="auth-planet-entity-scan auth-planet-entity-scan--rim" />

        <div aria-hidden className="auth-planet-entity-corners">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div aria-hidden className="auth-planet-entity-particles">
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index} className="auth-planet-entity-particle" />
          ))}
        </div>

        <section className={authPlanetEntityContentClass}>
          <div aria-hidden className="auth-planet-entity-chamber">
            <div aria-hidden className="auth-planet-entity-stars" />
            <div aria-hidden className="auth-planet-entity-scan auth-planet-entity-scan--inner" />
          </div>
          <div className={authPlanetEntityInnerClass}>{children}</div>
        </section>
      </div>
    </div>
  )
}
