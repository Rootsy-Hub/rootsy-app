import type {
  HomePopListItem,
  PopAccessCache,
  UserProfileCache,
} from "@/app/home/homeUserDataTypes"

export function buildUserProfileFullName(profile: UserProfileCache): string {
  const full = `${profile.firstName} ${profile.lastName}`.trim()
  return full || profile.firstName || "Usuario"
}

export function resolveHomeDisplayName(
  profile: UserProfileCache | null,
  user: {
    email?: string | null
    user_metadata?: Record<string, unknown>
  },
): string {
  const fromProfile = profile ? buildUserProfileFullName(profile).trim() : ""
  if (fromProfile) return fromProfile

  const meta = user.user_metadata ?? {}
  const fullName = typeof meta.full_name === "string" ? meta.full_name.trim() : ""
  if (fullName) return fullName
  const name = typeof meta.name === "string" ? meta.name.trim() : ""
  if (name) return name
  const firstName =
    typeof meta.first_name === "string" ? meta.first_name.trim() : ""
  if (firstName) return firstName

  return user.email?.split("@")[0] || "Usuario"
}

export function resolveHomeAvatarUrl(
  profile: UserProfileCache | null,
  user: { user_metadata?: Record<string, unknown> },
): string | null {
  const fromProfile = profile?.imageUrl?.trim() || ""
  if (fromProfile) return fromProfile
  const fromMeta = user.user_metadata?.avatar_url
  return typeof fromMeta === "string" && fromMeta.trim() ? fromMeta.trim() : null
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
