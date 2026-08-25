/**
 * Toast Rootsy — aviso flotante, no banner.
 * Motion: llegada de mensaje (spring desde la colita) / recogida al retrato.
 * Elevación: overlay · z-index 600.
 */

export type RootsyToastIntent = "success" | "info" | "neutral" | "warning" | "danger"

export type RootsyToastAppearance = "default" | "mensaje"

/** Momento de un canto: se lee y se va. */
export const ROOTSY_TOAST_DURATION_MS = 2800

/** Mensaje de Rootsy — un poco más de aire para leer el globo. */
export const ROOTSY_MENSAJE_TOAST_DURATION_MS = 4500

/** Recogida del globo — un poco más corta que la llegada. */
export const ROOTSY_TOAST_EXIT_MS = 320
