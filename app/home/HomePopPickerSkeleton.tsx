import {
  HOME_POP_AVATAR_SIZE_CLASS,
  HOME_POP_TILE_BASIS_CLASS,
  HOME_POP_TILE_MAX_CLASS,
} from "@/app/home/homePopTileLayout"
import { cn } from "@/lib/utils"

const SKELETON_SLOTS = 4

export function HomeGhostPlanet({ solo = false }: { solo?: boolean }) {
  return (
    <div className={cn("mx-auto flex w-full flex-col items-center", HOME_POP_TILE_MAX_CLASS)}>
      <div
        aria-hidden
        className={cn(
          HOME_POP_AVATAR_SIZE_CLASS,
          "animate-pulse rounded-full bg-white/12 ring-2 ring-white/14",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "mt-3 h-[0.82rem] animate-pulse rounded-md bg-white/12 sm:mt-4 sm:h-[0.92rem]",
          solo ? "w-24" : "w-20",
        )}
      />
    </div>
  )
}

export function HomePopPickerSkeleton() {
  return (
    <div className="relative flex w-full flex-col items-center px-0 py-2 sm:px-6 sm:py-4">
      <ul
        className="mx-auto flex w-full max-w-3xl list-none flex-wrap justify-center gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6"
        aria-busy="true"
        aria-label="Cargando puntos de venta"
      >
        {Array.from({ length: SKELETON_SLOTS }, (_, index) => (
          <li key={index} className={HOME_POP_TILE_BASIS_CLASS}>
            <HomeGhostPlanet />
          </li>
        ))}
      </ul>
    </div>
  )
}
