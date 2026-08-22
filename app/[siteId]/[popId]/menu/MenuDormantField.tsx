import { menuGhostBarClass, menuGhostTileClass } from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import {
  menuPlanetGridClass,
  menuPlanetIconShellClass,
  menuPlanetTileClass,
} from "@/app/[siteId]/[popId]/menu/menuPlanetGridStyles"
import { cn } from "@/lib/utils"

const DORMANT_TILE_COUNT = 12

function MenuGridItemGhost() {
  return (
    <div
      aria-hidden
      className={cn(menuPlanetTileClass, "justify-self-center")}
    >
      <div className={cn(menuPlanetIconShellClass, menuGhostTileClass)} />
      <span className={cn(menuGhostBarClass, "h-3 w-[3.25rem]")} />
    </div>
  )
}

export function MenuDormantGrid() {
  return (
    <div className="w-full px-4 md:px-8" aria-hidden>
      <div className={menuPlanetGridClass}>
        {Array.from({ length: DORMANT_TILE_COUNT }, (_, index) => (
          <MenuGridItemGhost key={index} />
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
