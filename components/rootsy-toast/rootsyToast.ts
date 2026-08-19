/**
 * Toast Rootsy — aviso flotante, no banner.
 * Motion: motion.flag.enter / exit (viento · aterrizaje · despegue).
 * Elevación: overlay · z-index 600.
 */

export type RootsyToastIntent = "success" | "info" | "neutral" | "warning" | "danger"

/** Momento de un canto: se lee y se va. */
export const ROOTSY_TOAST_DURATION_MS = 2800

/** Salida más rápida que la entrada — motion.flag.exit. */
export const ROOTSY_TOAST_EXIT_MS = 200
