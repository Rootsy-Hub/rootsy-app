import { cn } from "@/lib/utils"

/** dialog.body.loading · track bruma-200 · arco savia-600 · motion spin. */
export const rootsSpinnerRingClass =
  "animate-spin rounded-full border-solid border-[var(--rootsy-bruma-200)] border-t-[var(--rootsy-savia-600)]"

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

export function rootsSpinnerClassName(
  size: RootsSpinnerSize = "default",
  className?: string,
) {
  return cn(rootsSpinnerRingClass, rootsSpinnerSizeClass[size], className)
}
