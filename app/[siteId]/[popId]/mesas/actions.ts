"use server"

import type {
  MesaFloorDecorKind,
  MesaReservationInput,
  MesaReservationStatus,
  MesaTableShape,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import { readCheckoutFromSessionMetadata, readFloorStatusFromSessionMetadata, floorStatusToSessionMetadataValue, type MesaSessionFloorStatus } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import { buildUnpaidCarrito } from "@/lib/partialCheckoutSelection"
import { requireAuthenticatedUser } from "@/lib/authHelpers"
import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import {
  getPopSiteId,
  validatePopAccess,
} from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { readMesasReservationSettings, type MesasReservationSettings } from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import { createClient } from "@/utils/supabase/server"

export type MesasSalonRow = {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
}

export type MesasTableRow = {
  id: string
  salonId: string
  label: string
  shape: MesaTableShape
  x: number
  y: number
  rotation: number
  seats: number
  sortOrder: number
  isActive: boolean
}

export type MesasFloorDecorRow = {
  id: string
  salonId: string
  kind: MesaFloorDecorKind
  x: number
  y: number
  width: number
  height: number
  rotation: number
  label: string
  sortOrder: number
  isActive: boolean
}

export type MesasLayoutData = {
  salons: MesasSalonRow[]
  tables: MesasTableRow[]
  decors: MesasFloorDecorRow[]
}

export type MesasAccessSnapshot = {
  canRead: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

export type UpsertMesasSalonInput = {
  id?: string
  name: string
  sortOrder: number
  isActive: boolean
}

export type UpsertMesasTableInput = {
  id?: string
  salonId: string
  label: string
  shape: MesaTableShape
  x: number
  y: number
  seats: number
  sortOrder: number
  isActive: boolean
}

export type UpsertMesasFloorDecorInput = {
  id?: string
  salonId: string
  kind: MesaFloorDecorKind
  x: number
  y: number
  width: number
  height: number
  label: string
  sortOrder: number
  isActive: boolean
}

const MESAS_TABLE_SELECT =
  "id, salon_id, label, name, pos_x, pos_y, rotation_deg, shape, capacity, sort_order, is_active"

const MESAS_DECOR_SELECT =
  "id, salon_id, kind, pos_x, pos_y, rotation_deg, width, height, label, sort_order, is_active"

function mapMesasTableRow(data: {
  id: string
  salon_id: string | null
  label: string | null
  name: string | null
  pos_x: unknown
  pos_y: unknown
  rotation_deg?: unknown
  shape: unknown
  capacity: unknown
  sort_order: number | null
  is_active: boolean | null
}): MesasTableRow {
  return {
    id: data.id,
    salonId: data.salon_id as string,
    label: (data.label || data.name || "").trim(),
    shape: parseShape(data.shape),
    x: parsePos(data.pos_x),
    y: parsePos(data.pos_y),
    rotation: parseRotation(data.rotation_deg),
    seats: parsePositiveInt(data.capacity, 4),
    sortOrder: data.sort_order ?? 0,
    isActive: Boolean(data.is_active),
  }
}

function mapMesasDecorRow(data: {
  id: string
  salon_id: string
  kind: unknown
  pos_x: unknown
  pos_y: unknown
  rotation_deg?: unknown
  width: unknown
  height: unknown
  label: unknown
  sort_order: number | null
  is_active: boolean | null
}): MesasFloorDecorRow | null {
  const kind = parseDecorKind(data.kind)
  if (!kind) return null
  return {
    id: data.id,
    salonId: data.salon_id,
    kind,
    x: parsePos(data.pos_x),
    y: parsePos(data.pos_y),
    width: parsePositiveInt(data.width, 48),
    height: parsePositiveInt(data.height, 48),
    rotation: parseRotation(data.rotation_deg),
    label: typeof data.label === "string" ? data.label : "",
    sortOrder: data.sort_order ?? 0,
    isActive: Boolean(data.is_active),
  }
}

const DECOR_KINDS: MesaFloorDecorKind[] = [
  "wall_h",
  "wall_v",
  "plant",
  "planter",
  "pillar",
  "bar",
  "entrance",
]

const ROUND_SIZES = new Set(["s", "m", "l", "xl"])
const SQUARE_SIZES = new Set(["s", "m", "l"])
const RECT_SIZES = new Set(["s", "m", "l", "xl"])
const RECT_SIZE_ALIASES: Record<string, "s" | "m" | "l" | "xl"> = {
  s: "s",
  sm: "s",
  m: "m",
  md: "m",
  l: "l",
  lg: "l",
  xl: "xl",
}

function siteIdsMatchClientRoute(
  routeSiteId: string,
  popSiteId: string,
): boolean {
  return routeSiteId.trim().toLowerCase() === popSiteId.trim().toLowerCase()
}

function parseShape(raw: unknown): MesaTableShape {
  if (raw == null || typeof raw !== "object") {
    return { kind: "round", size: "m" }
  }
  const o = raw as Record<string, unknown>
  const kind = o.kind
  const size = o.size
  if (kind === "round" && typeof size === "string" && ROUND_SIZES.has(size)) {
    return { kind: "round", size: size as "s" | "m" | "l" | "xl" }
  }
  if (kind === "square" && typeof size === "string" && SQUARE_SIZES.has(size)) {
    return { kind: "square", size: size as "s" | "m" | "l" }
  }
  if (kind === "rect" && typeof size === "string") {
    const normalized = RECT_SIZE_ALIASES[size]
    if (normalized && RECT_SIZES.has(normalized)) {
      return { kind: "rect", size: normalized }
    }
  }
  return { kind: "round", size: "m" }
}

function parseRotation(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return ((Math.round(n) % 360) + 360) % 360
}

function shapeToJson(shape: MesaTableShape): Record<string, string> {
  return { kind: shape.kind, size: shape.size }
}

function parseDecorKind(raw: unknown): MesaFloorDecorKind | null {
  if (typeof raw !== "string") return null
  return DECOR_KINDS.includes(raw as MesaFloorDecorKind)
    ? (raw as MesaFloorDecorKind)
    : null
}

function parsePos(v: unknown, fallback = 48): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(8, Math.round(n))
}

function parsePositiveInt(v: unknown, fallback: number): number {
  const n = Number.parseInt(String(v), 10)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return n
}

async function requireMesasAccess(
  popId: string,
  routeSiteId: string,
  mode: "read" | "create" | "update" | "delete",
): Promise<
  | {
      ok: true
      supabase: Awaited<ReturnType<typeof createClient>>
      userId: string
    }
  | { ok: false; error: string; redirect?: string }
> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return {
      ok: false,
      error: access.error || "Sin acceso al punto de venta",
      redirect: "/home",
    }
  }

  const popSiteId = await getPopSiteId(popId)
  if (!popSiteId) {
    return { ok: false, error: "POP no encontrado" }
  }
  if (!siteIdsMatchClientRoute(routeSiteId, popSiteId)) {
    return {
      ok: false,
      error: "Ruta inválida para este punto de venta",
      redirect: popMenuHref(popSiteId, popId),
    }
  }

  const user = await requireAuthenticatedUser()
  const perms = await loadPopPermissionsSnapshot(popId)
  const perm =
    mode === "read"
      ? POP_PERMS.MESAS_READ
      : mode === "create"
        ? POP_PERMS.MESAS_CREATE
        : mode === "update"
          ? POP_PERMS.MESAS_UPDATE
          : POP_PERMS.MESAS_DELETE

  if (!permissionKeysInclude(perms.keys, perm.resource, perm.action)) {
    return { ok: false, error: "Sin permiso para esta acción en Mesas." }
  }

  const supabase = await createClient()
  return { ok: true, supabase, userId: user.uid }
}

