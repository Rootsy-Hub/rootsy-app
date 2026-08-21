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
          "mt-4 h-[0.92rem] animate-pulse rounded-md bg-white/12",
          solo ? "w-24" : "w-20",
        )}
      />
    </div>
  )
}

export function HomePopPickerSkeleton() {
  return (
    <div className="relative flex w-full flex-col items-center px-4 py-4 sm:px-6">
      <ul
        className="mx-auto flex w-full max-w-3xl list-none flex-wrap justify-center gap-x-3 gap-y-6 sm:gap-x-4"
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
