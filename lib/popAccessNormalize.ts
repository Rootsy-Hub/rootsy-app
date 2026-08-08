import type { PopAccessCache, PopAccessFiscal } from "@/app/home/homeUserDataTypes"

const DEFAULT_FISCAL: PopAccessFiscal = {
  hasValidCuit: false,
  emisorIvaCondition: "responsable_inscripto",
}

/** Rellena campos faltantes en entradas de cache persistidas antes de `fiscal`. */
export function normalizePopAccessCache(
  access: PopAccessCache | null | undefined,
): PopAccessCache | null {
  if (!access) return null
  return {
    ...access,
    pop: {
      ...access.pop,
      backgroundImageUrl: access.pop.backgroundImageUrl ?? null,
    },
    fiscal: access.fiscal ?? DEFAULT_FISCAL,
  }
}

export function popAccessCacheNeedsRefresh(
  access: PopAccessCache | null | undefined,
): boolean {
  if (!access) return false
  return access.fiscal == null || access.pop.backgroundImageUrl === undefined
}