export async function getMesasAccessSnapshot(
  popId: string,
): Promise<MesasAccessSnapshot> {
  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return {
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    }
  }

  try {
    const user = await requireAuthenticatedUser()
    const perms = await loadPopPermissionsSnapshot(popId)
    const keys = perms.keys
    return {
      canRead: permissionKeysInclude(
        keys,
        POP_PERMS.MESAS_READ.resource,
        POP_PERMS.MESAS_READ.action,
      ),
      canCreate: permissionKeysInclude(
        keys,
        POP_PERMS.MESAS_CREATE.resource,
        POP_PERMS.MESAS_CREATE.action,
      ),
      canUpdate: permissionKeysInclude(
        keys,
        POP_PERMS.MESAS_UPDATE.resource,
        POP_PERMS.MESAS_UPDATE.action,
      ),
      canDelete: permissionKeysInclude(
        keys,
        POP_PERMS.MESAS_DELETE.resource,
        POP_PERMS.MESAS_DELETE.action,
      ),
    }
  } catch {
    return {
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    }
  }
}

export type MesasWaiterRow = {
  id: string
  name: string
  initials: string
}

function isMozoRole(roleName: string, roleDisplayName: string): boolean {
  const name = roleName.trim().toLowerCase()
  const display = roleDisplayName.trim().toLowerCase()
  return (
    name === "mozo" ||
    name === "mozos" ||
    display === "mozo" ||
    display === "mozos"
  )
}

function mesasWaiterDisplayName(firstName: string, lastName: string): string {
  const full = `${firstName} ${lastName}`.trim()
  return full || "Sin nombre"
}

function mesasWaiterInitials(firstName: string, lastName: string): string {
  const a = firstName.trim().charAt(0)
  const b = lastName.trim().charAt(0)
  const initials = `${a}${b}`.toUpperCase()
  return initials || "?"
}

export async function getMesasWaiters(
  popId: string,
  routeSiteId: string,
): Promise<
  | { success: true; waiters: MesasWaiterRow[] }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "read")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const { supabase } = gate

  const { data: uprRows, error: uprErr } = await supabase
    .from("user_pop_roles")
    .select(
      `
      user_id,
      roles:role_id ( name, display_name )
    `,
    )
    .eq("pop_id", popId)
    .eq("is_active", true)

  if (uprErr) {
    return { success: false, error: uprErr.message }
  }

  const mozoUserIds = [
    ...new Set(
      (uprRows || [])
        .filter((row) => {
          const rel = row.roles as unknown as {
            name: string
            display_name: string
          } | null
          if (!rel) return false
          return isMozoRole(rel.name, rel.display_name)
        })
        .map((row) => row.user_id),
    ),
  ]

  if (mozoUserIds.length === 0) {
    return { success: true, waiters: [] }
  }

  const { data: profiles, error: profilesErr } = await supabase
    .from("users")
    .select("id, first_name, last_name")
    .in("id", mozoUserIds)

  if (profilesErr) {
    return { success: false, error: profilesErr.message }
  }

  const waiters = (profiles || [])
    .map((p) => {
      const firstName = p.first_name ?? ""
      const lastName = p.last_name ?? ""
      return {
        id: p.id,
        name: mesasWaiterDisplayName(firstName, lastName),
        initials: mesasWaiterInitials(firstName, lastName),
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es"))

  return { success: true, waiters }
}

export async function getMesasLayout(
  popId: string,
  routeSiteId: string,
): Promise<
  | { success: true; data: MesasLayoutData }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "read")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const { supabase } = gate

  const [salonsRes, tablesRes, decorsRes] = await Promise.all([
    supabase
      .from("dining_salons")
      .select("id, name, sort_order, is_active")
      .eq("pop_id", popId)
      .is("deleted_at", null)
      .order("sort_order")
      .order("name"),
    supabase
      .from("dining_tables")
      .select(MESAS_TABLE_SELECT)
      .eq("pop_id", popId)
      .is("deleted_at", null)
      .order("sort_order")
      .order("label"),
    supabase
      .from("dining_floor_decors")
      .select(MESAS_DECOR_SELECT)
      .eq("pop_id", popId)
      .is("deleted_at", null)
      .order("sort_order"),
  ])

  if (salonsRes.error) {
    return { success: false, error: salonsRes.error.message }
  }
  if (tablesRes.error) {
    return { success: false, error: tablesRes.error.message }
  }
  if (decorsRes.error) {
    return { success: false, error: decorsRes.error.message }
  }

  const salons: MesasSalonRow[] = (salonsRes.data || []).map((row) => ({
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order ?? 0,
    isActive: Boolean(row.is_active),
  }))

  const tables: MesasTableRow[] = (tablesRes.data || [])
    .filter((row) => row.salon_id)
    .map((row) => mapMesasTableRow(row))

  const decors: MesasFloorDecorRow[] = (decorsRes.data || [])
    .map((row) => mapMesasDecorRow(row))
    .filter((row): row is MesasFloorDecorRow => row != null)

  return { success: true, data: { salons, tables, decors } }
}

