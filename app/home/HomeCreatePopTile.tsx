"use client"

import { HOME_COPY } from "@/app/home/homeCopy"
import { HOME_POP_AVATAR_SIZE_CLASS, HOME_POP_TILE_MAX_CLASS } from "@/app/home/homePopTileLayout"
import { POP_CREATE_PATH } from "@/lib/signupIntent"
import { cn } from "@/lib/utils"
import { Shop } from "iconsax-reactjs"
import Link from "next/link"

export const homePopTileTitleClass =
  "mt-4 text-center text-[0.92rem] font-semibold text-white/78"

export const homePopTileTitleMutedClass =
  "mt-4 text-center text-[0.92rem] font-semibold text-white/50"

/** CTA sutil para crear el primer negocio — borde bruma, fondo transparente. */
export function HomeCreatePopTile() {
  return (
    <Link
      href={POP_CREATE_PATH}
      className={cn(
        "group flex w-full flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,255,255,0.18)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        HOME_POP_TILE_MAX_CLASS,
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full",
          HOME_POP_AVATAR_SIZE_CLASS,
          "border-[3px] border-[rgba(228,242,248,0.28)] bg-transparent",
          "transition-[border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]",
          "group-hover:border-[rgba(228,242,248,0.48)] group-hover:bg-white/4",
          "group-hover:shadow-[0_0_24px_rgba(228,242,248,0.06)]",
        )}
      >
        <Shop
          size={28}
          variant="Linear"
          color="currentColor"
          className="text-[rgba(255,255,255,0.72)] transition-colors duration-500 group-hover:text-[rgba(255,255,255,0.92)]"
          aria-hidden
        />
      </div>
      <span className={homePopTileTitleClass}>{HOME_COPY.createPop}</span>
    </Link>
  )
}
