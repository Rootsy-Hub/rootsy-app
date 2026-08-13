/** Frase que el usuario debe escribir para confirmar borrado de un servicio. */
export function serviceDeleteConfirmPhrase(serviceName: string): string {
  const name = serviceName.trim() || "este servicio"
  return `Eliminar ${name}`
}

export const SERVICE_TABLE_PAGE_SIZES = [10, 25, 50] as const
export const DEFAULT_SERVICE_TABLE_PAGE_SIZE = 25
