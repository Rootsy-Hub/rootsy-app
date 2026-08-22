"use server"

import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { getAppBaseUrl } from "@/lib/appUrl"
import { sendResendEmail } from "@/lib/email/sendResendEmail"
import { buildPopInvitationEmail } from "@/lib/email/templates/popInvitationEmail"
import { POP_PERMS, permissionKeysInclude } from "@/lib/popPermissionConstants"
import {
  getPopById,
  getPopSiteId,
  validatePopAccess,
} from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import {
  buildHrPermissionCatalogRows,
  type HrPermissionCatalogRow,
} from "@/lib/hrPermissionCatalog"
import {
  ensureEmployeesFromMembers,
  listPopEmployees,
} from "@/app/[siteId]/[popId]/hr/employeeActions"
import type { EmployeeRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import { createClient } from "@/utils/supabase/server"
import { createServiceRoleClient } from "@/utils/supabase/service-role"

export type PopRoleRow = {
  id: string
  name: string
  displayName: string
  description: string | null
  isSystem: boolean
  popId: string | null
}

export type MemberRow = {
  userId: string
  roleId: string
  roleDisplayName: string
  roleName: string
  firstName: string
  lastName: string
  imageUrl: string | null
  invitedAt: string | null
  isOwner: boolean
  isActive: boolean
}

export type PendingInviteRow = {
  id: string
  email: string
  employeeId: string | null
  roleId: string
  roleDisplayName: string
  message: string | null
  createdAt: string
  expiresAt: string
  inviteUrl: string
}

export type PermissionCatalogRow = HrPermissionCatalogRow

type RpcOkJson = { ok?: boolean; error?: string; role_id?: string }

function mapRoleRpcError(code: string | undefined): string {
  const m: Record<string, string> = {
    not_authenticated: "Tenés que iniciar sesión.",
    forbidden: "Solo el dueño del punto de venta puede gestionar roles.",
    not_found: "Rol no encontrado.",
    invalid_role:
      "Solo se pueden editar o eliminar roles propios de este punto de venta (no roles de sistema).",
    cannot_delete_owner: "No se puede eliminar el rol de propietario.",
    role_in_use:
      "No se puede eliminar: hay miembros activos con este rol en el POP. Reasignalos o desvinculalos primero.",
    invalid_permission: "Algún permiso enviado no es válido.",
    invalid_display_name: "El nombre del rol es obligatorio.",
  }
  return m[code || ""] || "No se pudo completar la operación."
}

function sameUserId(a: string, b: string): boolean {
  const norm = (s: string) => s.replace(/-/g, "").toLowerCase().trim()
  return norm(a) === norm(b)
}

async function isPopOwner(
  popId: string,
  userId: string,
  ownerUserId: string | null,
): Promise<boolean> {
  if (ownerUserId && sameUserId(ownerUserId, userId)) return true
  return false
}

export async function getPopHrDashboard(popId: string): Promise<
  | {
      success: true
      popName: string
      isOwner: boolean
      canManageInvites: boolean
      canManagePeople: boolean
      permissionKeys: string[]
      roles: PopRoleRow[]
      members: MemberRow[]
      employees: EmployeeRow[]
      pendingInvites: PendingInviteRow[]
    }
  | { success: false; error: string; redirect?: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess) {
      return {
        success: false,
        error: access.error || "Sin acceso",
        redirect: "/home",
      }
    }
    if (!access.isActive) {
      return {
        success: false,
        error: access.error || "POP inactivo",
        redirect: "/home",
      }
    }

    const permSnapshot = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        permSnapshot.keys,
        POP_PERMS.HR_READ.resource,
        POP_PERMS.HR_READ.action,
      )
    ) {
      return {
        success: false,
        error:
          "No tenés permiso para ver Recursos humanos en este punto de venta.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
      }
    }

    const user = await requireAuthenticatedUser()
    const supabase = await createClient()
    const popRes = await getPopById(popId, { includeOwnerUserId: true })
    if (!popRes.success || !popRes.pop) {
      return {
        success: false,
        error: popRes.error || "POP no encontrado",
        redirect: "/home",
      }
    }

    const ownerUserId =
      "ownerUserId" in popRes.pop ? popRes.pop.ownerUserId : null
    const owner = await isPopOwner(popId, user.uid, ownerUserId ?? null)

    const { data: roleRows, error: rolesErr } = await supabase
      .from("roles")
      .select("id, name, display_name, description, is_system, pop_id")
      .or(`pop_id.is.null,pop_id.eq.${popId}`)
      .order("display_name")

    if (rolesErr) {
      return { success: false, error: rolesErr.message }
    }

    const roles: PopRoleRow[] = (roleRows || []).map((r) => ({
      id: r.id,
      name: r.name,
      displayName: r.display_name,
      description: r.description ?? null,
      isSystem: Boolean(r.is_system),
      popId: r.pop_id ?? null,
    }))

    const { data: uprRows, error: uprErr } = await supabase
      .from("user_pop_roles")
      .select(
        `
        user_id,
        role_id,
        invited_at,
        is_active,
        roles:role_id ( name, display_name )
      `,
      )
      .eq("pop_id", popId)

    if (uprErr) {
      return { success: false, error: uprErr.message }
    }

    const userIds = [...new Set((uprRows || []).map((r) => r.user_id))]
    const profileMap: Record<
      string,
      { first_name: string; last_name: string; image_url: string | null }
    > = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("users")
        .select("id, first_name, last_name, image_url")
        .in("id", userIds)
      for (const p of profiles || []) {
        profileMap[p.id] = {
          first_name: p.first_name ?? "",
          last_name: p.last_name ?? "",
          image_url: p.image_url ?? null,
        }
      }
    }

    let ownerProfile = {
      first_name: "",
      last_name: "",
      image_url: null as string | null,
    }
    if (ownerUserId && !userIds.includes(ownerUserId)) {
      const { data: op } = await supabase
        .from("users")
        .select("first_name, last_name, image_url")
        .eq("id", ownerUserId)
        .maybeSingle()
      if (op) {
        ownerProfile = {
          first_name: op.first_name ?? "",
          last_name: op.last_name ?? "",
          image_url: op.image_url ?? null,
        }
      }
    }

    const members: MemberRow[] = (uprRows || []).map((row) => {
      const rel = row.roles as unknown as {
        name: string
        display_name: string
      } | null
      const prof = profileMap[row.user_id] || {
        first_name: "",
        last_name: "",
        image_url: null,
      }
      return {
        userId: row.user_id,
        roleId: row.role_id,
        roleDisplayName: rel?.display_name ?? "—",
        roleName: rel?.name ?? "",
        firstName: prof.first_name,
        lastName: prof.last_name,
        imageUrl: prof.image_url,
        invitedAt: row.invited_at ?? null,
        isOwner: ownerUserId ? sameUserId(row.user_id, ownerUserId) : false,
        isActive: row.is_active !== false,
      }
    })

    if (ownerUserId && !members.some((m) => m.userId === ownerUserId)) {
      members.unshift({
        userId: ownerUserId,
        roleId: "",
        roleDisplayName: "Propietario",
        roleName: "owner",
        firstName: ownerProfile.first_name,
        lastName: ownerProfile.last_name,
        imageUrl: ownerProfile.image_url,
        invitedAt: null,
        isOwner: true,
        isActive: true,
      })
    }

    let pendingInvites: PendingInviteRow[] = []
    if (owner) {
      const { data: inv, error: invErr } = await supabase
        .from("pop_invitations")
        .select(
          `
          id,
          email,
          employee_id,
          role_id,
          message,
          created_at,
          expires_at,
          token,
          roles:role_id ( display_name )
        `,
        )
        .eq("pop_id", popId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (!invErr && inv) {
        const appBase = getAppBaseUrl()
        pendingInvites = inv.map((i) => {
          const rr = i.roles as unknown as { display_name: string } | null
          return {
            id: i.id,
            email: i.email,
            employeeId: i.employee_id ? String(i.employee_id) : null,
            roleId: i.role_id,
            roleDisplayName: rr?.display_name ?? "—",
            message: i.message ?? null,
            createdAt: i.created_at,
            expiresAt: i.expires_at,
            inviteUrl: i.token ? `${appBase}/invite/pop/${i.token}` : "",
          }
        })
      }
    }

    await ensureEmployeesFromMembers(popId, members)
    const peopleRes = await listPopEmployees(popId)
    const employees = peopleRes.success ? peopleRes.employees : []
    const canManagePeople =
      owner ||
      permissionKeysInclude(permSnapshot.keys, "hr", "create") ||
      permissionKeysInclude(permSnapshot.keys, "hr", "update")

    return {
      success: true,
      popName: popRes.pop.name,
      isOwner: owner,
      canManageInvites: owner,
      canManagePeople,
      permissionKeys: permSnapshot.keys,
      roles,
      members,
      employees,
      pendingInvites,
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: msg }
  }
}

