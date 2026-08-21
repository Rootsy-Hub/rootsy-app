import { menuGhostBarClass, menuGhostTileClass } from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import { cn } from "@/lib/utils"

const DORMANT_TILE_COUNT = 12

function MenuGridItemGhost() {
  return (
    <div
      aria-hidden
      className="flex h-[7.125rem] w-24 flex-col items-center gap-2.5 justify-self-center"
    >
      <div className={cn("size-[72px] rounded-[20px]", menuGhostTileClass)} />
      <span className={cn(menuGhostBarClass, "h-3 w-[3.25rem]")} />
    </div>
  )
}

export function MenuDormantGrid() {
  return (
    <div className="w-full px-8" aria-hidden>
      <div className="mx-auto grid min-h-[280px] max-w-4xl grid-cols-6 gap-x-0 gap-y-8 px-6 pb-6 pt-2">
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
