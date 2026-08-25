/**
 * POP interno de Rootsy donde se registran ingresos de plataforma como operaciones
 * de servicios (suscripciones SaaS).
 */
export function getRootsyPlatformPopId(): string | null {
  const value = process.env.ROOTSY_POP_ID?.trim()
  if (!value) return null
  return value
}

export function requireRootsyPlatformPopId(): string {
  const popId = getRootsyPlatformPopId()
  if (!popId) {
    throw new Error(
      "ROOTSY_POP_ID no está configurado. Definilo en el entorno del servidor.",
    )
  }
  return popId
}

export function isRootsyPlatformPopConfigured(): boolean {
  return getRootsyPlatformPopId() != null
}
