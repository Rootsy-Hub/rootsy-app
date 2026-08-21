const SKELETON_SLOTS = 4

/** Mismo diámetro que el planeta real (`HomePopPlanetTile` solo / crear negocio). */
const GHOST_PLANET_SIZE = "size-32 sm:size-36"

export function HomeGhostPlanet({ solo = false }: { solo?: boolean }) {
  return (
    <div className="mx-auto flex w-full max-w-40 flex-col items-center">
      <div
        aria-hidden
        className={`${GHOST_PLANET_SIZE} animate-pulse rounded-full bg-white/12`}
      />
      <span
        aria-hidden
        className={
          solo
            ? "mt-4 h-6 w-28 animate-pulse rounded-md bg-white/12 sm:h-7 sm:w-32"
            : "mt-4 h-6 w-24 animate-pulse rounded-md bg-white/12 sm:h-7 sm:w-28"
        }
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
          <li key={index} className="basis-[9.1rem] sm:basis-[9.4rem]">
            <HomeGhostPlanet />
          </li>
        ))}
      </ul>
    </div>
  )
}
