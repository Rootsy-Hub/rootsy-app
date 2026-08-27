/**
 * Atmósferas de botón — las tres luces activas del handbook.
 * El primario no cambia. Cambia el ink de contorno, link y subtle.
 */

export const ROOTSY_BUTTON_ATMOSPHERES = ["bruma", "sombra", "eter"] as const

export type RootsButtonAtmosphere = (typeof ROOTSY_BUTTON_ATMOSPHERES)[number]

export const ROOTSY_BUTTON_ATMOSPHERE_LABELS: Record<RootsButtonAtmosphere, string> = {
  bruma: "Sotobosque · Luz filtrada",
  sombra: "Sotobosque · Sombra",
  eter: "Éter",
}

export function isRootsButtonAtmosphere(
  value: string | null | undefined,
): value is RootsButtonAtmosphere {
  return (
    value === "bruma" || value === "sombra" || value === "eter"
  )
}

/** Luz filtrada es la única luz clara. Sombra y Éter son oscuras. */
export function isRootsButtonAtmosphereDark(atmosphere: RootsButtonAtmosphere) {
  return atmosphere !== "bruma"
}

export function resolveRootsButtonAtmosphere(input?: {
  atmosphere?: RootsButtonAtmosphere
  theme?: "workspace" | "pos"
}): RootsButtonAtmosphere {
  if (input?.atmosphere) return input.atmosphere
  if (input?.theme === "pos") return "sombra"
  return "bruma"
}
