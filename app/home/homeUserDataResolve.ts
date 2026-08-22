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

const EMPTY_LIMITS = {
  maxUsers: 0,
  maxUsersLabel: "",
  maxArticles: 0,
  maxArticlesLabel: "",
  maxOperationsPerMonth: 0,
  maxOperationsPerMonthLabel: "",
  allModules: false,
} as const

export function mePopToHomeItem(pop: {
  id: string
  siteId: string
  name: string
  imageUrl: string | null
  backgroundImageUrl?: string | null
  streetAddress?: string | null
  isOwner: boolean
  roleName: string
  isActive: boolean
  canEnter: boolean
  permissions: string[]
  dockItemIds?: string[]
  subscription: {
    isActive: boolean
    status: string
    planDisplayName: string
    daysRemaining: number | null
    businessTypeName?: string
    allModules?: boolean
  }
}): HomePopListItem {
  return {
    id: pop.id,
    siteId: pop.siteId,
    name: pop.name,
    imageUrl: pop.imageUrl,
    backgroundImageUrl: pop.backgroundImageUrl ?? null,
    streetAddress: pop.streetAddress ?? null,
    roleName: pop.roleName,
    isOwner: pop.isOwner,
    isActive: pop.isActive,
    canEnter: pop.canEnter,
    permissions: pop.permissions,
    dockItemIds: Array.isArray(pop.dockItemIds) ? pop.dockItemIds : [],
    subscription: {
      status: pop.subscription.status,
      planName: "",
      planDisplayName: pop.subscription.planDisplayName,
      businessTypeName: pop.subscription.businessTypeName ?? "",
      businessTypeDisplayName: "",
      daysRemaining: pop.subscription.daysRemaining,
      isActive: pop.subscription.isActive,
      trialEndsAt: null,
      currentPeriodEnd: null,
    },
    enabledModules: [],
    limits: {
      ...EMPTY_LIMITS,
      allModules: pop.subscription.allModules === true,
    },
    role: null,
  }
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
      backgroundImageUrl: access.pop.backgroundImageUrl,
      streetAddress: access.pop.streetAddress,
      roleName: access.isOwner
        ? "Dueño"
        : access.role?.displayName || access.role?.name || "Miembro",
      isOwner: access.isOwner,
      isActive: access.pop.isActive,
      canEnter: access.canEnter,
      permissions: access.isOwner
        ? []
        : access.role?.permissionGrants ?? [],
      dockItemIds: [],
      subscription: access.subscription,
      enabledModules: access.enabledModules,
      limits: access.limits,
      role: access.role,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
}
