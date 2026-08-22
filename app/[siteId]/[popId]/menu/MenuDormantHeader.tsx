"use client"

import { menuHeaderRowClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import {
  menuGhostBarClass,
  menuGhostCircleClass,
  menuGhostTileClass,
} from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import { EterIconButton } from "@/components/eter/EterIconButton"
import { eterHeaderDividerClass } from "@/lib/eter/eterChrome"
import { cn } from "@/lib/utils"
import { Home } from "lucide-react"

const dormantSearchGhostClass = cn(
  "pointer-events-none flex h-10 items-center rounded-xl",
  "border border-white/10 bg-white/6",
)

/** Header en fantasma — solo el atajo a home es real. */
export function MenuDormantHeader() {
  return (
    <>
      <div className="flex h-full min-w-0 items-center gap-2 px-3 md:hidden">
        <EterIconButton href="/home" size="default" label="Ir al inicio">
          <Home aria-hidden />
        </EterIconButton>
        <div className={cn("size-9 shrink-0 rounded-lg", menuGhostTileClass)} />
        <span className={cn(menuGhostBarClass, "h-3.5 w-24")} />
        <div className="ml-auto flex items-center gap-2">
          <span className={cn("size-9 rounded-xl", menuGhostTileClass)} />
          <span className={cn("size-10 rounded-full", menuGhostCircleClass)} />
        </div>
      </div>

      <div className={cn(menuHeaderRowClass, "hidden md:grid")}>
        <div className="flex min-w-0 items-center gap-6">
          <EterIconButton href="/home" size="large" label="Ir al inicio">
            <Home aria-hidden />
          </EterIconButton>

          <div className="flex min-w-0 items-center gap-3">
            <div className={cn("size-12 shrink-0 rounded-lg", menuGhostTileClass)} />
            <div className="min-w-0">
              <span className={cn(menuGhostBarClass, "mb-1 block h-3.5 w-24")} />
              <span className={cn(menuGhostBarClass, "block h-2.5 w-32")} />
            </div>
          </div>
        </div>

        <div className="w-full justify-self-center">
          <div className={dormantSearchGhostClass}>
            <span className={cn("ml-4 size-4 shrink-0", menuGhostCircleClass)} />
            <span className={cn(menuGhostBarClass, "ml-3 h-3.5 w-24")} />
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-6">
          <span className={cn("size-9 rounded-xl", menuGhostTileClass)} />
          <span className={cn("h-6 w-px", eterHeaderDividerClass)} />
          <div className="flex flex-col items-end gap-1.5">
            <span className={cn(menuGhostBarClass, "h-5 w-14")} />
            <span className={cn(menuGhostBarClass, "h-3 w-20")} />
          </div>
          <span className={cn("h-6 w-px", eterHeaderDividerClass)} />
          <div className="flex items-center gap-3">
            <div className="hidden flex-col items-end gap-1.5 sm:flex">
              <span className={cn(menuGhostBarClass, "h-3.5 w-24")} />
              <span className={cn(menuGhostBarClass, "h-2.5 w-16")} />
            </div>
            <span className={cn("size-10 rounded-full", menuGhostCircleClass)} />
          </div>
        </div>
      </div>
    </>
  )
}
