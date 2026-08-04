"use server"

import type {
  UserPopCacheRow,
  UserPopMembershipCache,
  UserPopRoleCache,
  UserProfileCache,
} from "@/app/home/homeUserDataTypes"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { siteIdFromPopRow } from "@/lib/popRoutes"
import { createClient } from "@/utils/supabase/server"

const POP_LIST_SELECT =
  "id, name, image_url, is_active, business_type_id, subscription_id, site_id, street_address, settings" as const

type PopListRow = {
  id: string
  name: string
  image_url: string | null
  is_active: boolean
  business_type_id: string | null
  subscription_id: string | null
  site_id: string | null
  street_address: string | null
  settings: unknown
}

type MemberRoleRow = {
  pop_id: string
  role_id: string
  pops: PopListRow | PopListRow[] | null
  roles: {
    id: string
    name: string
    display_name: string
    permission_grants: unknown
    pop_id: string | null
  } | {
    id: string
    name: string
    display_name: string
    permission_grants: unknown
    pop_id: string | null
  }[] | null
}

function mapPopRow(row: PopListRow): UserPopCacheRow {
  return {
    id: String(row.id),
    name: String(row.name ?? "").trim(),
    imageUrl: row.image_url ?? null,
    isActive: Boolean(row.is_active),
    businessTypeId: row.business_type_id ?? null,
    subscriptionId: row.subscription_id ?? null,
    siteId: siteIdFromPopRow({
      site_id: row.site_id,
      settings: row.settings,
    }),
    streetAddress: row.street_address ?? null,
  }
}

function parsePermissionGrants(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((entry): entry is string => typeof entry === "string")
}

function mapRoleRow(role: MemberRoleRow["roles"]): UserPopRoleCache | null {
  const row = Array.isArray(role) ? role[0] : role
  if (!row) return null
  return {
    name: String(row.name ?? "").trim(),
    displayName: String(row.display_name ?? row.name ?? "").trim(),
    permissionGrants: parsePermissionGrants(row.permission_grants),
  }
}

function roleMatchesPop(
  rolePopId: string | null | undefined,
  membershipPopId: string,
): boolean {
  if (rolePopId == null) return true
  return String(rolePopId) === String(membershipPopId)
}

/** 1 — `users` por id de sesión → cache `user-profile`. */
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

/** 2 — `pops` donde `owner_user_id` = usuario → cache `user-pops-owner`. */
export async function getUserOwnedPopsCache(): Promise<UserPopCacheRow[]> {
  const user = await requireAuthenticatedUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pops")
    .select(POP_LIST_SELECT)
    .eq("owner_user_id", user.uid)
    .order("name")

  if (error || !data) return []
  return (data as PopListRow[]).map(mapPopRow)
}

/** 3 — `user_pop_roles` activos + pops + roles → cache `user-pops`. */
export async function getUserMemberPopsCache(): Promise<UserPopMembershipCache[]> {
  const user = await requireAuthenticatedUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_pop_roles")
    .select(
      `
      pop_id,
      role_id,
      pops:pop_id (${POP_LIST_SELECT}),
      roles:role_id ( id, name, display_name, permission_grants, pop_id )
    `,
    )
    .eq("user_id", user.uid)
    .eq("is_active", true)

  if (error || !data) return []

  const out: UserPopMembershipCache[] = []

  for (const row of data as MemberRoleRow[]) {
    const popRaw = Array.isArray(row.pops) ? row.pops[0] : row.pops
    if (!popRaw) continue

    const roleRaw = Array.isArray(row.roles) ? row.roles[0] : row.roles
    if (!roleRaw || !roleMatchesPop(roleRaw.pop_id, row.pop_id)) continue

    const role = mapRoleRow(roleRaw)
    if (!role) continue

    out.push({
      pop: mapPopRow(popRaw),
      role,
    })
  }

  return out
}
