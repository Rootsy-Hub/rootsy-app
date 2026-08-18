import type { MenuSectionKey } from "@/lib/menuCatalog"
import {
  menuHoloChromeCoreClass,
  menuHoloChromeCoreLifeClass,
  menuHoloChromeSkyClass,
  menuHoloChromeVeilClass,
  menuHoloChromeWeightClass,
  menuPlanetCoreLifeStyle,
} from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"

type Props = {
  sectionKey?: MenuSectionKey
  alive?: boolean
}

/** Luz y color del planeta — sin bordes apilados; el canto vive en el shell. */
export function MenuIconChrome({ sectionKey = "operar", alive = false }: Props) {
  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          menuHoloChromeVeilClass,
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          menuHoloChromeCoreClass(sectionKey),
          alive && menuHoloChromeCoreLifeClass,
        )}
        style={alive ? menuPlanetCoreLifeStyle(sectionKey) : undefined}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          menuHoloChromeSkyClass(sectionKey),
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          menuHoloChromeWeightClass(sectionKey),
        )}
        aria-hidden
      />
    </>
  )
}
