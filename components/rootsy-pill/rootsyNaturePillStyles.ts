import { cn } from "@/lib/utils"

/** Base pill Nature — cápsula compacta, tabular para números. */
export const rootsNaturePillBaseClass =
  "inline-flex w-fit max-w-full items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums"

/** Variantes soft — borde + fondo bruma (tablas, detalle, filtros). */
export const rootsNaturePillCanopySoftClass = cn(
  rootsNaturePillBaseClass,
  "border border-[color:var(--nature-canopy-400)]/45 bg-[color:var(--nature-canopy-100)] text-[color:var(--nature-canopy-800)]",
)

export const rootsNaturePillEarthSoftClass = cn(
  rootsNaturePillBaseClass,
  "border border-[color:var(--nature-earth-400)] bg-[color:var(--nature-earth-100)] text-[color:var(--nature-earth-800)]",
)

export const rootsNaturePillEarthMutedSoftClass = cn(
  rootsNaturePillBaseClass,
  "border border-[color:var(--nature-earth-400)] bg-[color:var(--nature-earth-100)] text-[color:var(--nature-earth-700)]",
)

export const rootsNaturePillAutumnSoftClass = cn(
  rootsNaturePillBaseClass,
  "border border-[color:var(--nature-autumn-400)]/50 bg-[color:var(--nature-autumn-100)] text-[color:var(--nature-autumn-800)]",
)

export const rootsNaturePillEmberSoftClass = cn(
  rootsNaturePillBaseClass,
  "border border-[color:var(--nature-ember-500)]/40 bg-[color:var(--nature-ember-600)]/10 text-[color:var(--nature-ember-700)]",
)

/** Variante solid — énfasis alto (descuentos, métricas clave). */
export const rootsNaturePillCanopySolidClass = cn(
  rootsNaturePillBaseClass,
  "border border-[color:var(--nature-canopy-800)] bg-[color:var(--nature-canopy-700)] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]",
)

export type RootsNaturePillVariant =
  | "canopy"
  | "earth"
  | "earthMuted"
  | "autumn"
  | "ember"
  | "canopySolid"

export const rootsNaturePillVariantClass: Record<
  RootsNaturePillVariant,
  string
> = {
  canopy: rootsNaturePillCanopySoftClass,
  earth: rootsNaturePillEarthSoftClass,
  earthMuted: rootsNaturePillEarthMutedSoftClass,
  autumn: rootsNaturePillAutumnSoftClass,
  ember: rootsNaturePillEmberSoftClass,
  canopySolid: rootsNaturePillCanopySolidClass,
}
