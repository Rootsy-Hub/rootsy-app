const STORAGE_PREFIX = "rootsy:user-profile-rev:v1:"
export const USER_PROFILE_UPDATED_EVENT = "rootsy:user-profile-updated"

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined"
}

export function getUserProfileRev(userId: string): number {
  if (!canUseSessionStorage()) return 1
  try {
    const raw = window.sessionStorage.getItem(storageKey(userId))
    const n = Number(raw)
    return Number.isFinite(n) && n >= 1 ? Math.trunc(n) : 1
  } catch {
    return 1
  }
}

/** Llamar tras guardar perfil (nombre, avatar, etc.). */
export function bumpUserProfileRev(userId: string): number {
  const next = getUserProfileRev(userId) + 1
  if (!canUseSessionStorage()) return next
  try {
    window.sessionStorage.setItem(storageKey(userId), String(next))
    window.dispatchEvent(
      new CustomEvent(USER_PROFILE_UPDATED_EVENT, { detail: { userId } }),
    )
  } catch {
    /* quota / private mode */
  }
  return next
}