export async function upsertMesasSalon(
  popId: string,
  routeSiteId: string,
  input: UpsertMesasSalonInput,
): Promise<
  | { success: true; salon: MesasSalonRow }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const name = input.name.trim()
  if (!name) {
    return { success: false, error: "El nombre del salón es obligatorio." }
  }

  const payload = {
    pop_id: popId,
    name,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  }

  const { supabase } = gate

  if (input.id) {
    const { data, error } = await supabase
      .from("dining_salons")
      .update(payload)
      .eq("id", input.id)
      .eq("pop_id", popId)
      .is("deleted_at", null)
      .select("id, name, sort_order, is_active")
      .single()

    if (error || !data) {
      return {
        success: false,
        error: error?.message || "No se pudo actualizar el salón.",
      }
    }

    return {
      success: true,
      salon: {
        id: data.id,
        name: data.name,
        sortOrder: data.sort_order ?? 0,
        isActive: Boolean(data.is_active),
      },
    }
  }

  const { data, error } = await supabase
    .from("dining_salons")
    .insert(payload)
    .select("id, name, sort_order, is_active")
    .single()

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "No se pudo crear el salón.",
    }
  }

  return {
    success: true,
    salon: {
      id: data.id,
      name: data.name,
      sortOrder: data.sort_order ?? 0,
      isActive: Boolean(data.is_active),
    },
  }
}

export async function deleteMesasSalon(
  popId: string,
  routeSiteId: string,
  salonId: string,
): Promise<{ success: true } | { success: false; error: string; redirect?: string }> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const { supabase } = gate

  const { count, error: countErr } = await supabase
    .from("dining_tables")
    .select("id", { count: "exact", head: true })
    .eq("pop_id", popId)
    .eq("salon_id", salonId)
    .is("deleted_at", null)

  if (countErr) {
    return { success: false, error: countErr.message }
  }
  if ((count ?? 0) > 0) {
    return {
      success: false,
      error: "No se puede eliminar un salón que todavía tiene mesas.",
    }
  }

  const { error } = await supabase
    .from("dining_salons")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", salonId)
    .eq("pop_id", popId)

  if (error) {
    return { success: false, error: error.message }
  }

  await supabase
    .from("dining_floor_decors")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("salon_id", salonId)
    .eq("pop_id", popId)

  return { success: true }
}

export type MesasSortOrderUpdate = {
  id: string
  sortOrder: number
}

async function applyMesasSortOrderUpdates(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "dining_salons" | "dining_tables" | "dining_floor_decors",
  popId: string,
  updates: MesasSortOrderUpdate[],
): Promise<{ success: true } | { success: false; error: string }> {
  if (updates.length === 0) return { success: true }

  for (const update of updates) {
    const { error } = await supabase
      .from(table)
      .update({ sort_order: Math.max(0, Math.trunc(update.sortOrder)) })
      .eq("id", update.id)
      .eq("pop_id", popId)
      .is("deleted_at", null)

    if (error) {
      return { success: false, error: error.message }
    }
  }

  return { success: true }
}

export async function reorderMesasSalons(
  popId: string,
  routeSiteId: string,
  updates: MesasSortOrderUpdate[],
): Promise<{ success: true } | { success: false; error: string; redirect?: string }> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  return applyMesasSortOrderUpdates(gate.supabase, "dining_salons", popId, updates)
}

export async function reorderMesasTables(
  popId: string,
  routeSiteId: string,
  salonId: string,
  updates: MesasSortOrderUpdate[],
): Promise<{ success: true } | { success: false; error: string; redirect?: string }> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  if (!salonId) {
    return { success: false, error: "Elegí un salón para reordenar mesas." }
  }

  const ids = updates.map((u) => u.id)
  if (ids.length > 0) {
    const { data: validRows, error: validErr } = await gate.supabase
      .from("dining_tables")
      .select("id")
      .eq("pop_id", popId)
      .eq("salon_id", salonId)
      .in("id", ids)
      .is("deleted_at", null)

    if (validErr) {
      return { success: false, error: validErr.message }
    }

    const validIds = new Set((validRows ?? []).map((r) => String(r.id)))
    if (ids.some((id) => !validIds.has(id))) {
      return { success: false, error: "Hay mesas que no pertenecen a este salón." }
    }
  }

  return applyMesasSortOrderUpdates(gate.supabase, "dining_tables", popId, updates)
}

export async function reorderMesasDecors(
  popId: string,
  routeSiteId: string,
  salonId: string,
  updates: MesasSortOrderUpdate[],
): Promise<{ success: true } | { success: false; error: string; redirect?: string }> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  if (!salonId) {
    return { success: false, error: "Elegí un salón para reordenar elementos." }
  }

  const ids = updates.map((u) => u.id)
  if (ids.length > 0) {
    const { data: validRows, error: validErr } = await gate.supabase
      .from("dining_floor_decors")
      .select("id")
      .eq("pop_id", popId)
      .eq("salon_id", salonId)
      .in("id", ids)
      .is("deleted_at", null)

    if (validErr) {
      return { success: false, error: validErr.message }
    }

    const validIds = new Set((validRows ?? []).map((r) => String(r.id)))
    if (ids.some((id) => !validIds.has(id))) {
      return {
        success: false,
        error: "Hay elementos que no pertenecen a este salón.",
      }
    }
  }

  return applyMesasSortOrderUpdates(
    gate.supabase,
    "dining_floor_decors",
    popId,
    updates,
  )
}