export async function inviteUserToPop(
  popId: string,
  emailRaw: string,
  roleId: string,
  message?: string | null,
  employeeId?: string | null,
): Promise<
  | {
      success: true
      emailSent: boolean
      inviteUrl: string
      emailError?: string
      resendConfigured: boolean
    }
  | { success: false; error: string }
> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso al POP" }
  }

  const user = await requireAuthenticatedUser()
  const supabase = await createClient()
  const popRes = await getPopById(popId, { includeOwnerUserId: true })
  if (!popRes.success || !popRes.pop) {
    return { success: false, error: "POP no encontrado" }
  }
  const ownerUserId =
    "ownerUserId" in popRes.pop ? popRes.pop.ownerUserId : null
  if (!(await isPopOwner(popId, user.uid, ownerUserId ?? null))) {
    return {
      success: false,
      error: "Solo el dueño del punto de venta puede enviar invitaciones.",
    }
  }

  const linkedEmployeeId = employeeId?.trim() || ""
  if (!linkedEmployeeId) {
    return {
      success: false,
      error: "El acceso se da desde la ficha de la persona.",
    }
  }

  const { data: employee, error: employeeErr } = await supabase
    .from("pop_employees")
    .select("id, email, user_id, left_at, first_name, last_name")
    .eq("pop_id", popId)
    .eq("id", linkedEmployeeId)
    .maybeSingle()

  if (employeeErr) return { success: false, error: employeeErr.message }
  if (!employee) {
    return { success: false, error: "No encontramos a esa persona." }
  }
  if (employee.left_at) {
    return { success: false, error: "Esa persona ya no trabaja en este local." }
  }
  if (employee.user_id) {
    return { success: false, error: "Esa persona ya entra a Rootsy." }
  }

  const email = (employee.email || emailRaw).trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      error: "Cargá el correo en la ficha antes de dar acceso.",
    }
  }

  if (user.email && user.email.trim().toLowerCase() === email) {
    return { success: false, error: "No podés invitarte a vos mismo." }
  }

  const { data: inviteeId } = await supabase.rpc(
    "lookup_auth_user_id_for_pop_owner_invite",
    { p_pop_id: popId, p_email: email },
  )

  if (inviteeId && sameUserId(user.uid, inviteeId as string)) {
    return { success: false, error: "No podés invitarte a vos mismo." }
  }

  const { data: roleRow, error: roleErr } = await supabase
    .from("roles")
    .select("id, name, pop_id")
    .eq("id", roleId)
    .single()

  if (roleErr || !roleRow) {
    return { success: false, error: "Rol no válido." }
  }
  if (roleRow.name === "owner") {
    return {
      success: false,
      error: "No se puede asignar el rol Propietario por invitación.",
    }
  }
  if (roleRow.pop_id != null && String(roleRow.pop_id) !== String(popId)) {
    return { success: false, error: "Ese rol no pertenece a este POP." }
  }

  if (inviteeId) {
    const { data: existingMember } = await supabase
      .from("user_pop_roles")
      .select("id")
      .eq("pop_id", popId)
      .eq("user_id", inviteeId)
      .eq("is_active", true)
      .maybeSingle()

    if (existingMember) {
      return {
        success: false,
        error: "Ese usuario ya es miembro activo de este punto de venta.",
      }
    }
  }

  const { data: inserted, error: insErr } = await supabase
    .from("pop_invitations")
    .insert({
      pop_id: popId,
      email,
      employee_id: linkedEmployeeId,
      role_id: roleId,
      invited_by: user.uid,
      message: message?.trim() || null,
    })
    .select("token")
    .single()

  if (insErr) {
    if (insErr.code === "23505") {
      return {
        success: false,
        error: "Ya hay una invitación pendiente para esa persona.",
      }
    }
    return { success: false, error: insErr.message }
  }

  const base = getAppBaseUrl()
  const inviteUrl = `${base}/invite/pop/${inserted.token}`

  const invitationEmail = buildPopInvitationEmail({
    popName: popRes.pop.name,
    inviteUrl,
    message,
  })

  const resendConfigured = Boolean(process.env.RESEND_API_KEY?.trim())
  const { sent, error: emailError } = await sendResendEmail({
    to: email,
    subject: invitationEmail.subject,
    html: invitationEmail.html,
    text: invitationEmail.text,
  })

  return {
    success: true,
    emailSent: sent,
    inviteUrl,
    emailError,
    resendConfigured,
  }
}

