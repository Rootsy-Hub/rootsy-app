/** Lista elegida en Operar — vive en memoria de la sesión de página. */

let session: { popId: string; priceListId: string } | null = null

export function setSalePriceListSession(popId: string, priceListId: string) {
  session = { popId, priceListId }
}

export function getSalePriceListSession(popId: string): string | undefined {
  if (!session || session.popId !== popId) return undefined
  return session.priceListId
}
