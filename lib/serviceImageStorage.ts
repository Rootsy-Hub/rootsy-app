export const SERVICE_IMAGE_STORAGE_BUCKET = "rootsy_catalog_public" as const

export function buildServiceImageStoragePath(popId: string, fileName: string): string {
  return `${popId}/services/${fileName}`
}

export function buildServiceImageFileName(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${crypto.randomUUID()}.webp`
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.webp`
}