export async function upsertMesasTable(
  popId: string,
  routeSiteId: string,
  input: UpsertMesasTableInput,
): Promise<
  | { success: true; table: MesasTableRow }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const label = input.label.trim()
  if (!label) {
    return { success: false, error: "El número o nombre de mesa es obligatorio." }
  }
  if (!input.salonId) {
    return { success: false, error: "Elegí un salón para la mesa." }
  }

  const payload = {
    pop_id: popId,
    salon_id: input.salonId,
    name: label,
    label,
    pos_x: parsePos(input.x),
    pos_y: parsePos(input.y),
    shape: shapeToJson(input.shape),
    capacity: parsePositiveInt(input.seats, 4),
    sort_order: input.sortOrder,
    is_active: input.isActive,
  }

  const { supabase } = gate

  if (input.id) {
    const { data, error } = await supabase
      .from("dining_tables")
      .update(payload)
      .eq("id", input.id)
      .eq("pop_id", popId)
      .is("deleted_at", null)
      .select(MESAS_TABLE_SELECT)
      .single()

    if (error || !data) {
      return {
        success: false,
        error: error?.message || "No se pudo actualizar la mesa.",
      }
    }

    return {
      success: true,
      table: mapMesasTableRow(data),
    }
  }

  const { data, error } = await supabase
    .from("dining_tables")
    .insert(payload)
    .select(MESAS_TABLE_SELECT)
    .single()

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "No se pudo crear la mesa.",
    }
  }

  return {
    success: true,
    table: mapMesasTableRow(data),
  }
}

export async function deleteMesasTable(
  popId: string,
  routeSiteId: string,
  tableId: string,
): Promise<{ success: true } | { success: false; error: string; redirect?: string }> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const { error } = await gate.supabase
    .from("dining_tables")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", tableId)
    .eq("pop_id", popId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function upsertMesasFloorDecor(
  popId: string,
  routeSiteId: string,
  input: UpsertMesasFloorDecorInput,
): Promise<
  | { success: true; decor: MesasFloorDecorRow }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  if (!DECOR_KINDS.includes(input.kind)) {
    return { success: false, error: "Tipo de elemento no válido." }
  }
  if (!input.salonId) {
    return { success: false, error: "Elegí un salón para el elemento." }
  }

  const payload = {
    pop_id: popId,
    salon_id: input.salonId,
    kind: input.kind,
    pos_x: parsePos(input.x),
    pos_y: parsePos(input.y),
    width: parsePositiveInt(input.width, 48),
    height: parsePositiveInt(input.height, 48),
    label: input.label.trim(),
    sort_order: input.sortOrder,
    is_active: input.isActive,
  }

  const { supabase } = gate

  if (input.id) {
    const { data, error } = await supabase
      .from("dining_floor_decors")
      .update(payload)
      .eq("id", input.id)
      .eq("pop_id", popId)
      .is("deleted_at", null)
      .select(MESAS_DECOR_SELECT)
      .single()

    if (error || !data) {
      return {
        success: false,
        error: error?.message || "No se pudo actualizar el elemento.",
      }
    }

    const decor = mapMesasDecorRow(data)
    if (!decor) {
      return { success: false, error: "Tipo de elemento no válido." }
    }

    return { success: true, decor }
  }

  const { data, error } = await supabase
    .from("dining_floor_decors")
    .insert(payload)
    .select(MESAS_DECOR_SELECT)
    .single()

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "No se pudo crear el elemento.",
    }
  }

  const decor = mapMesasDecorRow(data)
  if (!decor) {
    return { success: false, error: "Tipo de elemento no válido." }
  }

  return { success: true, decor }
}

export async function deleteMesasFloorDecor(
  popId: string,
  routeSiteId: string,
  decorId: string,
): Promise<{ success: true } | { success: false; error: string; redirect?: string }> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const { error } = await gate.supabase
    .from("dining_floor_decors")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", decorId)
    .eq("pop_id", popId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function saveMesasLayoutPositions(
  popId: string,
  routeSiteId: string,
  input: {
    tables?: { id: string; x: number; y: number; rotation?: number }[]
    decors?: { id: string; x: number; y: number; rotation?: number }[]
  },
): Promise<{ success: true } | { success: false; error: string; redirect?: string }> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const { supabase } = gate
  const tables = input.tables ?? []
  const decors = input.decors ?? []

  for (const table of tables) {
    const patch: Record<string, number> = {
      pos_x: parsePos(table.x),
      pos_y: parsePos(table.y),
    }
    if (table.rotation !== undefined) {
      patch.rotation_deg = parseRotation(table.rotation)
    }

    const { error } = await supabase
      .from("dining_tables")
      .update(patch)
      .eq("id", table.id)
      .eq("pop_id", popId)
      .is("deleted_at", null)

    if (error) {
      return { success: false, error: error.message }
    }
  }

  for (const decor of decors) {
    const patch: Record<string, number> = {
      pos_x: parsePos(decor.x),
      pos_y: parsePos(decor.y),
    }
    if (decor.rotation !== undefined) {
      patch.rotation_deg = parseRotation(decor.rotation)
    }

    const { error } = await supabase
      .from("dining_floor_decors")
      .update(patch)
      .eq("id", decor.id)
      .eq("pop_id", popId)
      .is("deleted_at", null)

    if (error) {
      return { success: false, error: error.message }
    }
  }

  return { success: true }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim())
}

function normalizeTableSessionTableIds(
  primaryTableId: string,
  extraTableIds: string[],
): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of [primaryTableId, ...extraTableIds]) {
    const trimmed = id.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    out.push(trimmed)
  }
  return out
}

function mapTableSessionRow(row: {
  id: string
  dining_table_id: string
  waiter_user_id: string | null
  guest_count: number | null
  notes: string | null
  opened_at: string
  updated_at: string
  metadata: unknown
  table_session_tables: { dining_table_id: string }[] | null
}): MesaSessionRow {
  const extraIds = (row.table_session_tables ?? []).map((t) => t.dining_table_id)
  return {
    id: row.id,
    tableIds: normalizeTableSessionTableIds(row.dining_table_id, extraIds),
    waiterId: row.waiter_user_id ?? "",
    guestCount: row.guest_count ?? null,
    note: row.notes?.trim() ?? "",
    openedAt: row.opened_at,
    updatedAt: row.updated_at,
    checkout: readCheckoutFromSessionMetadata(row.metadata),
    floorStatus: readFloorStatusFromSessionMetadata(row.metadata),
  }
}

export type MesaSessionRow = {
  id: string
  tableIds: string[]
  waiterId: string
  guestCount: number | null
  note: string
  openedAt: string
  updatedAt: string
  checkout: TableSessionCheckoutSnapshot | null
  floorStatus: MesaSessionFloorStatus
}

