import { menuHeaderRowClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { menuSearchShellClass } from "@/app/[siteId]/[popId]/menu/menuSearchFieldStyles"
import {
  menuGhostBarClass,
  menuGhostCircleClass,
  menuGhostTileClass,
} from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import { RootsIconButton } from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import { Home } from "lucide-react"

/** Header en fantasma — solo el atajo a home es real. */
export function MenuDormantHeader() {
  return (
    <div className={menuHeaderRowClass}>
      <div className="flex min-w-0 items-center gap-6">
        <RootsIconButton
          href="/home"
          tone="ghost"
          surface="dark"
          size="large"
          label="Ir al inicio"
        >
          <Home aria-hidden />
        </RootsIconButton>

        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "size-12 shrink-0 rounded-lg",
              menuGhostTileClass,
            )}
          />
          <div className="min-w-0">
            <span className={cn(menuGhostBarClass, "mb-1 block h-3.5 w-24")} />
            <span className={cn(menuGhostBarClass, "block h-2.5 w-32")} />
          </div>
        </div>
      </div>

      <div className="w-full justify-self-center">
        <div
          className={cn(
            menuSearchShellClass,
            "pointer-events-none flex h-10 items-center",
          )}
        >
          <span className={cn("ml-4 size-4 shrink-0", menuGhostCircleClass)} />
          <span className={cn(menuGhostBarClass, "ml-3 h-3.5 w-24")} />
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-6">
        <span className={cn("size-9 rounded-xl", menuGhostTileClass)} />
        <span className="h-6 w-px bg-white/10" />
        <div className="flex flex-col items-end gap-1.5">
          <span className={cn(menuGhostBarClass, "h-5 w-14")} />
          <span className={cn(menuGhostBarClass, "h-3 w-20")} />
        </div>
        <span className="h-6 w-px bg-white/10" />
        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end gap-1.5 sm:flex">
            <span className={cn(menuGhostBarClass, "h-3.5 w-24")} />
            <span className={cn(menuGhostBarClass, "h-2.5 w-16")} />
          </div>
          <span className={cn("size-10 rounded-[34%]", menuGhostCircleClass)} />
        </div>
      </div>
    </div>
  )
}
