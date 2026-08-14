/** Normaliza HH:mm; devuelve cadena vacía si el valor es inválido. */
export function normalizeTimeHHmm(value: unknown): string {
  if (typeof value !== "string") return ""
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return ""
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return ""
  }
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

/** Normaliza HH:mm con fallback (p. ej. 00:00). */
export function normalizeTimeHHmmOrDefault(
  value: unknown,
  fallback: string,
): string {
  return normalizeTimeHHmm(value) || normalizeTimeHHmm(fallback) || "00:00"
}
