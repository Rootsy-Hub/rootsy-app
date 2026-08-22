import { cn } from "@/lib/utils"

/** Slide del carrusel — orilla 16px en mobile · 32px en desktop. */
export const menuPlanetSlideClass = "min-w-0 flex-[0_0_100%] px-3 md:px-8"

/** Surcos de planetas — 3 columnas en mobile (sueltos a la izquierda) · 6 en desktop. */
export const menuPlanetGridClass = cn(
  "mx-auto grid w-full max-w-4xl grid-cols-3 justify-items-center select-none",
  "gap-x-2 gap-y-5 px-0 pb-2 pt-3.5",
  "sm:gap-x-3 sm:gap-y-7 sm:px-4",
  "md:min-h-[280px] md:grid-cols-6 md:gap-x-0 md:gap-y-8 md:px-6 md:pb-6 md:pt-4",
)

export const menuPlanetTileClass = cn(
  "group flex flex-col items-center",
  "h-[6.5rem] w-[5.15rem] gap-1.5",
  "sm:h-[7.125rem] sm:w-24 sm:gap-2.5",
)

export const menuPlanetIconShellClass = cn(
  "flex items-center justify-center",
  "size-14 rounded-[16px]",
  "sm:size-[72px] sm:rounded-[20px]",
)

export const menuPlanetIconGlyphClass = "size-7 sm:size-8"

export const menuPlanetTileLabelClass =
  "px-0.5 text-[10px] leading-snug sm:px-0 sm:text-xs sm:leading-tight"
