import type {
  HomePopListItem,
  PopAccessCache,
  UserProfileCache,
} from "@/app/home/homeUserDataTypes"

export function buildUserProfileFullName(profile: UserProfileCache): string {
  const full = `${profile.firstName} ${profile.lastName}`.trim()
  return full || profile.firstName || "Usuario"
}

export function buildHomePopListFromAccess(
  accessRows: PopAccessCache[],
): HomePopListItem[] {
  return accessRows
    .map((access) => ({
      id: access.pop.id,
      siteId: access.pop.siteId,
      name: access.pop.name,
      imageUrl: access.pop.imageUrl,
      roleName: access.isOwner
        ? "Dueño"
        : access.role?.displayName || access.role?.name || "Miembro",
      isOwner: access.isOwner,
      canEnter: access.canEnter,
      subscription: access.subscription,
      enabledModules: access.enabledModules,
      limits: access.limits,
      role: access.role,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
}
