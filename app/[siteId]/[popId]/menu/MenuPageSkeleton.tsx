"use client"

import {
  MENU_DORMANT_SECTIONS,
  MenuDormantGrid,
} from "@/app/[siteId]/[popId]/menu/MenuDormantField"
import { MenuDormantDock } from "@/app/[siteId]/[popId]/menu/MenuDormantDock"
import { MenuDormantFirmament } from "@/app/[siteId]/[popId]/menu/MenuDormantFirmament"
import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import { MenuOuterEntity } from "@/app/[siteId]/[popId]/menu/MenuOuterEntity"
import { MenuRootsyPresence } from "@/app/[siteId]/[popId]/menu/MenuRootsyPresence"
import { MenuSectionNavigator } from "@/app/[siteId]/[popId]/menu/MenuSectionNavigator"
import { menuHeaderRowClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { menuNatureShellClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import "@/app/[siteId]/[popId]/menu/menuContentReveal.css"
import { RootsIconButton } from "@/components/rootsy-button"
import {
  menuSearchFieldIdleClass,
  menuSearchInputClass,
  menuSearchShellClass,
} from "@/app/[siteId]/[popId]/menu/menuSearchFieldStyles"
import { cn } from "@/lib/utils"
import { HelpCircle, Home, Search } from "lucide-react"

/** Mismo firmamento dormido que el menú — universo en reposo hasta hidratar. */
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
          </div>

          <div className="w-full justify-self-center">
            <div className={menuSearchShellClass}>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40"
                aria-hidden
              />
              <input
                readOnly
                tabIndex={-1}
                aria-hidden
                placeholder="Buscar..."
                className={cn(
                  menuSearchInputClass,
                  menuSearchFieldIdleClass,
                  "pointer-events-none",
                )}
              />
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-6 opacity-60">
            <span className="text-lg tabular-nums text-white/70">--:--</span>
          </div>
        </div>
      </MenuHeaderEntity>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-14 sm:gap-16">
          <MenuSectionNavigator
            className="pointer-events-none"
            sections={[...MENU_DORMANT_SECTIONS]}
            selectedIndex={0}
            onSelect={() => {}}
            dormant
          />
          <div className="w-full">
            <MenuDormantGrid />
          </div>
        </div>
      </div>

      <MenuOuterEntity variant="foot" floating className="pointer-events-none">
        <MenuDormantDock />
      </MenuOuterEntity>

      <MenuRootsyPresence
        sectionKey="operar"
        sectionTitle="Operar"
        siteId=""
        popId=""
        popAccess={null}
        disabled
      />

      <RootsIconButton
        type="button"
        tone="ghost"
        surface="dark"
        size="large"
        label="Ayuda"
        className="absolute bottom-4 right-4 z-30 rounded-full opacity-70"
      >
        <HelpCircle aria-hidden />
      </RootsIconButton>

      <span className="sr-only">Cargando menú…</span>
    </div>
  )
}
