export type TreasuryBrandIsotypeEntry = {
  src: string
  /** contain = isotipo completo; cover = llena el badge (default). */
  fit?: "contain" | "cover"
  position?: string
}

const coverCenter = (src: string): TreasuryBrandIsotypeEntry => ({
  src,
  fit: "cover",
  position: "center",
})

/**
 * Isotipos desde íconos oficiales de Google Play (512px).
 * Respaldo anterior: public/treasury-brands/backup/current/
 * Fuente cruda: public/treasury-brands/isotypes/play/
 */
export const TREASURY_BRAND_ISOTYPE: Record<string, TreasuryBrandIsotypeEntry> = {
  // —— Bancos ——
  galicia: coverCenter("/treasury-brands/isotypes/galicia.png"),
  santander: coverCenter("/treasury-brands/isotypes/santander.png"),
  bbva: coverCenter("/treasury-brands/isotypes/bbva.png"),
  macro: coverCenter("/treasury-brands/isotypes/macro.png"),
  nacion: coverCenter("/treasury-brands/isotypes/nacion.png"),
  provincia: coverCenter("/treasury-brands/isotypes/provincia.png"),
  ciudad: coverCenter("/treasury-brands/isotypes/ciudad.png"),
  supervielle: coverCenter("/treasury-brands/isotypes/supervielle.png"),
  patagonia: coverCenter("/treasury-brands/isotypes/patagonia.png"),
  icbc: coverCenter("/treasury-brands/isotypes/icbc.png"),

  // —— Billeteras ——
  mercadopago: coverCenter("/treasury-brands/isotypes/mercadopago.png"),
  personal_pay: coverCenter("/treasury-brands/isotypes/personal_pay.png"),
  modo: coverCenter("/treasury-brands/isotypes/modo.png"),
  astropay: coverCenter("/treasury-brands/isotypes/astropay.png"),
  uala: coverCenter("/treasury-brands/isotypes/uala.png"),
  naranja_x: coverCenter("/treasury-brands/isotypes/naranja_x.png"),
  lemon: coverCenter("/treasury-brands/isotypes/lemon.png"),
}

export function getTreasuryBrandIsotype(
  brandKey: string | null | undefined,
): TreasuryBrandIsotypeEntry | null {
  if (!brandKey) return null
  return TREASURY_BRAND_ISOTYPE[brandKey] ?? null
}

export function treasuryBrandHasIsotype(brandKey: string): boolean {
  return brandKey in TREASURY_BRAND_ISOTYPE
}

/** @deprecated */
export function getTreasuryBrandIsotypeSrc(
  brandKey: string | null | undefined,
): string | null {
  return getTreasuryBrandIsotype(brandKey)?.src ?? null
}
