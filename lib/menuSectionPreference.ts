import type { MenuSectionKey } from "@/lib/menuCatalog"

const STORAGE_PREFIX = "rootsy:menu-section:"

const SECTION_KEYS = ["operar", "administrar", "configurar"] as const

function isMenuSectionKey(value: unknown): value is MenuSectionKey {
  return (
    typeof value === "string" &&
    (SECTION_KEYS as readonly string[]).includes(value)
  )
}

export function readMenuSectionPreference(popId: string): MenuSectionKey | null {
  if (typeof window === "undefined" || !popId) return null
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${popId}`)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isMenuSectionKey(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeMenuSectionPreference(
  popId: string,
  section: MenuSectionKey,
): void {
  if (typeof window === "undefined" || !popId) return
  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}${popId}`,
      JSON.stringify(section),
    )
  } catch {
    /* quota / modo privado */
  }
}
