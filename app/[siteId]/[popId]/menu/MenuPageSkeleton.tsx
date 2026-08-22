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

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <div className="flex flex-col items-center justify-start gap-3 py-2 pb-[calc(7.25rem+env(safe-area-inset-bottom))] sm:gap-8 md:min-h-full md:flex-1 md:justify-center md:gap-14 md:py-0 md:pb-8">
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
