"use client"

import { POP_HOME_ACCENTS } from "@/app/library/logos/rootsyLogoSystem"
import { HOME_COPY } from "@/app/home/homeCopy"
import {
  homePopTileTitleClass,
  homePopTileTitleMutedClass,
} from "@/app/home/HomeCreatePopTile"
import {
  HOME_POP_AVATAR_SIZE_CLASS,
  HOME_POP_TILE_MAX_CLASS,
} from "@/app/home/homePopTileLayout"
import { cn } from "@/lib/utils"

type Props = {
  name: string
  imageUrl: string | null
  initials: string
  address?: string | null
  active?: boolean
  trial?: boolean
}

export function HomePopPlanetTile({
  name,
  imageUrl,
  initials,
  address,
  active = false,
  trial = false,
}: Props) {
  const hasImage = Boolean(imageUrl?.trim())

  return (
    <div className={cn("mx-auto flex w-full flex-col items-center", HOME_POP_TILE_MAX_CLASS)}>
      <div className="relative">
        {active && hasImage ? (
          <div
            className={cn(
              "absolute inset-0 rounded-full opacity-70 blur-xl",
              POP_HOME_ACCENTS.glow,
            )}
            aria-hidden
          />
        ) : null}

        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden rounded-full",
            HOME_POP_AVATAR_SIZE_CLASS,
            "shadow-xl ring-2 ring-white/14 transition-[box-shadow,ring-color] duration-300",
            "group-hover:ring-white/28 group-hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.45)]",
            !hasImage && cn("bg-linear-to-br", POP_HOME_ACCENTS.accent),
          )}
        >
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl!} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-[1.72rem] font-black tracking-tight text-white drop-shadow">
              {initials}
            </span>
          )}
        </div>

        {trial ? (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
            {HOME_COPY.popTrial}
          </span>
        ) : null}
      </div>

      <span
        className={cn(
          "line-clamp-2 transition-colors duration-300",
          active ? homePopTileTitleClass : homePopTileTitleMutedClass,
          active && "group-hover:text-white/92",
        )}
      >
        {name}
      </span>
      {address ? (
        <span className="mt-1 line-clamp-2 max-w-40 text-center text-[10px] leading-snug text-white/50">
          {address}
        </span>
      ) : null}
    </div>
  )
}
