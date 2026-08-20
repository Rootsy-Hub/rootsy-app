import { cn } from "@/lib/utils"

/** Tinta del plano — se lee al buscar el sector, no compite con las mesas. */
export const mesasFloorDecorInkClass =
  "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_62%,transparent)]"

export const mesasFloorDecorInkStrongClass =
  "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_78%,transparent)]"

export const mesasFloorDecorLabelClass = cn(
  "max-w-full truncate text-center font-canopy text-[9px] font-medium uppercase tracking-[0.16em]",
  mesasFloorDecorInkStrongClass,
)

export const mesasFloorDecorStrokeClass =
  "border-[color-mix(in_srgb,var(--rootsy-sombra-300)_20%,transparent)]"

export const mesasFloorDecorFillClass =
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-400)_8%,transparent)]"

export const mesasFloorDecorShellClass = cn(
  "relative size-full overflow-hidden shadow-none",
  mesasFloorDecorStrokeClass,
  mesasFloorDecorFillClass,
)

export const mesasFloorDecorWallClass = cn(
  "size-full rounded-[2px] shadow-none",
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-300)_26%,transparent)]",
)

export const mesasFloorDecorZoneClass = cn(
  "size-full rounded-lg border border-dashed shadow-none",
  "border-[color-mix(in_srgb,var(--rootsy-sombra-300)_22%,transparent)]",
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-400)_7%,transparent)]",
)

export const mesasFloorDecorLabelOnlyClass = cn(
  "flex size-full items-center justify-center px-1",
  "font-canopy text-[11px] font-medium uppercase tracking-[0.18em]",
  mesasFloorDecorInkStrongClass,
)
