"use server"

import type {
  PopAccessCache,
  PopAccessRole,
  UserPopIdsCache,
  UserProfileCache,
} from "@/app/home/homeUserDataTypes"
import {
  buildPopAccessEnabledModules,
  mapPopAccessLimits,
  mapPopSubscriptionRow,
  parseExtraModuleEntries,
  parseRolePermissionGrants,
} from "@/app/home/popAccessResolve"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { siteIdFromPopRow } from "@/lib/popRoutes"
import { createClient } from "@/utils/supabase/server"

const POP_ACCESS_SELECT =
  "id, name, image_url, background_image_url, is_active, owner_user_id, business_type_id, subscription_id, site_id, street_address, settings" as const

type PopAccessRow = {
  id: string
  name: string
  image_url: string | null
  background_image_url: string | null
  is_active: boolean
  owner_user_id: string
  business_type_id: string | null
  subscription_id: string | null
  site_id: string | null
  street_address: string | null
  settings: unknown
}

type MemberRoleRow = {
  pop_id: string
  roles: {
    name: string
    display_name: string
    permission_grants: unknown
    pop_id: string | null
  } | {
    name: string
    display_name: string
    permission_grants: unknown
    pop_id: string | null
  }[] | null
}

function roleMatchesPop(
  rolePopId: string | null | undefined,
  membershipPopId: string,
): boolean {
  if (rolePopId == null) return true
  return String(rolePopId) === String(membershipPopId)
}

function mapMemberRole(role: MemberRoleRow["roles"]): PopAccessRole | null {
  const row = Array.isArray(role) ? role[0] : role
  if (!row) return null
  return {
    name: String(row.name ?? "").trim(),
    displayName: String(row.display_name ?? row.name ?? "").trim(),
    permissionGrants: parseRolePermissionGrants(row.permission_grants),
  }
}

/** Cache `_user-profile`. */
export async function getUserProfileCache(): Promise<UserProfileCache> {
  const user = await requireAuthenticatedUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users")
    .select("first_name, last_name, image_url")
    .eq("id", user.uid)
    .maybeSingle()

  if (error || !data) {
    const fallback = user.email?.split("@")[0] || "Usuario"
    return {
      firstName: fallback,
      lastName: "",
      imageUrl: null,
    }
  }

  return {
    firstName: String(data.first_name ?? "").trim(),
    lastName: String(data.last_name ?? "").trim(),
    imageUrl: data.image_url ?? null,
  }
}

/** Cache `_user-pop-ids` — POPs propios + POPs con rol activo. */
export async function getUserPopIdsCache(): Promise<UserPopIdsCache> {
  const user = await requireAuthenticatedUser()
  const supabase = await createClient()

  const [{ data: ownedRows }, { data: memberRows }] = await Promise.all([
    supabase.from("pops").select("id").eq("owner_user_id", user.uid),
    supabase
      .from("user_pop_roles")
      .select("pop_id")
      .eq("user_id", user.uid)
      .eq("is_active", true),
  ])

  const ids = new Set<string>()
  for (const row of ownedRows ?? []) {
    ids.add(String(row.id))
  }
  for (const row of memberRows ?? []) {
    ids.add(String(row.pop_id))
  }
  return Array.from(ids)
}

/** Cache `_pop-access` por popId. */
export async function getPopAccessCache(
  popId: string,
): Promise<PopAccessCache | null> {
  const user = await requireAuthenticatedUser()
  const supabase = await createClient()

  const { data: popRow, error: popError } = await supabase
    .from("pops")
    .select(POP_ACCESS_SELECT)
    .eq("id", popId)
    .maybeSingle()

  if (popError || !popRow) return null

  const pop = popRow as PopAccessRow
  const isOwner = String(pop.owner_user_id) === user.uid

  let role: PopAccessRole | null = null
  let permissionGrants: string[] = []

  if (!isOwner) {
    const { data: membership } = await supabase
      .from("user_pop_roles")
      .select(
        `
        is_active,
        roles:role_id ( name, display_name, permission_grants, pop_id )
      `,
      )
      .eq("user_id", user.uid)
      .eq("pop_id", popId)
      .eq("is_active", true)
      .maybeSingle()

    if (!membership) return null

    const roleRaw = Array.isArray(membership.roles)
      ? membership.roles[0]
      : membership.roles
    if (!roleRaw || !roleMatchesPop(roleRaw.pop_id, popId)) return null

    role = mapMemberRole(roleRaw)
    if (!role) return null
    permissionGrants = role.permissionGrants
  }

  const { data: subscriptionInfo, error: subscriptionError } =
    await supabase.rpc("get_pop_subscription_info", { pop_id: popId })

  if (
    subscriptionError ||
    !subscriptionInfo ||
    subscriptionInfo.length === 0
  ) {
    return null
  }

  const subscriptionRaw = subscriptionInfo[0] as Record<string, unknown>
  const subscription = mapPopSubscriptionRow(subscriptionRaw)
  const limits = mapPopAccessLimits(subscriptionRaw)

  let extraModules: ReturnType<typeof parseExtraModuleEntries> = []
  if (pop.subscription_id) {
    const { data: subRow } = await supabase
      .from("_pop_subscriptions")
      .select("extra_modules")
      .eq("id", pop.subscription_id)
      .maybeSingle()
    extraModules = parseExtraModuleEntries(subRow?.extra_modules)
  }

  const enabledModules = buildPopAccessEnabledModules({
    businessTypeName: subscription.businessTypeName,
    extraModules,
    allModules: limits.allModules,
    permissionGrants,
    isOwner,
  })

  const canEnter = Boolean(pop.is_active) && subscription.isActive

  return {
    pop: {
      id: String(pop.id),
      name: String(pop.name ?? "").trim(),
      imageUrl: pop.image_url ?? null,
      backgroundImageUrl:
        pop.background_image_url != null
          ? String(pop.background_image_url).trim() || null
          : null,
      siteId: siteIdFromPopRow({
        site_id: pop.site_id,
        settings: pop.settings,
      }),
      streetAddress: pop.street_address ?? null,
      isActive: Boolean(pop.is_active),
    },
    subscription,
    enabledModules,
    limits,
    isOwner,
    role,
    canEnter,
  }
}