export type TableSessionMutationInput = {
  tableIds: string[]
  waiterId?: string
  guestCount?: number | null
  note?: string
}

const TABLE_SESSION_SELECT = `
  id,
  dining_table_id,
  waiter_user_id,
  guest_count,
  notes,
  opened_at,
  updated_at,
  metadata,
  table_session_tables ( dining_table_id )
`

export async function getOpenTableSessions(
  popId: string,
  routeSiteId: string,
): Promise<
  | { success: true; sessions: MesaSessionRow[] }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "read")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const { supabase } = gate
  const { data, error } = await supabase
    .from("table_sessions")
    .select(TABLE_SESSION_SELECT)
    .eq("pop_id", popId)
    .eq("status", "open")
    .order("opened_at")

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    sessions: (data ?? []).map((row) =>
      mapTableSessionRow(
        row as unknown as Parameters<typeof mapTableSessionRow>[0],
      ),
    ),
  }
}

export async function getOpenTableSessionById(
  popId: string,
  routeSiteId: string,
  sessionId: string,
): Promise<
  | { success: true; session: MesaSessionRow | null }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "read")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(sessionId)) {
    return { success: false, error: "Sesión inválida." }
  }

  const { supabase } = gate
  const { data, error } = await supabase
    .from("table_sessions")
    .select(TABLE_SESSION_SELECT)
    .eq("id", sessionId)
    .eq("pop_id", popId)
    .eq("status", "open")
    .maybeSingle()

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data) {
    return { success: true, session: null }
  }

  return {
    success: true,
    session: mapTableSessionRow(
      data as unknown as Parameters<typeof mapTableSessionRow>[0],
    ),
  }
}

export async function openTableSession(
  popId: string,
  routeSiteId: string,
  input: TableSessionMutationInput,
): Promise<
  | { success: true; session: MesaSessionRow }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "create")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const tableIds = normalizeTableSessionTableIds(
    input.tableIds[0] ?? "",
    input.tableIds.slice(1),
  )
  if (tableIds.length === 0) {
    return { success: false, error: "Seleccioná al menos una mesa." }
  }
  if (!tableIds.every(isUuid)) {
    return { success: false, error: "Identificador de mesa inválido." }
  }

  const waiterId = input.waiterId?.trim() ?? ""
  if (waiterId && !isUuid(waiterId)) {
    return { success: false, error: "Mozo inválido." }
  }

  const guestCount =
    input.guestCount != null && Number.isFinite(input.guestCount)
      ? Math.max(1, Math.min(50, Math.round(input.guestCount)))
      : null

  const { supabase, userId } = gate
  const primaryTableId = tableIds[0]
  const mergedTableIds = tableIds.slice(1)

  const { error: reservationSeatErr } = await supabase
    .from("table_reservations")
    .update({ status: "seated" })
    .eq("pop_id", popId)
    .in("dining_table_id", tableIds)
    .in("status", ["pending", "confirmed"])

  if (reservationSeatErr) {
    return { success: false, error: reservationSeatErr.message }
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("table_sessions")
    .insert({
      pop_id: popId,
      dining_table_id: primaryTableId,
      status: "open",
      guest_count: guestCount,
      notes: input.note?.trim() ?? "",
      waiter_user_id: waiterId || null,
      opened_by: userId,
    })
    .select(TABLE_SESSION_SELECT)
    .single()

  if (insertErr || !inserted) {
    return {
      success: false,
      error: insertErr?.message || "No se pudo abrir la mesa.",
    }
  }

  const sessionId = inserted.id as string

  if (mergedTableIds.length > 0) {
    const { error: mergeErr } = await supabase.from("table_session_tables").insert(
      mergedTableIds.map((diningTableId) => ({
        table_session_id: sessionId,
        dining_table_id: diningTableId,
      })),
    )

    if (mergeErr) {
      await supabase.from("table_sessions").delete().eq("id", sessionId)
      return { success: false, error: mergeErr.message }
    }

    const { data: refreshed, error: refreshErr } = await supabase
      .from("table_sessions")
      .select(TABLE_SESSION_SELECT)
      .eq("id", sessionId)
      .single()

    if (refreshErr || !refreshed) {
      return {
        success: false,
        error: refreshErr?.message || "No se pudo leer la sesión creada.",
      }
    }

    return {
      success: true,
      session: mapTableSessionRow(
        refreshed as unknown as Parameters<typeof mapTableSessionRow>[0],
      ),
    }
  }

  return {
    success: true,
    session: mapTableSessionRow(
      inserted as unknown as Parameters<typeof mapTableSessionRow>[0],
    ),
  }
}

export async function updateTableSession(
  popId: string,
  routeSiteId: string,
  sessionId: string,
  input: TableSessionMutationInput,
): Promise<
  | { success: true; session: MesaSessionRow }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(sessionId)) {
    return { success: false, error: "Sesión inválida." }
  }

  const tableIds = normalizeTableSessionTableIds(
    input.tableIds[0] ?? "",
    input.tableIds.slice(1),
  )
  if (tableIds.length === 0) {
    return { success: false, error: "Seleccioná al menos una mesa." }
  }
  if (!tableIds.every(isUuid)) {
    return { success: false, error: "Identificador de mesa inválido." }
  }

  const waiterId = input.waiterId?.trim() ?? ""
  if (waiterId && !isUuid(waiterId)) {
    return { success: false, error: "Mozo inválido." }
  }

  const guestCount =
    input.guestCount != null && Number.isFinite(input.guestCount)
      ? Math.max(1, Math.min(50, Math.round(input.guestCount)))
      : null

  const { supabase } = gate
  const primaryTableId = tableIds[0]
  const mergedTableIds = tableIds.slice(1)

  const { data: existing, error: existingErr } = await supabase
    .from("table_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("pop_id", popId)
    .eq("status", "open")
    .maybeSingle()

  if (existingErr) {
    return { success: false, error: existingErr.message }
  }
  if (!existing) {
    return { success: false, error: "La sesión no está abierta o no existe." }
  }

  const { error: updateErr } = await supabase
    .from("table_sessions")
    .update({
      dining_table_id: primaryTableId,
      guest_count: guestCount,
      notes: input.note?.trim() ?? "",
      waiter_user_id: waiterId || null,
    })
    .eq("id", sessionId)
    .eq("pop_id", popId)
    .eq("status", "open")

  if (updateErr) {
    return { success: false, error: updateErr.message }
  }

  const { error: deleteMergeErr } = await supabase
    .from("table_session_tables")
    .delete()
    .eq("table_session_id", sessionId)

  if (deleteMergeErr) {
    return { success: false, error: deleteMergeErr.message }
  }

  if (mergedTableIds.length > 0) {
    const { error: mergeErr } = await supabase.from("table_session_tables").insert(
      mergedTableIds.map((diningTableId) => ({
        table_session_id: sessionId,
        dining_table_id: diningTableId,
      })),
    )
    if (mergeErr) {
      return { success: false, error: mergeErr.message }
    }
  }

  const { data: refreshed, error: refreshErr } = await supabase
    .from("table_sessions")
    .select(TABLE_SESSION_SELECT)
    .eq("id", sessionId)
    .single()

  if (refreshErr || !refreshed) {
    return {
      success: false,
      error: refreshErr?.message || "No se pudo leer la sesión actualizada.",
    }
  }

  return {
    success: true,
    session: mapTableSessionRow(
      refreshed as unknown as Parameters<typeof mapTableSessionRow>[0],
    ),
  }
}

