import { cn } from "@/lib/utils"

/** Slide del carrusel — orilla 16px en mobile · 32px en desktop. */
export const menuPlanetSlideClass = "min-w-0 flex-[0_0_100%] px-4 md:px-8"

/** Surcos de planetas — 3 en mobile · 4 en tablet · 6 en desktop. */
export const menuPlanetGridClass = cn(
  "mx-auto grid w-full max-w-4xl select-none",
  "grid-cols-3 gap-x-2 gap-y-5 px-1 pb-4 pt-1",
  "sm:grid-cols-4 sm:gap-y-7 sm:px-4",
  "md:grid-cols-6 md:min-h-[280px] md:gap-x-0 md:gap-y-8 md:px-6 md:pb-6 md:pt-2",
)

export const menuPlanetTileClass = cn(
  "group flex flex-col items-center",
  "h-[6.35rem] w-[4.75rem] gap-2",
  "sm:h-[7.125rem] sm:w-24 sm:gap-2.5",
)

export const menuPlanetIconShellClass = cn(
  "flex items-center justify-center",
  "size-14 rounded-[16px]",
  "sm:size-[72px] sm:rounded-[20px]",
)

export const menuPlanetIconGlyphClass = "size-7 sm:size-8"
