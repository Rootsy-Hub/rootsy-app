import { cn } from "@/lib/utils"

/** dialog.body.loading · track bruma-200 · arco savia-600 · motion spin. */
export const rootsSpinnerRingClass =
  "animate-spin rounded-full border-solid border-[var(--rootsy-bruma-200)] border-t-[var(--rootsy-savia-600)]"

/** Operar dark — track sombra · arco savia. */
export const rootsSpinnerDarkRingClass =
  "animate-spin rounded-full border-solid border-[color-mix(in_srgb,var(--rootsy-sombra-300)_35%,transparent)] border-t-[color-mix(in_srgb,var(--rootsy-savia-400)_85%,transparent)]"

export const rootsSpinnerSizeClass = {
  /** Footer infinite scroll · controles compactos. */
  xs: "size-3.5 border-[1.5px]",
  /** Botones e inline actions. */
  sm: "size-4 border-2",
  /** dialog.body.loading · space.400 (32px). */
  default: "size-8 border-2",
  /** Pantallas full-viewport / estados grandes legacy. */
  lg: "size-10 border-2",
} as const

export type RootsSpinnerSize = keyof typeof rootsSpinnerSizeClass

export type RootsSpinnerTone = "light" | "dark"

export function rootsSpinnerClassName(
  size: RootsSpinnerSize = "default",
  className?: string,
  tone: RootsSpinnerTone = "light",
) {
  return cn(
    tone === "dark" ? rootsSpinnerDarkRingClass : rootsSpinnerRingClass,
    rootsSpinnerSizeClass[size],
    className,
  )
}