export async function closeTableSession(
  popId: string,
  routeSiteId: string,
  sessionId: string,
  reason: "cancelled" | "closed" = "cancelled",
): Promise<
  | { success: true }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(sessionId)) {
    return { success: false, error: "Sesión inválida." }
  }

  const { supabase, userId } = gate
  const { data, error } = await supabase
    .from("table_sessions")
    .update({
      status: reason,
      closed_at: new Date().toISOString(),
      closed_by: userId,
    })
    .eq("id", sessionId)
    .eq("pop_id", popId)
    .eq("status", "open")
    .select("id")
    .maybeSingle()

  if (error) {
    return { success: false, error: error.message }
  }
  if (!data) {
    return { success: false, error: "La sesión no está abierta o no existe." }
  }

  return { success: true }
}

export async function closeTableSessionCheckout(
  popId: string,
  routeSiteId: string,
  sessionId: string,
  _mode: "settle" | "release",
): Promise<
  | { success: true }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(sessionId)) {
    return { success: false, error: "Sesión inválida." }
  }

  const { supabase } = gate

  const { data: session, error: sessionErr } = await supabase
    .from("table_sessions")
    .select("id, metadata, status")
    .eq("id", sessionId)
    .eq("pop_id", popId)
    .eq("status", "open")
    .maybeSingle()

  if (sessionErr) {
    return { success: false, error: sessionErr.message }
  }
  if (!session) {
    return { success: false, error: "La sesión no está abierta o no existe." }
  }

  const checkout = readCheckoutFromSessionMetadata(session.metadata)
  const carrito = checkout?.carrito ?? []
  const totalPagadoAcumulado = checkout?.totalPagadoAcumulado ?? 0
  const paidPartialUnits = checkout?.paidPartialUnits ?? {}
  const hasPayment =
    totalPagadoAcumulado > 0 ||
    Object.values(paidPartialUnits).some((value) => Number(value) > 0)
  const unpaidCarrito = buildUnpaidCarrito({
    carrito,
    paidPartialUnits,
    quantityDealApplications: [],
  })
  const hasUnpaidItems = unpaidCarrito.length > 0

  const { count: salesCount, error: salesCountErr } = await supabase
    .from("sales")
    .select("id", { count: "exact", head: true })
    .eq("pop_id", popId)
    .eq("table_session_id", sessionId)
    .eq("status", "completed")

  if (salesCountErr) {
    return { success: false, error: salesCountErr.message }
  }

  const hasSales = (salesCount ?? 0) > 0

  if (hasUnpaidItems) {
    return {
      success: false,
      error: "Hay ítems sin cobrar. Cobrá el pedido antes de liberar la mesa.",
    }
  }

  // Mesa vacía: sin ventas ni cobros registrados en el checkout.
  if (!hasSales && !hasPayment) {
    return closeTableSession(popId, routeSiteId, sessionId, "closed")
  }

  // Hay ventas o cobros: verificar que no quede saldo pendiente.
  if (hasSales) {
    const { data: salesRows, error: salesErr } = await supabase
      .from("sales")
      .select("metadata")
      .eq("pop_id", popId)
      .eq("table_session_id", sessionId)
      .eq("status", "completed")
      .order("sold_at", { ascending: false })

    if (salesErr) {
      return { success: false, error: salesErr.message }
    }

    let maxOrderTotal = 0
    let maxPaidAccumulated = 0
    for (const row of salesRows ?? []) {
      const metadata =
        row.metadata &&
        typeof row.metadata === "object" &&
        !Array.isArray(row.metadata)
          ? (row.metadata as Record<string, unknown>)
          : {}
      const orderTotal = Number(metadata.channel_order_total)
      const paidAccumulated = Number(metadata.channel_paid_accumulated)
      if (Number.isFinite(orderTotal)) {
        maxOrderTotal = Math.max(maxOrderTotal, orderTotal)
      }
      if (Number.isFinite(paidAccumulated)) {
        maxPaidAccumulated = Math.max(maxPaidAccumulated, paidAccumulated)
      }
    }

    const paidFromSalesMetadata =
      maxOrderTotal <= 0 ||
      maxPaidAccumulated + 0.009 >= maxOrderTotal
    const paidFromCheckout =
      maxOrderTotal > 0 && totalPagadoAcumulado + 0.009 >= maxOrderTotal

    if (maxOrderTotal > 0 && !paidFromSalesMetadata && !paidFromCheckout) {
      return {
        success: false,
        error: "La mesa aún tiene saldo pendiente de cobro.",
      }
    }

    return closeTableSession(popId, routeSiteId, sessionId, "closed")
  }

  // Cobros en checkout sin ventas vinculadas (estado inconsistente): permitir si no hay ítems pendientes.
  if (hasPayment) {
    return closeTableSession(popId, routeSiteId, sessionId, "closed")
  }

  return {
    success: false,
    error: "No hay cobros registrados para liberar esta mesa.",
  }
}

