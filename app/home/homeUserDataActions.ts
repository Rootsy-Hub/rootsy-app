"use server"

import type {
  PopAccessCache,
  PopAccessRole,
  UserPopIdsCache,
  UserPopsAccessBatchCache,
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
import { mapPopAccessFiscal } from "@/lib/popFiscalSettings"
import { siteIdFromPopRow } from "@/lib/popRoutes"
import { createClient } from "@/utils/supabase/server"

const POP_ACCESS_SELECT =
  "id, name, image_url, background_image_url, fiscal_cuit, is_active, owner_user_id, business_type_id, subscription_id, site_id, street_address, settings" as const

type PopAccessRow = {
  id: string
  name: string
  image_url: string | null
  background_image_url: string | null
  fiscal_cuit: string | null
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

function assemblePopAccess(input: {
  pop: PopAccessRow
  isOwner: boolean
  role: PopAccessRole | null
  subscriptionRaw: Record<string, unknown>
  extraModules: ReturnType<typeof parseExtraModuleEntries>
}): PopAccessCache {
  const subscription = mapPopSubscriptionRow(input.subscriptionRaw)
  const limits = mapPopAccessLimits(input.subscriptionRaw)
  const permissionGrants = input.isOwner
    ? []
    : input.role?.permissionGrants ?? []
  const enabledModules = buildPopAccessEnabledModules({
    businessTypeName: subscription.businessTypeName,
    extraModules: input.extraModules,
    allModules: limits.allModules,
    permissionGrants,
    isOwner: input.isOwner,
  })
  const fiscal = mapPopAccessFiscal({
    fiscalCuit: input.pop.fiscal_cuit ?? null,
    settings: input.pop.settings,
  })

  return {
    pop: {
      id: String(input.pop.id),
      name: String(input.pop.name ?? "").trim(),
      imageUrl: input.pop.image_url ?? null,
      backgroundImageUrl:
        input.pop.background_image_url != null
          ? String(input.pop.background_image_url).trim() || null
          : null,
      siteId: siteIdFromPopRow({
        site_id: input.pop.site_id,
        settings: input.pop.settings,
      }),
      streetAddress: input.pop.street_address ?? null,
      isActive: Boolean(input.pop.is_active),
    },
    subscription,
    enabledModules,
    limits,
    fiscal,
    isOwner: input.isOwner,
    role: input.role,
    canEnter: Boolean(input.pop.is_active) && subscription.isActive,
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

async function loadUserPopIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string[]> {
  const [{ data: ownedRows }, { data: memberRows }] = await Promise.all([
    supabase.from("pops").select("id").eq("owner_user_id", userId),
    supabase
      .from("user_pop_roles")
      .select("pop_id")
      .eq("user_id", userId)
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

/** Cache `_user-pop-ids` — POPs propios + POPs con rol activo. */
export async function getUserPopIdsCache(): Promise<UserPopIdsCache> {
  const user = await requireAuthenticatedUser()
  const supabase = await createClient()
  return loadUserPopIds(supabase, user.uid)
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

  if (!isOwner) {
    const { data: membership } = await supabase
      .from("user_pop_roles")
      .select(
        `
        pop_id,
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
  }

  const [subscriptionRes, extraRes] = await Promise.all([
    supabase.rpc("get_pop_subscription_info", { pop_id: popId }),
    pop.subscription_id
      ? supabase
          .from("_pop_subscriptions")
          .select("extra_modules")
          .eq("id", pop.subscription_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  if (
    subscriptionRes.error ||
    !subscriptionRes.data ||
    subscriptionRes.data.length === 0
  ) {
    return null
  }

  return assemblePopAccess({
    pop,
    isOwner,
    role,
    subscriptionRaw: subscriptionRes.data[0] as Record<string, unknown>,
    extraModules: parseExtraModuleEntries(extraRes.data?.extra_modules),
  })
}

/** Un solo access para todos los POPs del usuario. */
export async function getUserPopsAccessBatch(): Promise<UserPopsAccessBatchCache> {
  const user = await requireAuthenticatedUser()
  const supabase = await createClient()
  const popIds = await loadUserPopIds(supabase, user.uid)
  if (popIds.length === 0) {
    return { popIds, accessByPopId: {} }
  }

  const [{ data: popRows }, { data: memberRows }] = await Promise.all([
    supabase.from("pops").select(POP_ACCESS_SELECT).in("id", popIds),
    supabase
      .from("user_pop_roles")
      .select(
        `
        pop_id,
        roles:role_id ( name, display_name, permission_grants, pop_id )
      `,
      )
      .eq("user_id", user.uid)
      .in("pop_id", popIds)
      .eq("is_active", true),
  ])

  const roleByPopId = new Map<string, PopAccessRole>()
  for (const row of (memberRows ?? []) as MemberRoleRow[]) {
    const popId = String(row.pop_id)
    const roleRaw = Array.isArray(row.roles) ? row.roles[0] : row.roles
    if (!roleRaw || !roleMatchesPop(roleRaw.pop_id, popId)) continue
    const role = mapMemberRole(roleRaw)
    if (role) roleByPopId.set(popId, role)
  }

  const pops = (popRows ?? []) as PopAccessRow[]
  const subscriptionIds = [
    ...new Set(
      pops
        .map((pop) => pop.subscription_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ]
  const extraBySubscriptionId = new Map<
    string,
    ReturnType<typeof parseExtraModuleEntries>
  >()
  if (subscriptionIds.length > 0) {
    const { data: extraRows } = await supabase
      .from("_pop_subscriptions")
      .select("id, extra_modules")
      .in("id", subscriptionIds)
    for (const row of extraRows ?? []) {
      extraBySubscriptionId.set(
        String(row.id),
        parseExtraModuleEntries(row.extra_modules),
      )
    }
  }

  const perPopExtras = await Promise.all(
    pops.map(async (pop) => {
      const subscriptionRes = await supabase.rpc("get_pop_subscription_info", {
        pop_id: pop.id,
      })
      return { pop, subscriptionRes }
    }),
  )

  const accessByPopId: Record<string, PopAccessCache> = {}
  for (const { pop, subscriptionRes } of perPopExtras) {
    const isOwner = String(pop.owner_user_id) === user.uid
    const role = isOwner ? null : roleByPopId.get(String(pop.id)) ?? null
    if (!isOwner && !role) continue
    if (
      subscriptionRes.error ||
      !subscriptionRes.data ||
      subscriptionRes.data.length === 0
    ) {
      continue
    }
    accessByPopId[String(pop.id)] = assemblePopAccess({
      pop,
      isOwner,
      role,
      subscriptionRaw: subscriptionRes.data[0] as Record<string, unknown>,
      extraModules: pop.subscription_id
        ? extraBySubscriptionId.get(pop.subscription_id) ?? []
        : [],
    })
  }

  return { popIds, accessByPopId }
}
