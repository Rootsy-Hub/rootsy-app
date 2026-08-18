"use client"

import { MenuIconChrome } from "@/app/[siteId]/[popId]/menu/MenuIconChrome"
import { homePlanetHaloClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/[siteId]/[popId]/menu/menuPlanetLife.css"
import {
  menuHoloFloatLiftClass,
  menuHoloGlyphClass,
  menuHoloIconHoverForSection,
  menuHoloIconShellForSection,
  menuHoloPlanetLifeClass,
  menuPlanetLifeStyle,
} from "@/lib/menu/menuHoloStyles"
import type { MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"

type Props = {
  sectionKey: MenuSectionKey
  name: string
  imageUrl: string | null
  initials: string
  alive?: boolean
  solo?: boolean
}

/** Planeta POP — luz propia que dialoga con el firmamento. */
export function HomePopPlanetTile({
  sectionKey,
  name,
  imageUrl,
  initials,
  alive = true,
  solo = false,
}: Props) {
  const lifeStyle = menuPlanetLifeStyle(`home-${sectionKey}-${name}`)
  const shellVariant = alive ? "default" : "placed"

  return (
    <div className="relative flex flex-col items-center">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-700",
          solo ? "size-44 sm:size-52" : "size-36",
          homePlanetHaloClass(sectionKey),
          alive ? "opacity-95" : "opacity-45",
        )}
      />
      <div
        className={cn(alive && menuHoloPlanetLifeClass)}
        style={alive ? lifeStyle : undefined}
      >
        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden rounded-full",
            solo ? "size-32 sm:size-36" : "size-28",
            menuHoloIconShellForSection(sectionKey, shellVariant),
            alive && cn(menuHoloFloatLiftClass, menuHoloIconHoverForSection(sectionKey)),
          )}
        >
          <MenuIconChrome sectionKey={sectionKey} alive={alive} />
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="relative z-[1] size-full object-cover ring-1 ring-inset ring-white/10"
            />
          ) : (
            <span
              className={cn(
                "relative z-[1] text-2xl font-semibold tracking-tight",
                menuHoloGlyphClass,
              )}
            >
              {initials}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
