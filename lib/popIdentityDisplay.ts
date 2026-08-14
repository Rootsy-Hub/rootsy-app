/** Dirección legible para ficha horizontal POP (streetAddress + city). */
export function formatPopDisplayAddress(
  streetAddress?: string | null,
  city?: string | null,
): string | null {
  const parts = [streetAddress?.trim(), city?.trim()].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : null
}

export function initialsFromPopName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase()
  return `${words[0]![0] ?? ""}${words[1]![0] ?? ""}`.toUpperCase()
}

export function buildPopLogoFallbackUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e8f5ef`
}
