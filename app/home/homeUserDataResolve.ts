import type { UserPopListItemBase } from "@/app/profile/actions"
import type {
  UserPopCacheRow,
  UserPopMembershipCache,
  UserProfileCache,
} from "@/app/home/homeUserDataTypes"

export function buildUserProfileFullName(profile: UserProfileCache): string {
  const full = `${profile.firstName} ${profile.lastName}`.trim()
  return full || profile.firstName || "Usuario"
}

/** Une POPs propios y POPs con rol para la grilla del inicio. */
export function buildHomePopList(
  ownedPops: UserPopCacheRow[],
  memberPops: UserPopMembershipCache[],
): UserPopListItemBase[] {
  const byId = new Map<string, UserPopListItemBase>()

  for (const pop of ownedPops) {
    byId.set(pop.id, {
      id: pop.id,
      siteId: pop.siteId,
      name: pop.name,
      imageUrl: pop.imageUrl,
      roleId: "",
      roleName: "Dueño",
      isOwner: true,
    })
  }

  for (const { pop, role } of memberPops) {
    if (byId.has(pop.id)) continue
    byId.set(pop.id, {
      id: pop.id,
      siteId: pop.siteId,
      name: pop.name,
      imageUrl: pop.imageUrl,
      roleId: "",
      roleName: role.displayName || role.name || "Miembro",
      isOwner: false,
    })
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  )
}