export async function saveTableSessionCheckout(
  popId: string,
  routeSiteId: string,
  sessionId: string,
  checkout: TableSessionCheckoutSnapshot,
): Promise<
  | { success: true; updatedAt: string }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(sessionId)) {
    return { success: false, error: "Sesión inválida." }
  }

  const { supabase } = gate

  const { data: existing, error: existingErr } = await supabase
    .from("table_sessions")
    .select("id, metadata")
    .eq("id", sessionId)
    .eq("pop_id", popId)
    .eq("status", "open")
    .maybeSingle()

  if (existingErr) {
    return { success: false, error: existingErr.message }
  }
  if (!existing) {
    return { success: false, error: "La sesión no está abierta o no existe." }
  }

  const metadata =
    existing.metadata && typeof existing.metadata === "object" && !Array.isArray(existing.metadata)
      ? { ...(existing.metadata as Record<string, unknown>) }
      : {}

  metadata.checkout = checkout

  const { data, error } = await supabase
    .from("table_sessions")
    .update({ metadata })
    .eq("id", sessionId)
    .eq("pop_id", popId)
    .eq("status", "open")
    .select("updated_at")
    .single()

  if (error || !data?.updated_at) {
    return {
      success: false,
      error: error?.message || "No se pudo guardar el pedido de la mesa.",
    }
  }

  return { success: true, updatedAt: data.updated_at as string }
}

export async function setTableSessionFloorStatus(
  popId: string,
  routeSiteId: string,
  sessionId: string,
  floorStatus: MesaSessionFloorStatus,
): Promise<
  | { success: true; floorStatus: MesaSessionFloorStatus; updatedAt: string }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(sessionId)) {
    return { success: false, error: "Sesión inválida." }
  }

  const { supabase } = gate

  const { data: existing, error: existingErr } = await supabase
    .from("table_sessions")
    .select("id, metadata")
    .eq("id", sessionId)
    .eq("pop_id", popId)
    .eq("status", "open")
    .maybeSingle()

  if (existingErr) {
    return { success: false, error: existingErr.message }
  }
  if (!existing) {
    return { success: false, error: "La sesión no está abierta o no existe." }
  }

  const metadata =
    existing.metadata && typeof existing.metadata === "object" && !Array.isArray(existing.metadata)
      ? { ...(existing.metadata as Record<string, unknown>) }
      : {}

  const floorStatusValue = floorStatusToSessionMetadataValue(floorStatus)
  if (floorStatusValue) {
    metadata.floor_status = floorStatusValue
  } else {
    delete metadata.floor_status
  }

  const { data, error } = await supabase
    .from("table_sessions")
    .update({ metadata })
    .eq("id", sessionId)
    .eq("pop_id", popId)
    .eq("status", "open")
    .select("updated_at")
    .single()

  if (error || !data?.updated_at) {
    return {
      success: false,
      error: error?.message || "No se pudo actualizar el estado de la mesa.",
    }
  }

  return {
    success: true,
    floorStatus,
    updatedAt: data.updated_at as string,
  }
}

export type MesaReservationRow = {
  id: string
  tableId: string | null
  clientId: string | null
  clientName: string
  guestCount: number | null
  arrivalAt: string
  status: MesaReservationStatus
  note: string
  updatedAt: string
}

const TABLE_RESERVATION_SELECT = `
  id,
  dining_table_id,
  client_id,
  client_name,
  guest_count,
  arrival_at,
  status,
  notes,
  updated_at
`

function parseReservationStatus(raw: unknown): MesaReservationStatus {
  const value = typeof raw === "string" ? raw.trim() : ""
  if (
    value === "pending" ||
    value === "confirmed" ||
    value === "seated" ||
    value === "completed" ||
    value === "no_show" ||
    value === "cancelled"
  ) {
    return value
  }
  return "confirmed"
}

function mapTableReservationRow(row: {
  id: string
  dining_table_id: string | null
  client_id: string | null
  client_name: string | null
  guest_count: number | null
  arrival_at: string
  status: string | null
  notes: string | null
  updated_at: string
}): MesaReservationRow {
  const guestCount =
    row.guest_count != null && Number.isFinite(row.guest_count)
      ? Math.max(1, Math.min(50, Math.round(row.guest_count)))
      : null

  return {
    id: row.id,
    tableId: row.dining_table_id,
    clientId: row.client_id,
    clientName: row.client_name?.trim() ?? "",
    guestCount,
    arrivalAt: row.arrival_at,
    status: parseReservationStatus(row.status),
    note: row.notes?.trim() ?? "",
    updatedAt: row.updated_at,
  }
}

export async function getTableReservations(
  popId: string,
  routeSiteId: string,
): Promise<
  | { success: true; reservations: MesaReservationRow[] }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "read")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const { supabase } = gate
  const { data, error } = await supabase
    .from("table_reservations")
    .select(TABLE_RESERVATION_SELECT)
    .eq("pop_id", popId)
    .order("arrival_at")

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    reservations: (data ?? []).map((row) =>
      mapTableReservationRow(
        row as unknown as Parameters<typeof mapTableReservationRow>[0],
      ),
    ),
  }
}

