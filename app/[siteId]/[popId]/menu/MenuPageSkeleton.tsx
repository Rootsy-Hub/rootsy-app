"use client"

import { MenuDormantDock } from "@/app/[siteId]/[popId]/menu/MenuDormantDock"
import { MenuDormantGrid } from "@/app/[siteId]/[popId]/menu/MenuDormantField"
import { MenuDormantFirmament } from "@/app/[siteId]/[popId]/menu/MenuDormantFirmament"
import { MenuDormantHeader } from "@/app/[siteId]/[popId]/menu/MenuDormantHeader"
import { MenuDormantNavigator } from "@/app/[siteId]/[popId]/menu/MenuDormantNavigator"
import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import { MenuOuterEntity } from "@/app/[siteId]/[popId]/menu/MenuOuterEntity"
import { menuNatureShellClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import "@/app/[siteId]/[popId]/menu/menuContentReveal.css"
import { cn } from "@/lib/utils"

/** Mismo fantasma que home — el menú aún no tiene datos. */
export function MenuPageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando menú"
      className={cn(
        menuNatureShellClass,
        "menu-firmament-settle fixed inset-0 flex flex-col overflow-hidden bg-background",
      )}
    >
      <MenuDormantFirmament />

      <MenuHeaderEntity>
        <MenuDormantHeader />
      </MenuHeaderEntity>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-14 sm:gap-16">
          <MenuDormantNavigator />
          <div className="w-full">
            <MenuDormantGrid />
          </div>
        </div>
      </div>

      <MenuOuterEntity variant="foot" floating className="pointer-events-none">
        <MenuDormantDock />
      </MenuOuterEntity>

      <span className="sr-only">Cargando menú…</span>
    </div>
  )
}
