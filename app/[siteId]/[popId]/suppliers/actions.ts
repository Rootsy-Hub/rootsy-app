"use server"

import {
  POP_PERMS,
  permissionKeysInclude,
} from "@/lib/popPermissionConstants"
import {
  getPopById,
  getPopSiteId,
  validatePopAccess,
} from "@/lib/popHelpers"
import { popMenuHref } from "@/lib/popRoutes"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { createClient } from "@/utils/supabase/server"
import { CLIENT_IVA_CONDITION_VALUES } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"

function normalizeIvaCondition(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  return (CLIENT_IVA_CONDITION_VALUES as readonly string[]).includes(t)
    ? t
    : null
}

export type SupplierTableRow = {
  id: string
  name: string
  email: string
  phone: string
  taxId: string
  notes: string
  ivaCondition: string | null
  addressLine: string
  isActive: boolean
}

export type UpsertPopSupplierInput = {
  name: string
  email: string
  phone: string
  taxId: string
  notes: string
  ivaCondition: string
  addressLine: string
  isActive: boolean
}

function mapSupplierRow(r: {
  id: unknown
  name: unknown
  email: unknown
  phone: unknown
  tax_id: unknown
  notes: unknown
  iva_condition: unknown
  address_line: unknown
  is_active: unknown
}): SupplierTableRow {
  return {
    id: String(r.id),
    name: String(r.name ?? ""),
    email: String(r.email ?? ""),
    phone: String(r.phone ?? ""),
    taxId: String(r.tax_id ?? ""),
    notes: String(r.notes ?? ""),
    ivaCondition:
      r.iva_condition != null && String(r.iva_condition).trim()
        ? String(r.iva_condition)
        : null,
    addressLine: String(r.address_line ?? ""),
    isActive: r.is_active !== false,
  }
}

const SUPPLIER_SELECT =
  "id, name, email, phone, tax_id, notes, iva_condition, address_line, is_active"

export async function createPopSupplier(
  popId: string,
  input: UpsertPopSupplierInput,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.SUPPLIER_CREATE.resource,
        POP_PERMS.SUPPLIER_CREATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para crear proveedores." }
    }
    const name = input.name.trim()
    if (!name) {
      return { success: false, error: "El nombre es obligatorio." }
    }
    const supabase = await createClient()
    const { error } = await supabase.from("suppliers").insert({
      pop_id: popId,
      name,
      email: input.email.trim() || null,
      phone: input.phone.trim() || null,
      tax_id: input.taxId.trim() || null,
      notes: input.notes.trim() || null,
      iva_condition: normalizeIvaCondition(input.ivaCondition),
      address_line: input.addressLine.trim() || null,
      is_active: input.isActive,
    })
    if (error) {
      return { success: false, error: error.message || "No se pudo crear." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function updatePopSupplier(
  popId: string,
  supplierId: string,
  input: UpsertPopSupplierInput,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.SUPPLIER_UPDATE.resource,
        POP_PERMS.SUPPLIER_UPDATE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para editar proveedores." }
    }
    const name = input.name.trim()
    if (!name) {
      return { success: false, error: "El nombre es obligatorio." }
    }
    const supabase = await createClient()
    const { error } = await supabase
      .from("suppliers")
      .update({
        name,
        email: input.email.trim() || null,
        phone: input.phone.trim() || null,
        tax_id: input.taxId.trim() || null,
        notes: input.notes.trim() || null,
        iva_condition: normalizeIvaCondition(input.ivaCondition),
        address_line: input.addressLine.trim() || null,
        is_active: input.isActive,
      })
      .eq("id", supplierId)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo guardar." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function deletePopSupplier(
  popId: string,
  supplierId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.SUPPLIER_DELETE.resource,
        POP_PERMS.SUPPLIER_DELETE.action,
      )
    ) {
      return { success: false, error: "Sin permiso para eliminar proveedores." }
    }
    const supabase = await createClient()
    const { error } = await supabase
      .from("suppliers")
      .delete()
      .eq("id", supplierId)
      .eq("pop_id", popId)
    if (error) {
      return { success: false, error: error.message || "No se pudo eliminar." }
    }
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}

export async function getPopSuppliersTable(popId: string): Promise<
  | {
      success: true
      suppliers: SupplierTableRow[]
      popName: string
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
  | {
      success: false
      error: string
      redirect?: string
      suppliers: SupplierTableRow[]
      popName?: string
      canCreate: boolean
      canUpdate: boolean
      canDelete: boolean
    }
> {
  const empty = {
    suppliers: [] as SupplierTableRow[],
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  }
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return {
        success: false,
        error: access.error || "Sin acceso",
        redirect: "/home",
        ...empty,
        popName: "",
      }
    }
    const snap = await loadPopPermissionsSnapshot(popId)
    if (
      !permissionKeysInclude(
        snap.keys,
        POP_PERMS.SUPPLIER_READ.resource,
        POP_PERMS.SUPPLIER_READ.action,
      )
    ) {
      return {
        success: false,
        error: "No tenés permiso para ver proveedores en este punto.",
        redirect: popMenuHref(await getPopSiteId(popId), popId),
        ...empty,
        popName: "",
      }
    }
    const canCreate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.SUPPLIER_CREATE.resource,
      POP_PERMS.SUPPLIER_CREATE.action,
    )
    const canUpdate = permissionKeysInclude(
      snap.keys,
      POP_PERMS.SUPPLIER_UPDATE.resource,
      POP_PERMS.SUPPLIER_UPDATE.action,
    )
    const canDelete = permissionKeysInclude(
      snap.keys,
      POP_PERMS.SUPPLIER_DELETE.resource,
      POP_PERMS.SUPPLIER_DELETE.action,
    )
    const popRes = await getPopById(popId)
    const popName =
      popRes.success && popRes.pop ? String(popRes.pop.name ?? "") : ""
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("suppliers")
      .select(SUPPLIER_SELECT)
      .eq("pop_id", popId)
      .order("name", { ascending: true })
    if (error) {
      return {
        success: false,
        error: error.message || "No se pudieron cargar los proveedores.",
        ...empty,
        popName,
      }
    }
    const suppliers: SupplierTableRow[] = (data || []).map(mapSupplierRow)
    return {
      success: true,
      suppliers,
      popName,
      canCreate,
      canUpdate,
      canDelete,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return {
      success: false,
      error: message,
      ...empty,
      popName: "",
    }
  }
}
