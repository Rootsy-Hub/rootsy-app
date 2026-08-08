import type { ClientIvaConditionValue } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"

function normalizePadronText(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Mapea la descripción de condición IVA del padrón AFIP al enum interno de clientes.
 * Retorna null si no hay match confiable (el usuario debe elegir manualmente).
 */
export function mapPadronCondicionIvaToClientEnum(
  condicionIvaNombre: string | null | undefined,
): ClientIvaConditionValue | null {
  const t = normalizePadronText(condicionIvaNombre ?? "")
  if (!t) return null

  if (
    t.includes("RESPONSABLE INSCRIPTO") ||
    t.includes("IVA RESPONSABLE INSCRIPTO") ||
    t === "INSCRIPTO" ||
    t.includes(" IVA INSCRIPTO")
  ) {
    return "responsable_inscripto"
  }
  if (t.includes("MONOTRIBUTISTA SOCIAL") || t.includes("MONOTRIBUTO SOCIAL")) {
    return "monotributo_social"
  }
  if (t.includes("MONOTRIBUTO") || t.includes("MONOTRIBUTISTA")) {
    return "monotributo"
  }
  if (
    t.includes("SUJETO EXENTO") ||
    t.includes("IVA EXENTO") ||
    t.includes("IVA LIBERADO") ||
    t === "EXENTO"
  ) {
    return "exento"
  }
  if (t.includes("CONSUMIDOR FINAL")) {
    return "consumidor_final"
  }
  if (
    t.includes("NO ALCANZADO") ||
    t.includes("NO CATEGORIZADO") ||
    t.includes("SIN CATEGORIA")
  ) {
    return "no_categorizado"
  }

  return null
}
