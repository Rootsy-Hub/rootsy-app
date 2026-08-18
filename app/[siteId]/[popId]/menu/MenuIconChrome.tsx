import type { MenuSectionKey } from "@/lib/menuCatalog"
import {
  menuHoloChromeCoreClass,
  menuHoloChromeRimClass,
  menuHoloChromeSkyClass,
  menuHoloChromeWeightClass,
} from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"

type Props = {
  sectionKey?: MenuSectionKey
}

/** Vidrio planetario — núcleo, atmósfera, canto y peso del mundo. */
export function MenuIconChrome({ sectionKey = "operar" }: Props) {
  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          menuHoloChromeCoreClass(sectionKey),
        )}
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
      <div
        className={cn(
          "pointer-events-none absolute inset-px rounded-[inherit] border",
          menuHoloChromeRimClass(sectionKey),
        )}
        aria-hidden
      />
    </>
  )
}
