import { cn } from "@/lib/utils"

/** Slide del carrusel — orilla 16px en mobile · 32px en desktop. */
export const menuPlanetSlideClass = "min-w-0 flex-[0_0_100%] px-3 md:px-8"

/** Surcos de planetas — bloque centrado, sueltos a la izquierda del conjunto · 6 en desktop. */
export const menuPlanetGridClass = cn(
  "mx-auto grid w-fit max-w-full grid-cols-4 justify-items-center select-none",
  "gap-x-1 gap-y-4 px-0 pb-2 pt-3.5",
  "md:w-full md:max-w-4xl md:min-h-[280px] md:grid-cols-6 md:gap-x-0 md:gap-y-8 md:px-6 md:pb-6 md:pt-4",
)

export const menuPlanetTileClass = cn(
  "group flex flex-col items-center",
  "h-auto w-[4.25rem] gap-0.5",
  "md:h-[7.125rem] md:w-24 md:gap-2.5",
)

export const menuPlanetIconShellClass = cn(
  "flex items-center justify-center",
  "size-12 rounded-[14px]",
  "md:size-[72px] md:rounded-[20px]",
)

export const menuPlanetIconGlyphClass = "size-6 md:size-8"

export const menuPlanetTileLabelClass =
  "px-0 text-[11px] leading-tight md:px-0 md:text-xs md:leading-tight"