export async function upsertTableReservation(
  popId: string,
  routeSiteId: string,
  input: MesaReservationInput,
): Promise<
  | { success: true; reservation: MesaReservationRow }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const tableIdRaw = input.tableId?.trim() ?? ""
  const tableId = tableIdRaw && isUuid(tableIdRaw) ? tableIdRaw : null
  if (tableIdRaw && !tableId) {
    return { success: false, error: "Mesa inválida." }
  }

  const clientId = input.clientId?.trim() ?? ""
  if (clientId && !isUuid(clientId)) {
    return { success: false, error: "Cliente inválido." }
  }

  const clientName = input.clientName?.trim() ?? ""
  if (!clientId && !clientName) {
    return { success: false, error: "Indicá un cliente para la reserva." }
  }

  const arrivalAt = input.arrivalAt?.trim() ?? ""
  if (!arrivalAt || Number.isNaN(Date.parse(arrivalAt))) {
    return { success: false, error: "Indicá una hora de llegada válida." }
  }

  const reservationId = input.reservationId?.trim() ?? ""
  if (reservationId && !isUuid(reservationId)) {
    return { success: false, error: "Reserva inválida." }
  }

  const guestCount =
    input.guestCount != null && Number.isFinite(input.guestCount)
      ? Math.max(1, Math.min(50, Math.round(input.guestCount)))
      : null

  const status = input.status ? parseReservationStatus(input.status) : "confirmed"

  const { supabase } = gate
  const payload = {
    pop_id: popId,
    dining_table_id: tableId,
    client_id: clientId || null,
    client_name: clientName,
    guest_count: guestCount,
    arrival_at: arrivalAt,
    status,
    notes: input.note?.trim() ?? "",
  }

  if (reservationId) {
    const { data: existing, error: existingErr } = await supabase
      .from("table_reservations")
      .select("status")
      .eq("id", reservationId)
      .eq("pop_id", popId)
      .maybeSingle()

    if (existingErr) {
      return { success: false, error: existingErr.message }
    }
    if (!existing) {
      return { success: false, error: "La reserva no existe." }
    }
    if (
      existing.status === "seated" ||
      existing.status === "completed" ||
      existing.status === "cancelled"
    ) {
      return {
        success: false,
        error: "No se puede editar una reserva cerrada o cancelada.",
      }
    }

    const { data, error } = await supabase
      .from("table_reservations")
      .update(payload)
      .eq("id", reservationId)
      .eq("pop_id", popId)
      .select(TABLE_RESERVATION_SELECT)
      .single()

    if (error || !data) {
      return {
        success: false,
        error: error?.message || "No se pudo actualizar la reserva.",
      }
    }

    return {
      success: true,
      reservation: mapTableReservationRow(
        data as unknown as Parameters<typeof mapTableReservationRow>[0],
      ),
    }
  }

  const { data, error } = await supabase
    .from("table_reservations")
    .insert(payload)
    .select(TABLE_RESERVATION_SELECT)
    .single()

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "No se pudo guardar la reserva.",
    }
  }

  return {
    success: true,
    reservation: mapTableReservationRow(
      data as unknown as Parameters<typeof mapTableReservationRow>[0],
    ),
  }
}

export async function cancelTableReservation(
  popId: string,
  routeSiteId: string,
  reservationId: string,
): Promise<
  | { success: true }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(reservationId)) {
    return { success: false, error: "Reserva inválida." }
  }

  const { supabase } = gate
  const { data, error } = await supabase
    .from("table_reservations")
    .update({ status: "cancelled" })
    .eq("id", reservationId)
    .eq("pop_id", popId)
    .in("status", ["pending", "confirmed"])
    .select("id")
    .maybeSingle()

  if (error) {
    return { success: false, error: error.message }
  }
  if (!data) {
    return { success: false, error: "La reserva no existe o ya fue cerrada." }
  }

  return { success: true }
}

export async function updateTableReservationStatus(
  popId: string,
  routeSiteId: string,
  reservationId: string,
  status: MesaReservationStatus,
): Promise<
  | { success: true; reservation: MesaReservationRow }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }
  if (!isUuid(reservationId)) {
    return { success: false, error: "Reserva inválida." }
  }

  const allowed: MesaReservationStatus[] = [
    "pending",
    "confirmed",
    "seated",
    "completed",
    "no_show",
    "cancelled",
  ]
  if (!allowed.includes(status)) {
    return { success: false, error: "Estado de reserva inválido." }
  }

  const { supabase } = gate
  const { data, error } = await supabase
    .from("table_reservations")
    .update({ status })
    .eq("id", reservationId)
    .eq("pop_id", popId)
    .select(TABLE_RESERVATION_SELECT)
    .single()

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "No se pudo actualizar la reserva.",
    }
  }

  return {
    success: true,
    reservation: mapTableReservationRow(
      data as unknown as Parameters<typeof mapTableReservationRow>[0],
    ),
  }
}

export async function getMesasReservationSettings(
  popId: string,
  routeSiteId: string,
): Promise<
  | { success: true; settings: MesasReservationSettings }
  | { success: false; error: string; redirect?: string }
> {
  const gate = await requireMesasAccess(popId, routeSiteId, "read")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const { supabase } = gate
  const { data, error } = await supabase
    .from("pops")
    .select("settings")
    .eq("id", popId)
    .maybeSingle()

  if (error) {
    return { success: false, error: error.message }
  }

  const popSettings =
    data?.settings && typeof data.settings === "object"
      ? (data.settings as Record<string, unknown>)
      : null

  return {
    success: true,
    settings: readMesasReservationSettings(popSettings),
  }
}

export type MesasReservationSettingsInput = {
  floorBufferMinutes: number
  graceMinutes: number
}

export async function updateMesasReservationSettings(
  popId: string,
  routeSiteId: string,
  input: MesasReservationSettingsInput,
): Promise<{ success: true } | { success: false; error: string; redirect?: string }> {
  const gate = await requireMesasAccess(popId, routeSiteId, "update")
  if (!gate.ok) {
    return { success: false, error: gate.error, redirect: gate.redirect }
  }

  const settings = readMesasReservationSettings({
    mesas: {
      reservationFloorBufferMinutes: input.floorBufferMinutes,
      reservationGraceMinutes: input.graceMinutes,
    },
  })

  const { supabase } = gate
  const { data: popRow, error: readError } = await supabase
    .from("pops")
    .select("settings")
    .eq("id", popId)
    .maybeSingle()

  if (readError) {
    return { success: false, error: readError.message }
  }

  const currentSettings =
    popRow?.settings && typeof popRow.settings === "object"
      ? { ...(popRow.settings as Record<string, unknown>) }
      : {}

  const currentMesas =
    currentSettings.mesas &&
    typeof currentSettings.mesas === "object" &&
    !Array.isArray(currentSettings.mesas)
      ? { ...(currentSettings.mesas as Record<string, unknown>) }
      : {}

  currentSettings.mesas = {
    ...currentMesas,
    reservationFloorBufferMinutes: settings.floorBufferMinutes,
    reservationGraceMinutes: settings.graceMinutes,
  }

  const { error: updateError } = await supabase
    .from("pops")
    .update({
      settings: currentSettings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", popId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true }
}
