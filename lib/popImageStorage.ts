export const POP_IMAGE_STORAGE_BUCKET = "rootsy_catalog_public" as const

export type PopSettingsImageKind = "logo" | "ticket-logo" | "menu-background"

export function buildPopSettingsImageStoragePath(
  popId: string,
  kind: PopSettingsImageKind,
  fileName: string,
): string {
  return `${popId}/settings/${kind}/${fileName}`
}

export function buildPopSettingsImageFileName(kind: PopSettingsImageKind): string {
  const ext = kind === "ticket-logo" ? "png" : "webp"
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${crypto.randomUUID()}.${ext}`
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
}