export async function revokePopInvitation(
  popId: string,
  invitationId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuthenticatedUser()
  const supabase = await createClient()
  const popRes = await getPopById(popId, { includeOwnerUserId: true })
  if (!popRes.success || !popRes.pop) {
    return { success: false, error: "POP no encontrado" }
  }
  const ownerUserId =
    "ownerUserId" in popRes.pop ? popRes.pop.ownerUserId : null
  if (!(await isPopOwner(popId, user.uid, ownerUserId ?? null))) {
    return { success: false, error: "Sin permiso" }
  }

  const { error } = await supabase
    .from("pop_invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId)
    .eq("pop_id", popId)
    .eq("status", "pending")

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function renewPopInvitation(
  popId: string,
  invitationId: string,
): Promise<{ success: boolean; error?: string; inviteUrl?: string }> {
  const user = await requireAuthenticatedUser()
  const supabase = await createClient()
  const popRes = await getPopById(popId, { includeOwnerUserId: true })
  if (!popRes.success || !popRes.pop) {
    return { success: false, error: "POP no encontrado" }
  }
  const ownerUserId =
    "ownerUserId" in popRes.pop ? popRes.pop.ownerUserId : null
  if (!(await isPopOwner(popId, user.uid, ownerUserId ?? null))) {
    return { success: false, error: "Sin permiso" }
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from("pop_invitations")
    .update({ expires_at: expiresAt })
    .eq("id", invitationId)
    .eq("pop_id", popId)
    .eq("status", "pending")
    .select("token")
    .maybeSingle()

  if (error) return { success: false, error: error.message }
  if (!data) {
    return { success: false, error: "No encontramos esa invitación." }
  }

  return {
    success: true,
    inviteUrl: data.token ? `${getAppBaseUrl()}/invite/pop/${data.token}` : "",
  }
}

export async function deactivatePopMember(
  popId: string,
  memberUserId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuthenticatedUser()
  const supabase = await createClient()
  const popRes = await getPopById(popId, { includeOwnerUserId: true })
  if (!popRes.success || !popRes.pop) {
    return { success: false, error: "POP no encontrado" }
  }
  const ownerUserId =
    "ownerUserId" in popRes.pop ? popRes.pop.ownerUserId : null
  if (!(await isPopOwner(popId, user.uid, ownerUserId ?? null))) {
    return { success: false, error: "Sin permiso" }
  }
  if (ownerUserId && sameUserId(memberUserId, ownerUserId)) {
    return {
      success: false,
      error: "No se puede quitar al propietario del POP.",
    }
  }

  const { error } = await supabase
    .from("user_pop_roles")
    .update({ is_active: false })
    .eq("pop_id", popId)
    .eq("user_id", memberUserId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function updatePopMemberRole(
  popId: string,
  memberUserId: string,
  roleId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuthenticatedUser()
  const supabase = await createClient()
  const popRes = await getPopById(popId, { includeOwnerUserId: true })
  if (!popRes.success || !popRes.pop) {
    return { success: false, error: "POP no encontrado" }
  }
  const ownerUserId =
    "ownerUserId" in popRes.pop ? popRes.pop.ownerUserId : null
  if (!(await isPopOwner(popId, user.uid, ownerUserId ?? null))) {
    return {
      success: false,
      error: "Solo el dueño puede cambiar el rol de Rootsy.",
    }
  }
  if (ownerUserId && sameUserId(memberUserId, ownerUserId)) {
    return {
      success: false,
      error: "El rol del dueño no se cambia desde acá.",
    }
  }

  const { data: roleRow, error: roleErr } = await supabase
    .from("roles")
    .select("id, name, pop_id")
    .eq("id", roleId)
    .single()

  if (roleErr || !roleRow) {
    return { success: false, error: "Rol no válido." }
  }
  if (roleRow.name === "owner") {
    return {
      success: false,
      error: "No se puede asignar el rol de dueño.",
    }
  }
  if (roleRow.pop_id != null && String(roleRow.pop_id) !== String(popId)) {
    return { success: false, error: "Ese rol no pertenece a este local." }
  }

  const { data: membership, error: memberErr } = await supabase
    .from("user_pop_roles")
    .select("id, role_id")
    .eq("pop_id", popId)
    .eq("user_id", memberUserId)
    .eq("is_active", true)
    .maybeSingle()

  if (memberErr) return { success: false, error: memberErr.message }
  if (!membership) {
    return {
      success: false,
      error: "Esa persona no tiene acceso activo a Rootsy.",
    }
  }
  if (membership.role_id === roleId) {
    return { success: true }
  }

  const { error } = await supabase
    .from("user_pop_roles")
    .update({ role_id: roleId })
    .eq("id", membership.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function deleteInactivePopMember(
  popId: string,
  memberUserId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuthenticatedUser()
  const popRes = await getPopById(popId, { includeOwnerUserId: true })
  if (!popRes.success || !popRes.pop) {
    return { success: false, error: "POP no encontrado" }
  }
  const ownerUserId =
    "ownerUserId" in popRes.pop ? popRes.pop.ownerUserId : null
  if (!(await isPopOwner(popId, user.uid, ownerUserId ?? null))) {
    return { success: false, error: "Sin permiso" }
  }
  if (ownerUserId && sameUserId(memberUserId, ownerUserId)) {
    return {
      success: false,
      error: "No se puede eliminar al propietario del POP.",
    }
  }

  const admin = createServiceRoleClient()
  const { error } = await admin
    .from("user_pop_roles")
    .delete()
    .eq("pop_id", popId)
    .eq("user_id", memberUserId)
    .eq("is_active", false)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function getRolePermissionsEditorData(
  popId: string,
  roleId: string,
): Promise<
  | {
      success: true
      role: { id: string; displayName: string; name: string }
      permissions: PermissionCatalogRow[]
      selectedGrantKeys: string[]
    }
  | { success: false; error: string }
> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso al POP" }
  }

  const user = await requireAuthenticatedUser()
  const supabase = await createClient()
  const popRes = await getPopById(popId, { includeOwnerUserId: true })
  if (!popRes.success || !popRes.pop) {
    return { success: false, error: "POP no encontrado" }
  }
  const ownerUserId =
    "ownerUserId" in popRes.pop ? popRes.pop.ownerUserId : null
  if (!(await isPopOwner(popId, user.uid, ownerUserId ?? null))) {
    return {
      success: false,
      error: "Solo el dueño puede editar permisos de roles.",
    }
  }

  const { data: roleRow, error: roleErr } = await supabase
    .from("roles")
    .select("id, name, display_name, pop_id, permission_grants")
    .eq("id", roleId)
    .single()

  if (roleErr || !roleRow) {
    return { success: false, error: "Rol no encontrado." }
  }
  if (roleRow.pop_id == null || String(roleRow.pop_id) !== String(popId)) {
    return {
      success: false,
      error:
        "Solo se pueden editar roles creados para este punto de venta (no los roles de sistema).",
    }
  }

  const catalog = buildHrPermissionCatalogRows()
  const catalogKeys = new Set(catalog.map((c) => c.key))
  const raw = roleRow.permission_grants
  const fromRole = Array.isArray(raw)
    ? raw.filter((x): x is string => typeof x === "string")
    : []
  const selectedGrantKeys = fromRole.filter((k) => catalogKeys.has(k))

  return {
    success: true,
    role: {
      id: roleRow.id,
      displayName: roleRow.display_name,
      name: roleRow.name,
    },
    permissions: catalog,
    selectedGrantKeys,
  }
}

export async function savePopRolePermissions(
  popId: string,
  roleId: string,
  grantKeys: string[],
): Promise<{ success: true } | { success: false; error: string }> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso al POP" }
  }

  const user = await requireAuthenticatedUser()
  const supabase = await createClient()
  const popRes = await getPopById(popId, { includeOwnerUserId: true })
  if (!popRes.success || !popRes.pop) {
    return { success: false, error: "POP no encontrado" }
  }
  const ownerUserId =
    "ownerUserId" in popRes.pop ? popRes.pop.ownerUserId : null
  if (!(await isPopOwner(popId, user.uid, ownerUserId ?? null))) {
    return { success: false, error: "Sin permiso." }
  }

  const keys = [...new Set(grantKeys.map((x) => x.trim()).filter(Boolean))]

  const { data, error } = await supabase.rpc("hr_pop_owner_sync_role_permissions", {
    p_pop_id: popId,
    p_role_id: roleId,
    p_permission_grants: keys,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const payload = data as RpcOkJson | null
  if (!payload?.ok) {
    return {
      success: false,
      error: mapRoleRpcError(payload?.error),
    }
  }

  return { success: true }
}

export async function createPopRole(
  popId: string,
  displayName: string,
  grantKeys: string[],
): Promise<
  | { success: true; roleId: string }
  | { success: false; error: string }
> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso al POP" }
  }

  const user = await requireAuthenticatedUser()
  const supabase = await createClient()
  const popRes = await getPopById(popId, { includeOwnerUserId: true })
  if (!popRes.success || !popRes.pop) {
    return { success: false, error: "POP no encontrado" }
  }
  const ownerUserId =
    "ownerUserId" in popRes.pop ? popRes.pop.ownerUserId : null
  if (!(await isPopOwner(popId, user.uid, ownerUserId ?? null))) {
    return { success: false, error: "Sin permiso." }
  }

  const keys = [...new Set(grantKeys.map((x) => x.trim()).filter(Boolean))]

  const { data, error } = await supabase.rpc("hr_pop_owner_create_pop_role", {
    p_pop_id: popId,
    p_display_name: displayName.trim(),
    p_permission_grants: keys,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const payload = data as RpcOkJson | null
  if (!payload?.ok || !payload.role_id) {
    return {
      success: false,
      error: mapRoleRpcError(payload?.error),
    }
  }

  return { success: true, roleId: String(payload.role_id) }
}

export async function deletePopRole(
  popId: string,
  roleId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso al POP" }
  }

  const user = await requireAuthenticatedUser()
  const supabase = await createClient()
  const popRes = await getPopById(popId, { includeOwnerUserId: true })
  if (!popRes.success || !popRes.pop) {
    return { success: false, error: "POP no encontrado" }
  }
  const ownerUserId =
    "ownerUserId" in popRes.pop ? popRes.pop.ownerUserId : null
  if (!(await isPopOwner(popId, user.uid, ownerUserId ?? null))) {
    return { success: false, error: "Sin permiso." }
  }

  const { data, error } = await supabase.rpc("hr_pop_owner_delete_pop_role", {
    p_pop_id: popId,
    p_role_id: roleId,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const payload = data as RpcOkJson | null
  if (!payload?.ok) {
    return {
      success: false,
      error: mapRoleRpcError(payload?.error),
    }
  }

  return { success: true }
}
