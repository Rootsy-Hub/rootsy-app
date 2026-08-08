export const USER_PROFILE_UPDATED_EVENT = "rootsy:user-profile-updated"

export function notifyUserProfileUpdated(userId: string): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent(USER_PROFILE_UPDATED_EVENT, { detail: { userId } }),
  )
}
