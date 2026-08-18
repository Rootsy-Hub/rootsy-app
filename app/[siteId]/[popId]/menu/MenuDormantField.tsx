"use client"

import { MenuIconChrome } from "@/app/[siteId]/[popId]/menu/MenuIconChrome"
import "@/app/[siteId]/[popId]/menu/menuPlanetLife.css"
import {
  menuHoloIconShellForSection,
  menuHoloLabelDockPlacedClass,
  menuHoloPlanetLifeClass,
  menuHoloSectionForSkeletonIndex,
  menuPlanetLifeStyle,
} from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"

/** Planeta en reposo — mismo ser que el menú cargado, aún sin destino. */
export function MenuGridItemDormant({ index }: { index: number }) {
  const sectionKey = menuHoloSectionForSkeletonIndex(index)
  const lifeStyle = menuPlanetLifeStyle(`menu-dormant-${index}`)

  return (
    <div
      aria-hidden
      className="flex h-[7.125rem] w-24 flex-col items-center gap-2.5 justify-self-center"
    >
      <div className={menuHoloPlanetLifeClass} style={lifeStyle}>
        <div
          className={cn(
            "flex size-[72px] items-center justify-center rounded-[20px]",
            menuHoloIconShellForSection(sectionKey, "placed"),
          )}
        >
          <MenuIconChrome sectionKey={sectionKey} alive />
        </div>
      </div>
      <span
        className={cn(
          menuHoloLabelDockPlacedClass,
          "h-8 w-[3.25rem] max-w-full opacity-35",
        )}
      >
        {"\u00a0"}
      </span>
    </div>
  )
}

const DORMANT_TILE_COUNT = 12

export function MenuDormantGrid() {
  return (
    <div className="w-full px-8" aria-hidden>
      <div className="mx-auto grid min-h-[280px] max-w-4xl grid-cols-6 gap-x-0 gap-y-8 px-6 pb-6 pt-2">
        {Array.from({ length: DORMANT_TILE_COUNT }, (_, index) => (
          <MenuGridItemDormant key={index} index={index} />
        ))}
      </div>
    </div>
  )
}

export const MENU_DORMANT_SECTIONS = [
  { key: "operar", title: "Operar" },
  { key: "administrar", title: "Administrar" },
  { key: "configurar", title: "Configurar" },
] as const
