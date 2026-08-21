"use client"

import { MenuIconChrome } from "@/app/[siteId]/[popId]/menu/MenuIconChrome"
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
}

/** Planeta POP — luz propia que dialoga con el firmamento. */
export function HomePopPlanetTile({
  sectionKey,
  name,
  imageUrl,
  initials,
  alive = true,
}: Props) {
  const lifeStyle = menuPlanetLifeStyle(`home-${sectionKey}-${name}`)
  const shellVariant = alive ? "default" : "placed"

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={cn(alive && menuHoloPlanetLifeClass)}
        style={alive ? lifeStyle : undefined}
      >
        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden rounded-full",
            "size-32 sm:size-36",
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
